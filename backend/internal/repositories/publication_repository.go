package repositories

import (
	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/bararug/website-backend/internal/models"
)

type PublicationRepository struct {
	db *gorm.DB
}

func NewPublicationRepository(db *gorm.DB) *PublicationRepository {
	return &PublicationRepository{db: db}
}

func (r *PublicationRepository) List(limit, offset int) ([]models.Publication, error) {
	var rows []models.Publication
	err := r.db.Order("created_at DESC").Limit(limit).Offset(offset).Find(&rows).Error
	return rows, err
}

func (r *PublicationRepository) Create(p *models.Publication) error {
	return r.db.Create(p).Error
}

func (r *PublicationRepository) GetByID(id uuid.UUID) (*models.Publication, error) {
	var p models.Publication
	err := r.db.First(&p, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &p, nil
}

func (r *PublicationRepository) Update(p *models.Publication) error {
	return r.db.Save(p).Error
}

func (r *PublicationRepository) Delete(id uuid.UUID) error {
	return r.db.Delete(&models.Publication{}, "id = ?", id).Error
}
