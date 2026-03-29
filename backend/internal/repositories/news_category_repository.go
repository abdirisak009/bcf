package repositories

import (
	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/bararug/website-backend/internal/models"
)

type NewsCategoryRepository struct {
	db *gorm.DB
}

func NewNewsCategoryRepository(db *gorm.DB) *NewsCategoryRepository {
	return &NewsCategoryRepository{db: db}
}

func (r *NewsCategoryRepository) List() ([]models.NewsCategory, error) {
	var rows []models.NewsCategory
	err := r.db.Order("name ASC").Find(&rows).Error
	return rows, err
}

func (r *NewsCategoryRepository) Create(c *models.NewsCategory) error {
	return r.db.Create(c).Error
}

func (r *NewsCategoryRepository) Exists(id uuid.UUID) (bool, error) {
	var n int64
	err := r.db.Model(&models.NewsCategory{}).Where("id = ?", id).Count(&n).Error
	return n > 0, err
}
