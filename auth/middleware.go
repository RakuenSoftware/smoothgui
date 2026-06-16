package auth

import (
	"context"
	"encoding/json"
	"net/http"
	"strings"
)

type contextKey string

const usernameKey contextKey = "username"

// mustChangeAllowed reports whether a path may be reached by a session that is
// flagged must-change. Only the password-change and logout endpoints are
// permitted so the user can resolve the forced change (or sign out); every
// other request is rejected with auth.password_change_required. Matched by
// suffix so it is independent of the consumer's API mount prefix.
func mustChangeAllowed(path string) bool {
	return strings.HasSuffix(path, "/auth/password") ||
		strings.HasSuffix(path, "/auth/logout")
}

// RequireAuth is middleware that validates the session cookie.
// On success, it adds the username to the request context.
func RequireAuth(sessions *SessionStore, next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		cookie, err := r.Cookie("session")
		if err != nil {
			writeMiddlewareError(w, "authentication required", http.StatusUnauthorized, "auth.required")
			return
		}

		username, err := sessions.ValidateSession(cookie.Value)
		if err != nil {
			writeMiddlewareError(w, "invalid or expired session", http.StatusUnauthorized, "auth.session_expired")
			return
		}

		// A must-change session may only reach the password-change/logout
		// endpoints until the forced password change is completed.
		if !mustChangeAllowed(r.URL.Path) {
			mustChange, err := sessions.SessionMustChange(cookie.Value)
			if err != nil {
				writeMiddlewareError(w, "authentication error", http.StatusInternalServerError, "auth.error")
				return
			}
			if mustChange {
				writeMiddlewareError(w, "password change required", http.StatusForbidden, "auth.password_change_required")
				return
			}
		}

		ctx := context.WithValue(r.Context(), usernameKey, username)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

// GetUsername extracts the authenticated username from the request context.
func GetUsername(r *http.Request) string {
	s, _ := r.Context().Value(usernameKey).(string)
	return s
}

// writeMiddlewareError mirrors handler.go's writeJSONErrorCoded but
// kept package-private here so the middleware doesn't need to depend
// on the Handler type.
func writeMiddlewareError(w http.ResponseWriter, message string, status int, code string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(map[string]string{"error": message, "code": code})
}
