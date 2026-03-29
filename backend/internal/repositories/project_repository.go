package repositories

import (
	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/bararug/website-backend/internal/models"
)

type ProjectRepository struct {
	db *gorm.DB
}

func NewProjectRepository(db *gorm.DB) *ProjectRepository {
	return &ProjectRepository{db: db}
}

func (r *ProjectRepository) Create(p *models.Project) error {
	return r.db.Create(p).Error
}

func (r *ProjectRepository) List(limit, offset int) ([]models.Project, error) {
	var rows []models.Project
	err := r.db.Order("created_at DESC").Limit(limit).Offset(offset).Find(&rows).Error
	return rows, err
}

func (r *ProjectRepository) GetByID(id uuid.UUID) (*models.Project, error) {
	var p models.Project
	err := r.db.First(&p, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &p, nil
}

func (r *ProjectRepository) Update(p *models.Project) error {
	return r.db.Save(p).Error
}

func (r *ProjectRepository) Delete(id uuid.UUID) error {
	return r.db.Delete(&models.Project{}, "id = ?", id).Error
}
