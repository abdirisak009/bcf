package services

import (
	"errors"
	"strings"
	"time"

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
	hash, err := pkgutils.HashPassword(req.Password)
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
	u, err := s.repo.GetByEmail(email)
	if err != nil {
		return nil, err
	}
	if u == nil || !pkgutils.CheckPassword(u.PasswordHash, req.Password) {
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
