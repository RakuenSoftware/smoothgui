package auth

import (
	"context"
	"errors"
	"os"
	"os/exec"
	"strconv"
	"testing"

	"github.com/msteinert/pam/v2"
)

func TestClassifyPAMHelperResult(t *testing.T) {
	t.Run("success", func(t *testing.T) {
		if err := classifyPAMHelperResult(nil, "", nil); err != nil {
			t.Fatalf("expected nil error, got %v", err)
		}
	})

	t.Run("invalid credentials exit", func(t *testing.T) {
		err := classifyPAMHelperResult(
			&exec.ExitError{ProcessState: newExitedProcessState(t, pamHelperExitInvalidCredentials)},
			"pam authenticate: authentication failure",
			nil,
		)
		if !errors.Is(err, ErrInvalidCredentials) {
			t.Fatalf("expected invalid credentials error, got %v", err)
		}
	})

	t.Run("helper unavailable exit", func(t *testing.T) {
		err := classifyPAMHelperResult(
			&exec.ExitError{ProcessState: newExitedProcessState(t, pamHelperExitUnavailable)},
			"pam start: system error",
			nil,
		)
		if !errors.Is(err, ErrAuthUnavailable) {
			t.Fatalf("expected unavailable error, got %v", err)
		}
	})

	t.Run("timeout", func(t *testing.T) {
		err := classifyPAMHelperResult(
			context.DeadlineExceeded,
			"",
			context.DeadlineExceeded,
		)
		if !errors.Is(err, ErrAuthUnavailable) {
			t.Fatalf("expected unavailable timeout error, got %v", err)
		}
	})
}

func TestClassifyPAMError(t *testing.T) {
	tests := []struct {
		name   string
		err    error
		target error
	}{
		{name: "auth failure", err: pam.ErrAuth, target: ErrInvalidCredentials},
		{name: "unknown user", err: pam.ErrUserUnknown, target: ErrInvalidCredentials},
		{name: "system failure", err: pam.ErrSystem, target: ErrAuthUnavailable},
		{name: "service failure", err: pam.ErrService, target: ErrAuthUnavailable},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			err := classifyPAMError("authenticate", tc.err)
			if !errors.Is(err, tc.target) {
				t.Fatalf("expected %v, got %v", tc.target, err)
			}
		})
	}
}

func newExitedProcessState(t *testing.T, exitCode int) *os.ProcessState {
	t.Helper()

	cmd := exec.Command("sh", "-c", "exit "+strconv.Itoa(exitCode))
	if err := cmd.Run(); err == nil {
		t.Fatalf("expected command to exit with code %d", exitCode)
	}
	if cmd.ProcessState == nil {
		t.Fatal("expected process state")
	}
	return cmd.ProcessState
}
