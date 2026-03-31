package utils

import (
	"strings"

	"golang.org/x/crypto/bcrypt"
)

const bcryptCost = bcrypt.DefaultCost

// HashPassword returns a bcrypt hash of the plaintext password.
// Callers should pass already-normalized plaintext (e.g. strings.TrimSpace) for consistency with login.
func HashPassword(plain string) (string, error) {
	b, err := bcrypt.GenerateFromPassword([]byte(plain), bcryptCost)
	if err != nil {
		return "", err
	}
	return string(b), nil
}

// IsBcryptHash reports whether s looks like a bcrypt modular crypt hash (starts with $2a$, $2b$, or $2y$).
// Values such as plain text or truncated DB fields must be rejected before CompareHashAndPassword.
func IsBcryptHash(s string) bool {
	s = strings.TrimSpace(s)
	if len(s) < 7 {
		return false
	}
	return strings.HasPrefix(s, "$2a$") || strings.HasPrefix(s, "$2b$") || strings.HasPrefix(s, "$2y$")
}

// ComparePasswordWithHash verifies plaintext against a bcrypt hash using bcrypt.CompareHashAndPassword.
// Order is (hash, password) as required by the standard library — never compare plain strings to each other.
// Values are trimmed; empty after trim fails verification.
func ComparePasswordWithHash(storedHash, plainPassword string) error {
	hash := strings.TrimSpace(storedHash)
	plain := strings.TrimSpace(plainPassword)
	if hash == "" || plain == "" {
		return bcrypt.ErrMismatchedHashAndPassword
	}
	// Let bcrypt validate the hash format; wrong/legacy/plain values return an error (e.g. ErrHashTooShort).
	return bcrypt.CompareHashAndPassword([]byte(hash), []byte(plain))
}

// CheckPassword returns true only if ComparePasswordWithHash returns nil (bcrypt match).
func CheckPassword(storedHash, plainPassword string) bool {
	return ComparePasswordWithHash(storedHash, plainPassword) == nil
}
