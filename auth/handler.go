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
		w.WriteHeader(http.StatusTooManyRequests)
		fmt.Fprintf(w, `{"error":"too many login attempts, try again later"}`)
		return
	}

	var req loginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"invalid request body"}`, http.StatusBadRequest)
		return
	}

	if req.Username == "" || req.Password == "" {
		http.Error(w, `{"error":"username and password required"}`, http.StatusBadRequest)
		return
	}

	if err := PAMAuthenticate(h.pamService, req.Username, req.Password); err != nil {
		h.rateLimiter.RecordAttempt(ip)
		if errors.Is(err, ErrAuthUnavailable) {
			fmt.Printf("auth: PAM unavailable: %v\n", err)
		}
		http.Error(w, `{"error":"invalid credentials"}`, http.StatusUnauthorized)
		return
	}

	h.rateLimiter.ClearAttempts(ip)

	token, err := h.sessions.CreateSession(req.Username)
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
		"user": user,
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
		http.Error(w, `{"error":"authentication required"}`, http.StatusUnauthorized)
		return
	}

	var req passwordRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"invalid request body"}`, http.StatusBadRequest)
		return
	}

	if req.CurrentPassword == "" || req.NewPassword == "" {
		http.Error(w, `{"error":"current_password and new_password required"}`, http.StatusBadRequest)
		return
	}

	if len(req.NewPassword) < 8 {
		http.Error(w, `{"error":"new password must be at least 8 characters"}`, http.StatusBadRequest)
		return
	}

	if err := PAMAuthenticate(h.pamService, username, req.CurrentPassword); err != nil {
		http.Error(w, `{"error":"current password is incorrect"}`, http.StatusUnauthorized)
		return
	}

	if err := SetPassword(username, req.NewPassword); err != nil {
		serverError(w, err)
		return
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
		http.Error(w, `{"error":"username and password required"}`, http.StatusBadRequest)
		return
	}

	if len(req.Password) < 8 {
		http.Error(w, `{"error":"password must be at least 8 characters"}`, http.StatusBadRequest)
		return
	}

	if UserExists(req.Username) {
		http.Error(w, `{"error":"username already exists"}`, http.StatusConflict)
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
		http.Error(w, `{"error":"username required"}`, http.StatusBadRequest)
		return
	}

	callerUsername := GetUsername(r)
	if callerUsername == targetUsername {
		http.Error(w, `{"error":"cannot delete your own account"}`, http.StatusBadRequest)
		return
	}

	if !UserExists(targetUsername) {
		http.Error(w, `{"error":"user not found"}`, http.StatusNotFound)
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
