package auth

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"time"
)

// A must-change session is blocked from normal endpoints but allowed to reach
// the password-change and logout endpoints.
func TestRequireAuthMustChange(t *testing.T) {
	db := openTestDB(t)
	sessions := NewSessionStore(db, time.Hour)

	token, err := sessions.CreateSessionMustChange("admin")
	if err != nil {
		t.Fatalf("create must-change session: %v", err)
	}

	next := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) { w.WriteHeader(http.StatusOK) })
	h := RequireAuth(sessions, next)

	call := func(path string) int {
		req := httptest.NewRequest(http.MethodGet, path, nil)
		req.AddCookie(&http.Cookie{Name: "session", Value: token})
		rr := httptest.NewRecorder()
		h.ServeHTTP(rr, req)
		return rr.Code
	}

	if code := call("/api/system/status"); code != http.StatusForbidden {
		t.Fatalf("must-change session reaching a normal endpoint: want 403 got %d", code)
	}
	if code := call("/api/auth/password"); code != http.StatusOK {
		t.Fatalf("must-change session reaching password endpoint: want 200 got %d", code)
	}
	if code := call("/api/auth/logout"); code != http.StatusOK {
		t.Fatalf("must-change session reaching logout: want 200 got %d", code)
	}

	// After the flag clears, normal endpoints are reachable again.
	if err := sessions.ClearMustChange("admin"); err != nil {
		t.Fatalf("clear: %v", err)
	}
	if code := call("/api/system/status"); code != http.StatusOK {
		t.Fatalf("after clear, normal endpoint: want 200 got %d", code)
	}
}
