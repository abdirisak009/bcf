package repositories

import (
	"errors"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/bararug/website-backend/internal/models"
)

type TrainingRepository struct {
	db *gorm.DB
}

func NewTrainingRepository(db *gorm.DB) *TrainingRepository {
	return &TrainingRepository{db: db}
}

func (r *TrainingRepository) List(limit, offset int) ([]models.Training, error) {
	var rows []models.Training
	q := r.db.Preload("Academy").Order("created_at DESC")
	if limit > 0 {
		q = q.Limit(limit).Offset(offset)
	}
	err := q.Find(&rows).Error
	return rows, err
}

func (r *TrainingRepository) Create(t *models.Training) error {
	return r.db.Create(t).Error
}

func (r *TrainingRepository) GetByID(id uuid.UUID) (*models.Training, error) {
	var t models.Training
	err := r.db.Preload("Academy").Where("id = ?", id).First(&t).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &t, nil
}

func (r *TrainingRepository) Update(t *models.Training) error {
	return r.db.Save(t).Error
}

func (r *TrainingRepository) Delete(id uuid.UUID) error {
	return r.db.Delete(&models.Training{}, "id = ?", id).Error
}
