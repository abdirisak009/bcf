package repositories

import (
	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/bararug/website-backend/internal/models"
)

type PartnerRepository struct {
	db *gorm.DB
}

func NewPartnerRepository(db *gorm.DB) *PartnerRepository {
	return &PartnerRepository{db: db}
}

func (r *PartnerRepository) Create(p *models.Partner) error {
	return r.db.Create(p).Error
}

func (r *PartnerRepository) List(limit, offset int) ([]models.Partner, error) {
	var rows []models.Partner
	err := r.db.Order("sort_order ASC, created_at ASC").Limit(limit).Offset(offset).Find(&rows).Error
	return rows, err
}

func (r *PartnerRepository) GetByID(id uuid.UUID) (*models.Partner, error) {
	var p models.Partner
	err := r.db.First(&p, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &p, nil
}

func (r *PartnerRepository) Update(p *models.Partner) error {
	return r.db.Save(p).Error
}

func (r *PartnerRepository) Delete(id uuid.UUID) error {
	return r.db.Delete(&models.Partner{}, "id = ?", id).Error
}
