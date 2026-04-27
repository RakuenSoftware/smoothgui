package auth

import (
	"context"
	"encoding/json"
	"net/http"
)

type contextKey string

const usernameKey contextKey = "username"

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
