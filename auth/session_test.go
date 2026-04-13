package auth

import (
	"database/sql"
	"testing"
	"time"

	_ "github.com/mattn/go-sqlite3"
)

func openTestDB(t *testing.T) *sql.DB {
	t.Helper()
	db, err := sql.Open("sqlite3", ":memory:")
	if err != nil {
		t.Fatalf("open db: %v", err)
	}
	for _, m := range Migrations {
		if _, err := db.Exec(m); err != nil {
			t.Fatalf("migrate: %v", err)
		}
	}
	t.Cleanup(func() { db.Close() })
	return db
}

func TestSessionLifecycle(t *testing.T) {
	db := openTestDB(t)
	sessions := NewSessionStore(db, 24*time.Hour)

	// Create session.
	token, err := sessions.CreateSession("testuser")
	if err != nil {
		t.Fatalf("create session: %v", err)
	}
	if token == "" {
		t.Fatal("empty token")
	}

	// Validate session.
	username, err := sessions.ValidateSession(token)
	if err != nil {
		t.Fatalf("validate session: %v", err)
	}
	if username != "testuser" {
		t.Fatalf("expected testuser, got %s", username)
	}

	// Delete session.
	if err := sessions.DeleteSession(token); err != nil {
		t.Fatalf("delete session: %v", err)
	}

	// Validate again should fail.
	_, err = sessions.ValidateSession(token)
	if err == nil {
		t.Fatal("expected error after deletion")
	}
}

func TestDeleteSessionsForUser(t *testing.T) {
	db := openTestDB(t)
	sessions := NewSessionStore(db, 24*time.Hour)

	// Create multiple sessions.
	t1, _ := sessions.CreateSession("alice")
	t2, _ := sessions.CreateSession("alice")
	t3, _ := sessions.CreateSession("bob")

	// Delete alice's sessions.
	if err := sessions.DeleteSessionsForUser("alice"); err != nil {
		t.Fatalf("delete sessions: %v", err)
	}

	// Alice's sessions should be gone.
	if _, err := sessions.ValidateSession(t1); err == nil {
		t.Fatal("t1 should be invalid")
	}
	if _, err := sessions.ValidateSession(t2); err == nil {
		t.Fatal("t2 should be invalid")
	}

	// Bob's session should still work.
	if username, err := sessions.ValidateSession(t3); err != nil || username != "bob" {
		t.Fatalf("bob's session should be valid, got err=%v username=%s", err, username)
	}
}

func TestCleanExpiredSessions(t *testing.T) {
	db := openTestDB(t)
	sessions := NewSessionStore(db, 24*time.Hour)

	// Create a session.
	token, _ := sessions.CreateSession("testuser")

	// Manually expire it.
	expired := time.Now().UTC().Add(-1 * time.Hour).Format(time.RFC3339)
	db.Exec("UPDATE sessions SET expires_at = ? WHERE token = ?", expired, token)

	// Clean should remove it.
	if err := sessions.CleanExpiredSessions(); err != nil {
		t.Fatalf("clean: %v", err)
	}

	// Should be gone.
	if _, err := sessions.ValidateSession(token); err == nil {
		t.Fatal("expired session should be invalid")
	}
}
