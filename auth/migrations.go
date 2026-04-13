package auth

// Migrations contains the SQL statements required by the auth module.
// Consumers should include these in their own migration list.
var Migrations = []string{
	// Sessions table (web UI login sessions, keyed by token).
	`CREATE TABLE IF NOT EXISTS sessions (
		token      TEXT PRIMARY KEY,
		username   TEXT NOT NULL,
		created_at TEXT NOT NULL DEFAULT (datetime('now')),
		expires_at TEXT NOT NULL
	)`,

	// Rate limiting for failed logins.
	`CREATE TABLE IF NOT EXISTS login_attempts (
		ip           TEXT NOT NULL,
		attempted_at TEXT NOT NULL DEFAULT (datetime('now'))
	)`,

	// Index for rate-limit lookups and cleanup.
	`CREATE INDEX IF NOT EXISTS idx_login_attempts_ip ON login_attempts(ip, attempted_at)`,
}
