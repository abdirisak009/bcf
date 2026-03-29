package utils

import (
	"golang.org/x/crypto/bcrypt"
)

const bcryptCost = bcrypt.DefaultCost

// HashPassword returns a bcrypt hash of the plaintext password.
func HashPassword(plain string) (string, error) {
	b, err := bcrypt.GenerateFromPassword([]byte(plain), bcryptCost)
	if err != nil {
		return "", err
	}
	return string(b), nil
}

// CheckPassword compares bcrypt hash with plaintext.
func CheckPassword(hash, plain string) bool {
	return bcrypt.CompareHashAndPassword([]byte(hash), []byte(plain)) == nil
}
