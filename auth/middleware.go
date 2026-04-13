package auth

import (
	"context"
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
			http.Error(w, `{"error":"authentication required"}`, http.StatusUnauthorized)
			return
		}

		username, err := sessions.ValidateSession(cookie.Value)
		if err != nil {
			http.Error(w, `{"error":"invalid or expired session"}`, http.StatusUnauthorized)
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
