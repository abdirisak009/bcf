package services

import (
	"errors"
	"log/slog"
	"strings"
	"time"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"

	"github.com/bararug/website-backend/config"
	"github.com/bararug/website-backend/internal/models"
	"github.com/bararug/website-backend/internal/repositories"
	pkgutils "github.com/bararug/website-backend/pkg/utils"
)

var (
	ErrInvalidCredentials = errors.New("invalid email or password")
	ErrEmailTaken         = errors.New("email already registered")
)

type AuthService struct {
	repo   *repositories.AuthRepository
	secret string
	expiry time.Duration
}

func NewAuthService(repo *repositories.AuthRepository, cfg *config.Config) *AuthService {
	return &AuthService{repo: repo, secret: cfg.JWTSecret, expiry: cfg.JWTExpiry}
}

type RegisterRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=8"`
}

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type AuthResponse struct {
	Token string           `json:"token"`
	User  models.UserPublic `json:"user"`
}

func (s *AuthService) Register(req *RegisterRequest) (*AuthResponse, error) {
	email := strings.ToLower(strings.TrimSpace(req.Email))
	// Trim so registration and login hash/compare the same string (avoids trailing-space mismatches).
	password := strings.TrimSpace(req.Password)
	if len(password) < 8 {
		return nil, errors.New("password must be at least 8 characters")
	}
	hash, err := pkgutils.HashPassword(password)
	if err != nil {
		return nil, err
	}
	u := &models.User{
		Email:        email,
		PasswordHash: hash,
		Role:         models.RoleUser,
	}
	if err := s.repo.CreateUser(u); err != nil {
		low := strings.ToLower(err.Error())
		if strings.Contains(low, "duplicate") || strings.Contains(low, "unique") || strings.Contains(low, "23505") {
			return nil, ErrEmailTaken
		}
		return nil, err
	}
	token, err := pkgutils.SignJWT(s.secret, s.expiry, u.ID, u.Email, u.Role)
	if err != nil {
		return nil, err
	}
	pub := models.UserPublic{ID: u.ID, Email: u.Email, Role: u.Role}
	if u.Role != models.RoleAdmin {
		keys, _ := s.repo.GetPermissionKeys(u.ID)
		pub.Permissions = keys
	}
	return &AuthResponse{
		Token: token,
		User:  pub,
	}, nil
}

func (s *AuthService) Login(req *LoginRequest) (*AuthResponse, error) {
	email := strings.ToLower(strings.TrimSpace(req.Email))
	password := strings.TrimSpace(req.Password)
	if password == "" {
		return nil, ErrInvalidCredentials
	}
	u, err := s.repo.GetByEmail(email)
	if err != nil {
		return nil, err
	}
	if u == nil {
		return nil, ErrInvalidCredentials
	}
	if err := pkgutils.ComparePasswordWithHash(u.PasswordHash, password); err != nil {
		logLoginFailure(u.ID, err)
		return nil, ErrInvalidCredentials
	}
	token, err := pkgutils.SignJWT(s.secret, s.expiry, u.ID, u.Email, u.Role)
	if err != nil {
		return nil, err
	}
	pub := models.UserPublic{ID: u.ID, Email: u.Email, Role: u.Role}
	if u.Role != models.RoleAdmin {
		keys, err := s.repo.GetPermissionKeys(u.ID)
		if err != nil {
			return nil, err
		}
		pub.Permissions = keys
	}
	return &AuthResponse{
		Token: token,
		User:  pub,
	}, nil
}

// logLoginFailure records why verify failed without logging secrets. Wrong-password attempts stay at Debug;
// non-bcrypt DB values are Warn so production logs surface misconfigured rows.
func logLoginFailure(userID uuid.UUID, verifyErr error) {
	switch {
	case errors.Is(verifyErr, pkgutils.ErrStoredPasswordNotBcrypt):
		slog.Warn("auth login: password_hash is not bcrypt; update user with seed-admin or bootstrap env",
			"user_id", userID.String())
	case errors.Is(verifyErr, bcrypt.ErrMismatchedHashAndPassword):
		slog.Debug("auth login: password mismatch", "user_id", userID.String())
	default:
		slog.Debug("auth login: password verify error", "user_id", userID.String(), "err", verifyErr.Error())
	}
}
