package repositories

import (
	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/bararug/website-backend/internal/models"
)

type ExpenseRepository struct {
	db *gorm.DB
}

func NewExpenseRepository(db *gorm.DB) *ExpenseRepository {
	return &ExpenseRepository{db: db}
}

func (r *ExpenseRepository) Create(e *models.Expense) error {
	return r.db.Create(e).Error
}

func (r *ExpenseRepository) List(limit, offset int) ([]models.Expense, error) {
	var rows []models.Expense
	err := r.db.Order("created_at DESC").Limit(limit).Offset(offset).Find(&rows).Error
	return rows, err
}

func (r *ExpenseRepository) GetByID(id uuid.UUID) (*models.Expense, error) {
	var e models.Expense
	err := r.db.First(&e, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &e, nil
}

func (r *ExpenseRepository) Update(e *models.Expense) error {
	return r.db.Save(e).Error
}

func (r *ExpenseRepository) Delete(id uuid.UUID) error {
	return r.db.Delete(&models.Expense{}, "id = ?", id).Error
}
