package repositories

import (
	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/bararug/website-backend/internal/models"
)

type ClientRepository struct {
	db *gorm.DB
}

func NewClientRepository(db *gorm.DB) *ClientRepository {
	return &ClientRepository{db: db}
}

func (r *ClientRepository) Create(c *models.Client) error {
	return r.db.Create(c).Error
}

func (r *ClientRepository) List(limit, offset int) ([]models.Client, error) {
	var rows []models.Client
	err := r.db.Order("sort_order ASC, created_at ASC").Limit(limit).Offset(offset).Find(&rows).Error
	return rows, err
}

func (r *ClientRepository) GetByID(id uuid.UUID) (*models.Client, error) {
	var c models.Client
	err := r.db.First(&c, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &c, nil
}

func (r *ClientRepository) Update(c *models.Client) error {
	return r.db.Save(c).Error
}

func (r *ClientRepository) Delete(id uuid.UUID) error {
	return r.db.Delete(&models.Client{}, "id = ?", id).Error
}
