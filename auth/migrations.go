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

	// Sessions whose owner must change their password before the session may
	// be used for anything other than the password-change endpoint. A token's
	// presence here means "must change"; the row is removed once the password
	// is changed (or the session ends). Kept as a side table rather than a
	// sessions column so the migration stays an idempotent CREATE IF NOT EXISTS
	// (consumers apply these statements on every start).
	`CREATE TABLE IF NOT EXISTS session_must_change (
		token TEXT PRIMARY KEY
	)`,
}
