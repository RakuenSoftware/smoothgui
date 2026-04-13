package auth

import (
	"crypto/rand"
	"database/sql"
	"encoding/hex"
	"errors"
	"fmt"
	"time"
)

// SessionStore manages login sessions in a SQLite database.
type SessionStore struct {
	db              *sql.DB
	sessionDuration time.Duration
}

// NewSessionStore creates a session store with the given session duration.
func NewSessionStore(db *sql.DB, sessionDuration time.Duration) *SessionStore {
	return &SessionStore{db: db, sessionDuration: sessionDuration}
}

// CreateSession generates a cryptographically random session token
// and stores it with the configured expiry duration.
func (s *SessionStore) CreateSession(username string) (string, error) {
	tokenBytes := make([]byte, 32) // 256 bits
	if _, err := rand.Read(tokenBytes); err != nil {
		return "", fmt.Errorf("generate token: %w", err)
	}
	token := hex.EncodeToString(tokenBytes)

	now := time.Now().UTC()
	expires := now.Add(s.sessionDuration)

	_, err := s.db.Exec(
		"INSERT INTO sessions (token, username, created_at, expires_at) VALUES (?, ?, ?, ?)",
		token, username, now.Format(time.RFC3339), expires.Format(time.RFC3339),
	)
	if err != nil {
		return "", fmt.Errorf("insert session: %w", err)
	}

	return token, nil
}

// ValidateSession checks if a token is valid and not expired.
// On success, it extends the expiry (sliding window) and returns the username.
func (s *SessionStore) ValidateSession(token string) (string, error) {
	var username string
	var expiresAt string

	err := s.db.QueryRow(
		"SELECT username, expires_at FROM sessions WHERE token = ?", token,
	).Scan(&username, &expiresAt)
	if errors.Is(err, sql.ErrNoRows) {
		return "", ErrSessionNotFound
	}
	if err != nil {
		return "", fmt.Errorf("query session: %w", err)
	}

	expires, err := time.Parse(time.RFC3339, expiresAt)
	if err != nil {
		return "", fmt.Errorf("parse expiry: %w", err)
	}
	if time.Now().UTC().After(expires) {
		s.db.Exec("DELETE FROM sessions WHERE token = ?", token)
		return "", ErrSessionNotFound
	}

	// Sliding window: extend expiry on each valid access.
	newExpiry := time.Now().UTC().Add(s.sessionDuration).Format(time.RFC3339)
	s.db.Exec("UPDATE sessions SET expires_at = ? WHERE token = ?", newExpiry, token)

	return username, nil
}

// DeleteSession removes a session (logout).
func (s *SessionStore) DeleteSession(token string) error {
	_, err := s.db.Exec("DELETE FROM sessions WHERE token = ?", token)
	return err
}

// DeleteSessionsForUser removes all sessions for a username.
func (s *SessionStore) DeleteSessionsForUser(username string) error {
	_, err := s.db.Exec("DELETE FROM sessions WHERE username = ?", username)
	return err
}

// CleanExpiredSessions removes all expired sessions.
func (s *SessionStore) CleanExpiredSessions() error {
	now := time.Now().UTC().Format(time.RFC3339)
	_, err := s.db.Exec("DELETE FROM sessions WHERE expires_at < ?", now)
	return err
}

// ErrSessionNotFound is returned when a session token does not exist or has expired.
var ErrSessionNotFound = errors.New("session not found")
