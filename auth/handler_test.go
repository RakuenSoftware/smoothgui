package auth

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestWriteJSONErrorCoded(t *testing.T) {
	rr := httptest.NewRecorder()
	writeJSONErrorCoded(rr, "invalid credentials", http.StatusUnauthorized, "auth.invalid_credentials")

	if rr.Code != http.StatusUnauthorized {
		t.Fatalf("status: want 401 got %d", rr.Code)
	}
	if got := rr.Header().Get("Content-Type"); got != "application/json" {
		t.Errorf("content-type: want application/json got %q", got)
	}
	var body map[string]string
	if err := json.NewDecoder(rr.Body).Decode(&body); err != nil {
		t.Fatalf("decode: %v", err)
	}
	if body["error"] != "invalid credentials" {
		t.Errorf("error: want %q got %q", "invalid credentials", body["error"])
	}
	if body["code"] != "auth.invalid_credentials" {
		t.Errorf("code: want %q got %q", "auth.invalid_credentials", body["code"])
	}
}

func TestWriteMiddlewareError(t *testing.T) {
	rr := httptest.NewRecorder()
	writeMiddlewareError(rr, "invalid or expired session", http.StatusUnauthorized, "auth.session_expired")

	var body map[string]string
	if err := json.NewDecoder(rr.Body).Decode(&body); err != nil {
		t.Fatalf("decode: %v", err)
	}
	if body["error"] != "invalid or expired session" {
		t.Errorf("error: want %q got %q", "invalid or expired session", body["error"])
	}
	if body["code"] != "auth.session_expired" {
		t.Errorf("code: want %q got %q", "auth.session_expired", body["code"])
	}
}
