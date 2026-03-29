package repositories

import (
	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/bararug/website-backend/internal/models"
)

type NewsRepository struct {
	db *gorm.DB
}

func NewNewsRepository(db *gorm.DB) *NewsRepository {
	return &NewsRepository{db: db}
}

func (r *NewsRepository) List(limit, offset int) ([]models.News, error) {
	var rows []models.News
	err := r.db.Preload("CategoryRef").Order("created_at DESC").Limit(limit).Offset(offset).Find(&rows).Error
	return rows, err
}

func (r *NewsRepository) GetByID(id uuid.UUID) (*models.News, error) {
	var n models.News
	err := r.db.Preload("CategoryRef").First(&n, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &n, nil
}

func (r *NewsRepository) Create(n *models.News) error {
	return r.db.Create(n).Error
}

func (r *NewsRepository) Update(n *models.News) error {
	return r.db.Save(n).Error
}

func (r *NewsRepository) Delete(id uuid.UUID) error {
	return r.db.Delete(&models.News{}, "id = ?", id).Error
}
