package auth

import (
	"bufio"
	"fmt"
	"os/exec"
	"strings"
)

// User represents a Linux system user account.
type User struct {
	Username string `json:"username"`
	UID      string `json:"uid"`
	GID      string `json:"gid"`
	Comment  string `json:"comment"`
	Home     string `json:"home"`
	Shell    string `json:"shell"`
}

// UserManager manages Linux system accounts scoped to a named group.
// Only users in the configured group are visible to List and eligible
// for deletion via Delete.
type UserManager struct {
	group string
}

// NewUserManager creates a user manager scoped to the given group.
// The group is created automatically if it doesn't exist.
func NewUserManager(group string) *UserManager {
	return &UserManager{group: group}
}

// EnsureGroup creates the managed group if it doesn't already exist.
func (m *UserManager) EnsureGroup() error {
	if err := exec.Command("getent", "group", m.group).Run(); err == nil {
		return nil
	}
	return exec.Command("groupadd", "--system", m.group).Run()
}

// List returns all system users that are members of the managed group.
func (m *UserManager) List() ([]User, error) {
	out, err := exec.Command("getent", "group", m.group).Output()
	if err != nil {
		return nil, nil
	}

	line := strings.TrimSpace(string(out))
	parts := strings.Split(line, ":")
	if len(parts) < 4 || parts[3] == "" {
		return nil, nil
	}

	usernames := strings.Split(parts[3], ",")
	var users []User
	for _, name := range usernames {
		u, err := GetUser(name)
		if err != nil {
			continue
		}
		users = append(users, *u)
	}
	return users, nil
}

// GetUser looks up a single system user by username via getent passwd.
func GetUser(username string) (*User, error) {
	out, err := exec.Command("getent", "passwd", username).Output()
	if err != nil {
		return nil, fmt.Errorf("user not found: %s", username)
	}

	return parsePasswdLine(strings.TrimSpace(string(out)))
}

// Create adds a new system user and adds them to the managed group.
// The user gets a home directory under /home and /usr/sbin/nologin shell.
func (m *UserManager) Create(username, password string) error {
	if err := ValidateUsername(username); err != nil {
		return err
	}

	cmd := exec.Command("useradd",
		"--create-home",
		"--groups", m.group,
		"--shell", "/usr/sbin/nologin",
		username,
	)
	if out, err := cmd.CombinedOutput(); err != nil {
		return fmt.Errorf("useradd: %s: %w", strings.TrimSpace(string(out)), err)
	}

	return SetPassword(username, password)
}

// SetPassword changes a system user's password via chpasswd.
func SetPassword(username, password string) error {
	cmd := exec.Command("chpasswd")
	cmd.Stdin = strings.NewReader(fmt.Sprintf("%s:%s", username, password))
	if out, err := cmd.CombinedOutput(); err != nil {
		return fmt.Errorf("chpasswd: %s: %w", strings.TrimSpace(string(out)), err)
	}
	return nil
}

// Delete removes a system user and their home directory.
// Only users in the managed group can be deleted.
func (m *UserManager) Delete(username string) error {
	if !m.IsManagedUser(username) {
		return fmt.Errorf("cannot delete user %q: not managed by %s", username, m.group)
	}

	cmd := exec.Command("userdel", "--remove", username)
	if out, err := cmd.CombinedOutput(); err != nil {
		return fmt.Errorf("userdel: %s: %w", strings.TrimSpace(string(out)), err)
	}
	return nil
}

// IsManagedUser checks if a username is a member of the managed group.
func (m *UserManager) IsManagedUser(username string) bool {
	out, err := exec.Command("id", "-nG", username).Output()
	if err != nil {
		return false
	}
	for _, g := range strings.Fields(string(out)) {
		if g == m.group {
			return true
		}
	}
	return false
}

// UserExists checks if a system user exists.
func UserExists(username string) bool {
	return exec.Command("id", username).Run() == nil
}

// ListAllUsers reads /etc/passwd and returns all system users.
func ListAllUsers() ([]User, error) {
	out, err := exec.Command("getent", "passwd").Output()
	if err != nil {
		return nil, fmt.Errorf("getent passwd: %w", err)
	}

	var users []User
	scanner := bufio.NewScanner(strings.NewReader(string(out)))
	for scanner.Scan() {
		u, err := parsePasswdLine(scanner.Text())
		if err != nil {
			continue
		}
		users = append(users, *u)
	}
	return users, scanner.Err()
}

// ValidateUsername checks that a username is safe for use with system commands.
// Allows lowercase letters, digits, hyphens, and underscores. 1-32 chars.
// Must start with a lowercase letter.
func ValidateUsername(username string) error {
	if len(username) == 0 || len(username) > 32 {
		return fmt.Errorf("username must be 1-32 characters")
	}
	for _, c := range username {
		if !((c >= 'a' && c <= 'z') || (c >= '0' && c <= '9') || c == '-' || c == '_') {
			return fmt.Errorf("username contains invalid character: %c (only lowercase letters, digits, hyphens, underscores allowed)", c)
		}
	}
	if username[0] < 'a' || username[0] > 'z' {
		return fmt.Errorf("username must start with a lowercase letter")
	}
	return nil
}

func parsePasswdLine(line string) (*User, error) {
	parts := strings.Split(line, ":")
	if len(parts) < 7 {
		return nil, fmt.Errorf("invalid passwd line: %s", line)
	}
	return &User{
		Username: parts[0],
		UID:      parts[2],
		GID:      parts[3],
		Comment:  parts[4],
		Home:     parts[5],
		Shell:    parts[6],
	}, nil
}
