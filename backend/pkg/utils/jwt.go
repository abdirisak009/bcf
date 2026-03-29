package utils

import (
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"

	"github.com/bararug/website-backend/internal/models"
)

type Claims struct {
	UserID uuid.UUID   `json:"uid"`
	Email  string      `json:"email"`
	Role   models.Role `json:"role"`
	jwt.RegisteredClaims
}

// SignJWT issues an HS256 token.
func SignJWT(secret string, expiry time.Duration, userID uuid.UUID, email string, role models.Role) (string, error) {
	if len(secret) < 8 {
		return "", errors.New("jwt secret too short")
	}
	now := time.Now()
	claims := Claims{
		UserID: userID,
		Email:  email,
		Role:   role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(now.Add(expiry)),
			IssuedAt:  jwt.NewNumericDate(now),
			Subject:   userID.String(),
		},
	}
	t := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return t.SignedString([]byte(secret))
}

// ParseJWT validates token and returns claims.
func ParseJWT(secret, token string) (*Claims, error) {
	t, err := jwt.ParseWithClaims(token, &Claims{}, func(t *jwt.Token) (any, error) {
		return []byte(secret), nil
	})
	if err != nil {
		return nil, err
	}
	c, ok := t.Claims.(*Claims)
	if !ok || !t.Valid {
		return nil, errors.New("invalid token")
	}
	return c, nil
}
