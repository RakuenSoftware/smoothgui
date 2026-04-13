package auth

import (
	"database/sql"
	"fmt"
	"time"
)

// RateLimiter tracks failed login attempts per IP in a SQLite database.
type RateLimiter struct {
	db            *sql.DB
	maxAttempts   int
	lockoutPeriod time.Duration
}

// NewRateLimiter creates a rate limiter with the given thresholds.
func NewRateLimiter(db *sql.DB, maxAttempts int, lockoutPeriod time.Duration) *RateLimiter {
	return &RateLimiter{db: db, maxAttempts: maxAttempts, lockoutPeriod: lockoutPeriod}
}

// RecordAttempt records a failed login attempt from an IP.
func (rl *RateLimiter) RecordAttempt(ip string) error {
	_, err := rl.db.Exec(
		"INSERT INTO login_attempts (ip, attempted_at) VALUES (?, ?)",
		ip, time.Now().UTC().Format(time.RFC3339),
	)
	return err
}

// IsLimited checks if an IP has exceeded the login attempt limit.
func (rl *RateLimiter) IsLimited(ip string) (bool, error) {
	cutoff := time.Now().UTC().Add(-rl.lockoutPeriod).Format(time.RFC3339)
	var count int
	err := rl.db.QueryRow(
		"SELECT COUNT(*) FROM login_attempts WHERE ip = ? AND attempted_at > ?",
		ip, cutoff,
	).Scan(&count)
	if err != nil {
		return false, fmt.Errorf("count attempts: %w", err)
	}

	return count >= rl.maxAttempts, nil
}

// ClearAttempts removes old login attempts for an IP (called on successful login).
func (rl *RateLimiter) ClearAttempts(ip string) error {
	_, err := rl.db.Exec("DELETE FROM login_attempts WHERE ip = ?", ip)
	return err
}

// CleanOldAttempts removes attempts older than the lockout period.
func (rl *RateLimiter) CleanOldAttempts() error {
	cutoff := time.Now().UTC().Add(-rl.lockoutPeriod).Format(time.RFC3339)
	_, err := rl.db.Exec("DELETE FROM login_attempts WHERE attempted_at < ?", cutoff)
	return err
}
