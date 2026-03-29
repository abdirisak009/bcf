package repositories

import (
	"errors"
	"strings"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/bararug/website-backend/internal/models"
)

type AuthRepository struct {
	db *gorm.DB
}

func NewAuthRepository(db *gorm.DB) *AuthRepository {
	return &AuthRepository{db: db}
}

func (r *AuthRepository) CreateUser(u *models.User) error {
	return r.db.Create(u).Error
}

func (r *AuthRepository) GetByEmail(email string) (*models.User, error) {
	var u models.User
	err := r.db.Where("email = ?", email).First(&u).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &u, nil
}

func (r *AuthRepository) GetByID(id uuid.UUID) (*models.User, error) {
	var u models.User
	err := r.db.Where("id = ?", id).First(&u).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &u, nil
}

func (r *AuthRepository) ListUsers() ([]models.User, error) {
	var users []models.User
	err := r.db.Order("email ASC").Find(&users).Error
	return users, err
}

func (r *AuthRepository) DeleteUser(id uuid.UUID) error {
	if err := r.db.Where("user_id = ?", id).Delete(&models.UserPermission{}).Error; err != nil {
		return err
	}
	return r.db.Delete(&models.User{}, "id = ?", id).Error
}

func (r *AuthRepository) UpdateUser(u *models.User) error {
	return r.db.Save(u).Error
}

func (r *AuthRepository) GetPermissionKeys(userID uuid.UUID) ([]string, error) {
	var rows []models.UserPermission
	if err := r.db.Where("user_id = ?", userID).Find(&rows).Error; err != nil {
		return nil, err
	}
	out := make([]string, 0, len(rows))
	for _, row := range rows {
		k := strings.TrimSpace(row.Key)
		if k != "" {
			out = append(out, k)
		}
	}
	return out, nil
}

func (r *AuthRepository) SetPermissionKeys(userID uuid.UUID, keys []string) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Where("user_id = ?", userID).Delete(&models.UserPermission{}).Error; err != nil {
			return err
		}
		for _, k := range keys {
			k = strings.TrimSpace(k)
			if k == "" {
				continue
			}
			if err := tx.Create(&models.UserPermission{UserID: userID, Key: k}).Error; err != nil {
				return err
			}
		}
		return nil
	})
}
