package auth

import (
	"testing"
	"time"
)

func TestRateLimiting(t *testing.T) {
	db := openTestDB(t)
	rl := NewRateLimiter(db, 5, 15*time.Minute)

	ip := "192.168.1.100"

	// Should not be rate limited initially.
	limited, _ := rl.IsLimited(ip)
	if limited {
		t.Fatal("should not be limited initially")
	}

	// Record 5 attempts.
	for i := 0; i < 5; i++ {
		rl.RecordAttempt(ip)
	}

	// Now should be rate limited.
	limited, _ = rl.IsLimited(ip)
	if !limited {
		t.Fatal("should be limited after 5 attempts")
	}

	// Clear and check again.
	rl.ClearAttempts(ip)
	limited, _ = rl.IsLimited(ip)
	if limited {
		t.Fatal("should not be limited after clear")
	}
}
