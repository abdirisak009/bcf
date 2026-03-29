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

// SumAmountsByProjectID returns total expense amount per project (only rows with a project_id).
func (r *ExpenseRepository) SumAmountsByProjectID(projectIDs []uuid.UUID) (map[uuid.UUID]float64, error) {
	out := make(map[uuid.UUID]float64)
	if len(projectIDs) == 0 {
		return out, nil
	}
	type agg struct {
		ProjectID uuid.UUID `gorm:"column:project_id"`
		SumAmount float64   `gorm:"column:sum_amount"`
	}
	var rows []agg
	err := r.db.Model(&models.Expense{}).
		Select("project_id, COALESCE(SUM(amount), 0) AS sum_amount").
		Where("project_id IN ?", projectIDs).
		Group("project_id").
		Scan(&rows).Error
	if err != nil {
		return nil, err
	}
	for _, row := range rows {
		out[row.ProjectID] = row.SumAmount
	}
	return out, nil
}
