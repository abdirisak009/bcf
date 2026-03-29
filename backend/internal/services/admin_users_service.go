package services

import (
	"errors"
	"strings"

	"github.com/google/uuid"

	"github.com/bararug/website-backend/internal/models"
	"github.com/bararug/website-backend/internal/permissions"
	"github.com/bararug/website-backend/internal/repositories"
	pkgutils "github.com/bararug/website-backend/pkg/utils"
)

var (
	ErrForbiddenAdminAction = errors.New("only admins can manage users")
	ErrCannotDemoteSelf     = errors.New("cannot remove your own admin role")
	ErrLastAdmin            = errors.New("cannot delete the last admin user")
)

type AdminUsersService struct {
	repo *repositories.AuthRepository
}

func NewAdminUsersService(repo *repositories.AuthRepository) *AdminUsersService {
	return &AdminUsersService{repo: repo}
}

type AdminCreateUserRequest struct {
	Email       string   `json:"email" binding:"required,email"`
	Password    string   `json:"password" binding:"required,min=8"`
	Role        string   `json:"role" binding:"required"`
	Permissions []string `json:"permissions"`
}

type AdminUpdateUserRequest struct {
	Password    *string  `json:"password"`
	Role        *string  `json:"role"`
	Permissions []string `json:"permissions"`
}

func validRole(s string) bool {
	switch models.Role(s) {
	case models.RoleAdmin, models.RoleUser, models.RolePartner:
		return true
	default:
		return false
	}
}

func normalizePermKeys(in []string) []string {
	allowed := make(map[string]struct{}, len(permissions.AllKeys()))
	for _, k := range permissions.AllKeys() {
		allowed[k] = struct{}{}
	}
	var out []string
	seen := make(map[string]struct{})
	for _, raw := range in {
		k := strings.TrimSpace(raw)
		if k == "" {
			continue
		}
		if _, ok := allowed[k]; !ok {
			continue
		}
		if _, dup := seen[k]; dup {
			continue
		}
		seen[k] = struct{}{}
		out = append(out, k)
	}
	return out
}

func (s *AdminUsersService) List() ([]models.UserPublic, error) {
	users, err := s.repo.ListUsers()
	if err != nil {
		return nil, err
	}
	out := make([]models.UserPublic, 0, len(users))
	for _, u := range users {
		pub := models.UserPublic{ID: u.ID, Email: u.Email, Role: u.Role}
		if u.Role != models.RoleAdmin {
			keys, err := s.repo.GetPermissionKeys(u.ID)
			if err != nil {
				return nil, err
			}
			pub.Permissions = keys
		}
		out = append(out, pub)
	}
	return out, nil
}

func (s *AdminUsersService) Create(req *AdminCreateUserRequest) (*models.UserPublic, error) {
	email := strings.ToLower(strings.TrimSpace(req.Email))
	if !validRole(req.Role) {
		return nil, errors.New("invalid role")
	}
	hash, err := pkgutils.HashPassword(req.Password)
	if err != nil {
		return nil, err
	}
	u := &models.User{
		Email:        email,
		PasswordHash: hash,
		Role:         models.Role(req.Role),
	}
	if err := s.repo.CreateUser(u); err != nil {
		low := strings.ToLower(err.Error())
		if strings.Contains(low, "duplicate") || strings.Contains(low, "unique") || strings.Contains(low, "23505") {
			return nil, ErrEmailTaken
		}
		return nil, err
	}
	keys := normalizePermKeys(req.Permissions)
	if u.Role != models.RoleAdmin && len(keys) > 0 {
		if err := s.repo.SetPermissionKeys(u.ID, keys); err != nil {
			return nil, err
		}
	}
	pub := models.UserPublic{ID: u.ID, Email: u.Email, Role: u.Role, Permissions: keys}
	if u.Role == models.RoleAdmin {
		pub.Permissions = nil
	}
	return &pub, nil
}

func (s *AdminUsersService) Update(actorID uuid.UUID, id uuid.UUID, req *AdminUpdateUserRequest) (*models.UserPublic, error) {
	u, err := s.repo.GetByID(id)
	if err != nil {
		return nil, err
	}
	if u == nil {
		return nil, errors.New("user not found")
	}

	if req.Role != nil {
		if !validRole(*req.Role) {
			return nil, errors.New("invalid role")
		}
		if u.Role == models.RoleAdmin && models.Role(*req.Role) != models.RoleAdmin && u.ID == actorID {
			return nil, ErrCannotDemoteSelf
		}
		u.Role = models.Role(*req.Role)
	}
	if req.Password != nil && strings.TrimSpace(*req.Password) != "" {
		if len(strings.TrimSpace(*req.Password)) < 8 {
			return nil, errors.New("password must be at least 8 characters")
		}
		hash, err := pkgutils.HashPassword(strings.TrimSpace(*req.Password))
		if err != nil {
			return nil, err
		}
		u.PasswordHash = hash
	}
	if err := s.repo.UpdateUser(u); err != nil {
		return nil, err
	}

	if req.Permissions != nil {
		if u.Role == models.RoleAdmin {
			_ = s.repo.SetPermissionKeys(u.ID, nil)
		} else {
			keys := normalizePermKeys(req.Permissions)
			if err := s.repo.SetPermissionKeys(u.ID, keys); err != nil {
				return nil, err
			}
		}
	}

	keys, _ := s.repo.GetPermissionKeys(u.ID)
	pub := models.UserPublic{ID: u.ID, Email: u.Email, Role: u.Role}
	if u.Role != models.RoleAdmin {
		pub.Permissions = keys
	}
	return &pub, nil
}

func (s *AdminUsersService) Delete(actorID uuid.UUID, id uuid.UUID) error {
	if id == actorID {
		return errors.New("cannot delete your own account")
	}
	u, err := s.repo.GetByID(id)
	if err != nil {
		return err
	}
	if u == nil {
		return errors.New("user not found")
	}
	if u.Role == models.RoleAdmin {
		admins, err := s.repo.ListUsers()
		if err != nil {
			return err
		}
		n := 0
		for _, x := range admins {
			if x.Role == models.RoleAdmin {
				n++
			}
		}
		if n <= 1 {
			return ErrLastAdmin
		}
	}
	return s.repo.DeleteUser(id)
}
