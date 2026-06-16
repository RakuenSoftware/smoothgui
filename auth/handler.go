package auth

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strings"
	"time"
)

// Handler handles /api/auth/* and /api/users* HTTP endpoints.
type Handler struct {
	pamService string
	sessions   *SessionStore
	rateLimiter *RateLimiter
	users      *UserManager
}

// writeJSONErrorCoded writes a JSON error body containing both an
// `error` (English fallback) and a stable `code` field. Frontends
// using SmoothGUI's useExtractError look the code up under
// `error.<code>` in the active i18n catalog so the user sees a
// localised message; consumers that don't translate keep seeing
// the English text.
//
// Codes are dotted lowercase identifiers grouped by surface
// ("auth.invalid_credentials", "auth.session_expired") so they
// remain stable when the human-readable message gets reworded.
func writeJSONErrorCoded(w http.ResponseWriter, message string, status int, code string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(map[string]string{"error": message, "code": code})
}

// NewHandler creates an auth handler with the given dependencies.
func NewHandler(pamService string, sessions *SessionStore, rateLimiter *RateLimiter, users *UserManager) *Handler {
	return &Handler{
		pamService:  pamService,
		sessions:    sessions,
		rateLimiter: rateLimiter,
		users:       users,
	}
}

// --- Login (PAM) ---

type loginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

// Login handles POST /api/auth/login.
func (h *Handler) Login(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, `{"error":"method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	ip := ClientIP(r)
	limited, err := h.rateLimiter.IsLimited(ip)
	if err != nil {
		serverError(w, err)
		return
	}
	if limited {
		writeJSONErrorCoded(w, "too many login attempts, try again later", http.StatusTooManyRequests, "auth.rate_limited")
		return
	}

	var req loginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"invalid request body"}`, http.StatusBadRequest)
		return
	}

	if req.Username == "" || req.Password == "" {
		writeJSONErrorCoded(w, "username and password required", http.StatusBadRequest, "auth.credentials_required")
		return
	}

	mustChange := false
	if err := PAMAuthenticate(h.pamService, req.Username, req.Password); err != nil {
		// A correct-but-expired password is not a failed login: issue a
		// must-change session so the client can drive a forced password change.
		if errors.Is(err, ErrPasswordChangeRequired) {
			mustChange = true
		} else {
			h.rateLimiter.RecordAttempt(ip)
			if errors.Is(err, ErrAuthUnavailable) {
				fmt.Printf("auth: PAM unavailable: %v\n", err)
			}
			writeJSONErrorCoded(w, "invalid credentials", http.StatusUnauthorized, "auth.invalid_credentials")
			return
		}
	}

	h.rateLimiter.ClearAttempts(ip)

	var token string
	if mustChange {
		token, err = h.sessions.CreateSessionMustChange(req.Username)
	} else {
		token, err = h.sessions.CreateSession(req.Username)
	}
	if err != nil {
		serverError(w, err)
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "session",
		Value:    token,
		Path:     "/",
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteStrictMode,
		MaxAge:   int(24 * time.Hour / time.Second),
	})

	user, _ := GetUser(req.Username)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]any{
		"user":        user,
		"must_change": mustChange,
	})
}

// --- Logout ---

// Logout handles POST /api/auth/logout.
func (h *Handler) Logout(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, `{"error":"method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	cookie, err := r.Cookie("session")
	if err == nil {
		h.sessions.DeleteSession(cookie.Value)
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "session",
		Value:    "",
		Path:     "/",
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteStrictMode,
		MaxAge:   -1,
	})

	w.Header().Set("Content-Type", "application/json")
	fmt.Fprintf(w, `{"status":"logged out"}`)
}

// --- Password change ---

type passwordRequest struct {
	CurrentPassword string `json:"current_password"`
	NewPassword     string `json:"new_password"`
}

// ChangePassword handles PUT /api/auth/password.
func (h *Handler) ChangePassword(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPut {
		http.Error(w, `{"error":"method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	username := GetUsername(r)
	if username == "" {
		writeJSONErrorCoded(w, "authentication required", http.StatusUnauthorized, "auth.required")
		return
	}

	var req passwordRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"invalid request body"}`, http.StatusBadRequest)
		return
	}

	if req.CurrentPassword == "" || req.NewPassword == "" {
		writeJSONErrorCoded(w, "current_password and new_password required", http.StatusBadRequest, "auth.password_fields_required")
		return
	}

	if len(req.NewPassword) < 8 {
		writeJSONErrorCoded(w, "new password must be at least 8 characters", http.StatusBadRequest, "auth.new_password_too_short")
		return
	}

	// A correct-but-expired current password (ErrPasswordChangeRequired) is
	// exactly the case this endpoint exists to resolve, so accept it as a
	// valid current credential alongside a clean success.
	if err := PAMAuthenticate(h.pamService, username, req.CurrentPassword); err != nil &&
		!errors.Is(err, ErrPasswordChangeRequired) {
		writeJSONErrorCoded(w, "current password is incorrect", http.StatusUnauthorized, "auth.current_password_incorrect")
		return
	}

	if err := SetPassword(username, req.NewPassword); err != nil {
		serverError(w, err)
		return
	}

	// chpasswd resets the password-age, clearing any forced-expiry; drop the
	// must-change flag so the user's existing session becomes fully usable.
	if err := h.sessions.ClearMustChange(username); err != nil {
		fmt.Printf("auth: clear must-change for %s: %v\n", username, err)
	}

	w.Header().Set("Content-Type", "application/json")
	fmt.Fprintf(w, `{"status":"password updated"}`)
}

// --- User CRUD ---

type createUserRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

// ListUsers handles GET /api/users.
func (h *Handler) ListUsers(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, `{"error":"method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	users, err := h.users.List()
	if err != nil {
		serverError(w, err)
		return
	}

	if users == nil {
		users = []User{}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(users)
}

// CreateUser handles POST /api/users.
func (h *Handler) CreateUser(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, `{"error":"method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	var req createUserRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"invalid request body"}`, http.StatusBadRequest)
		return
	}

	if req.Username == "" || req.Password == "" {
		writeJSONErrorCoded(w, "username and password required", http.StatusBadRequest, "users.credentials_required")
		return
	}

	if len(req.Password) < 8 {
		writeJSONErrorCoded(w, "password must be at least 8 characters", http.StatusBadRequest, "users.password_too_short")
		return
	}

	if UserExists(req.Username) {
		writeJSONErrorCoded(w, "username already exists", http.StatusConflict, "users.username_taken")
		return
	}

	if err := h.users.Create(req.Username, req.Password); err != nil {
		http.Error(w, fmt.Sprintf(`{"error":"%s"}`, err), http.StatusBadRequest)
		return
	}

	user, err := GetUser(req.Username)
	if err != nil {
		serverError(w, err)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(user)
}

// DeleteUser handles DELETE /api/users/{username}.
// The usersPrefix parameter is the URL prefix up to and including the trailing
// slash, e.g. "/api/users/".
func (h *Handler) DeleteUser(w http.ResponseWriter, r *http.Request, usersPrefix string) {
	if r.Method != http.MethodDelete {
		http.Error(w, `{"error":"method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	targetUsername := strings.TrimPrefix(r.URL.Path, usersPrefix)
	if targetUsername == "" {
		writeJSONErrorCoded(w, "username required", http.StatusBadRequest, "users.username_required")
		return
	}

	callerUsername := GetUsername(r)
	if callerUsername == targetUsername {
		writeJSONErrorCoded(w, "cannot delete your own account", http.StatusBadRequest, "users.cannot_delete_self")
		return
	}

	if !UserExists(targetUsername) {
		writeJSONErrorCoded(w, "user not found", http.StatusNotFound, "users.not_found")
		return
	}

	if err := h.users.Delete(targetUsername); err != nil {
		http.Error(w, fmt.Sprintf(`{"error":"%s"}`, err), http.StatusBadRequest)
		return
	}

	h.sessions.DeleteSessionsForUser(targetUsername)

	w.Header().Set("Content-Type", "application/json")
	fmt.Fprintf(w, `{"status":"deleted"}`)
}

// --- helpers ---

// ClientIP extracts the client IP from the request, respecting X-Forwarded-For.
func ClientIP(r *http.Request) string {
	if xff := r.Header.Get("X-Forwarded-For"); xff != "" {
		parts := strings.Split(xff, ",")
		return strings.TrimSpace(parts[0])
	}
	addr := r.RemoteAddr
	if idx := strings.LastIndex(addr, ":"); idx != -1 {
		return addr[:idx]
	}
	return addr
}

func serverError(w http.ResponseWriter, err error) {
	http.Error(w, fmt.Sprintf(`{"error":"internal server error: %s"}`, err), http.StatusInternalServerError)
}
