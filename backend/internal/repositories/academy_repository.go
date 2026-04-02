package repositories

import (
	"database/sql"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/bararug/website-backend/internal/models"
)

type AcademyRepository struct {
	db *gorm.DB
}

func NewAcademyRepository(db *gorm.DB) *AcademyRepository {
	return &AcademyRepository{db: db}
}

func (r *AcademyRepository) List(limit, offset int) ([]models.Academy, error) {
	var rows []models.Academy
	q := r.db.Order("sort_order ASC, name ASC")
	if limit > 0 {
		q = q.Limit(limit).Offset(offset)
	}
	err := q.Find(&rows).Error
	return rows, err
}

func (r *AcademyRepository) ListWithTrainings() ([]models.Academy, error) {
	var rows []models.Academy
	err := r.db.Preload("Trainings", func(db *gorm.DB) *gorm.DB {
		return db.Order("created_at DESC")
	}).Order("sort_order ASC, name ASC").Find(&rows).Error
	return rows, err
}

// NextSortOrder returns max(sort_order)+1 so new academies append to the end of the list.
func (r *AcademyRepository) NextSortOrder() (int, error) {
	var max sql.NullInt64
	err := r.db.Raw("SELECT COALESCE(MAX(sort_order), -1) FROM academies").Scan(&max).Error
	if err != nil {
		return 0, err
	}
	if !max.Valid {
		return 0, nil
	}
	return int(max.Int64) + 1, nil
}

func (r *AcademyRepository) Create(a *models.Academy) error {
	return r.db.Create(a).Error
}

func (r *AcademyRepository) GetByID(id uuid.UUID) (*models.Academy, error) {
	var a models.Academy
	err := r.db.First(&a, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &a, nil
}

func (r *AcademyRepository) Update(a *models.Academy) error {
	return r.db.Save(a).Error
}

func (r *AcademyRepository) Delete(id uuid.UUID) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Model(&models.Training{}).Where("academy_id = ?", id).Updates(map[string]interface{}{
			"academy_id": nil,
		}).Error; err != nil {
			return err
		}
		return tx.Delete(&models.Academy{}, "id = ?", id).Error
	})
}
