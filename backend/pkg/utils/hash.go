package utils

import (
	"errors"
	"strings"

	"golang.org/x/crypto/bcrypt"
)

const bcryptCost = bcrypt.DefaultCost

// ErrStoredPasswordNotBcrypt is returned when the DB value is not a bcrypt hash (e.g. plain text from manual INSERT).
var ErrStoredPasswordNotBcrypt = errors.New("stored password hash is not bcrypt format")

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

// ComparePasswordWithHash verifies plaintext against a bcrypt hash with the same rules as production login:
// trims plaintext and stored hash, rejects non-bcrypt stored values, then uses bcrypt.CompareHashAndPassword.
func ComparePasswordWithHash(storedHash, plainPassword string) error {
	plain := strings.TrimSpace(plainPassword)
	hash := strings.TrimSpace(storedHash)
	// Treat missing input like a failed verify so callers return generic invalid-credentials without leaking details.
	if hash == "" || plain == "" {
		return bcrypt.ErrMismatchedHashAndPassword
	}
	if !IsBcryptHash(hash) {
		return ErrStoredPasswordNotBcrypt
	}
	return bcrypt.CompareHashAndPassword([]byte(hash), []byte(plain))
}

// CheckPassword returns true only if ComparePasswordWithHash returns nil (bcrypt match).
func CheckPassword(storedHash, plainPassword string) bool {
	return ComparePasswordWithHash(storedHash, plainPassword) == nil
}
