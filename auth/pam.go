// Package auth provides PAM-based authentication, session management,
// rate limiting, HTTP middleware, and Linux system user management for
// Go web applications.
package auth

import (
	"bytes"
	"context"
	"errors"
	"fmt"
	"io"
	"os"
	"os/exec"
	"strings"
	"time"

	"github.com/msteinert/pam/v2"
)

var (
	// ErrInvalidCredentials is returned when PAM rejects a login attempt.
	ErrInvalidCredentials = errors.New("invalid credentials")
	// ErrAuthUnavailable is returned when the PAM stack cannot be reached safely.
	ErrAuthUnavailable = errors.New("authentication unavailable")

	currentExecutable = os.Executable
	commandContext    = exec.CommandContext
)

const (
	pamHelperArg                    = "__pam_auth"
	pamHelperExitInvalidCredentials = 10
	pamHelperExitUnavailable        = 20
	pamHelperTimeout                = 5 * time.Second
)

// pamServiceContents returns the PAM service file content for the given service name.
func pamServiceContents(service string) string {
	return fmt.Sprintf("# PAM service for %s web UI authentication.\n"+
		"auth\t[success=1 default=ignore]\tpam_unix.so nullok\n"+
		"auth\trequisite\t\t\tpam_deny.so\n"+
		"auth\trequired\t\t\tpam_permit.so\n"+
		"account\t[success=1 new_authtok_reqd=done default=ignore]\tpam_unix.so\n"+
		"account\trequisite\t\t\tpam_deny.so\n"+
		"account\trequired\t\t\tpam_permit.so\n", service)
}

// PAMAuthenticate verifies a username/password against PAM in a subprocess so
// a PAM abort or hang cannot take down the long-lived HTTP server.
// The service parameter is the PAM service name (e.g. "myapp"), which
// corresponds to /etc/pam.d/<service>.
func PAMAuthenticate(service, username, password string) error {
	exe, err := currentExecutable()
	if err != nil {
		return fmt.Errorf("%w: locate executable: %v", ErrAuthUnavailable, err)
	}

	ctx, cancel := context.WithTimeout(context.Background(), pamHelperTimeout)
	defer cancel()

	cmd := commandContext(ctx, exe, pamHelperArg, service, username)
	cmd.Stdin = strings.NewReader(password)
	cmd.Stdout = io.Discard

	var stderr bytes.Buffer
	cmd.Stderr = &stderr

	err = cmd.Run()
	return classifyPAMHelperResult(err, strings.TrimSpace(stderr.String()), ctx.Err())
}

// RunPAMHelper executes a one-shot PAM auth check for the main process.
// Call this from main() when os.Args[1] == "__pam_auth".
// args should be os.Args[2:] and must contain [service, username].
func RunPAMHelper(args []string) int {
	if len(args) != 2 {
		fmt.Fprintln(os.Stderr, "usage: <exe> __pam_auth <service> <username>")
		return pamHelperExitUnavailable
	}

	service := args[0]
	username := args[1]

	password, err := io.ReadAll(os.Stdin)
	if err != nil {
		fmt.Fprintf(os.Stderr, "read password: %v\n", err)
		return pamHelperExitUnavailable
	}

	if err := pamAuthenticateDirect(service, username, string(password)); err != nil {
		fmt.Fprintln(os.Stderr, err)
		if errors.Is(err, ErrInvalidCredentials) {
			return pamHelperExitInvalidCredentials
		}
		return pamHelperExitUnavailable
	}

	return 0
}

func pamAuthenticateDirect(service, username, password string) error {
	if err := ensurePAMServiceFile(service); err != nil {
		return err
	}

	tx, err := pam.StartFunc(service, username, func(style pam.Style, msg string) (string, error) {
		switch style {
		case pam.PromptEchoOff:
			return password, nil
		case pam.PromptEchoOn:
			return username, nil
		case pam.TextInfo, pam.ErrorMsg:
			return "", nil
		default:
			return "", fmt.Errorf("unsupported PAM style: %v", style)
		}
	})
	if err != nil {
		return fmt.Errorf("%w: pam start: %v", ErrAuthUnavailable, err)
	}
	defer tx.End()

	if err := tx.Authenticate(0); err != nil {
		return classifyPAMError("authenticate", err)
	}

	if err := tx.AcctMgmt(0); err != nil {
		return classifyPAMError("account", err)
	}

	return nil
}

func ensurePAMServiceFile(service string) error {
	path := "/etc/pam.d/" + service
	if _, err := os.Stat(path); err == nil {
		return nil
	} else if !errors.Is(err, os.ErrNotExist) {
		return fmt.Errorf("%w: stat %s: %v", ErrAuthUnavailable, path, err)
	}

	if err := os.WriteFile(path, []byte(pamServiceContents(service)), 0o644); err != nil {
		return fmt.Errorf("%w: write %s: %v", ErrAuthUnavailable, path, err)
	}

	return nil
}

func classifyPAMHelperResult(runErr error, stderr string, ctxErr error) error {
	if runErr == nil {
		return nil
	}

	if errors.Is(ctxErr, context.DeadlineExceeded) {
		return fmt.Errorf("%w: pam helper timed out", ErrAuthUnavailable)
	}

	var exitErr *exec.ExitError
	if errors.As(runErr, &exitErr) {
		switch exitErr.ExitCode() {
		case pamHelperExitInvalidCredentials:
			if stderr == "" {
				stderr = ErrInvalidCredentials.Error()
			}
			return fmt.Errorf("%w: %s", ErrInvalidCredentials, stderr)
		case pamHelperExitUnavailable:
			if stderr == "" {
				stderr = ErrAuthUnavailable.Error()
			}
			return fmt.Errorf("%w: %s", ErrAuthUnavailable, stderr)
		}
	}

	if stderr == "" {
		stderr = runErr.Error()
	}
	return fmt.Errorf("%w: %s", ErrAuthUnavailable, stderr)
}

func classifyPAMError(op string, err error) error {
	switch {
	case errors.Is(err, pam.ErrAuth),
		errors.Is(err, pam.ErrUserUnknown),
		errors.Is(err, pam.ErrPermDenied),
		errors.Is(err, pam.ErrMaxtries),
		errors.Is(err, pam.ErrCredInsufficient),
		errors.Is(err, pam.ErrCredUnavail),
		errors.Is(err, pam.ErrCredExpired),
		errors.Is(err, pam.ErrAcctExpired),
		errors.Is(err, pam.ErrAuthtokExpired):
		return fmt.Errorf("%w: pam %s: %v", ErrInvalidCredentials, op, err)
	default:
		return fmt.Errorf("%w: pam %s: %v", ErrAuthUnavailable, op, err)
	}
}
