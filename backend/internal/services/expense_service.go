package services

import (
	"errors"

	"github.com/google/uuid"

	"github.com/bararug/website-backend/internal/models"
	"github.com/bararug/website-backend/internal/repositories"
)

type ExpenseService struct {
	repo *repositories.ExpenseRepository
}

func NewExpenseService(repo *repositories.ExpenseRepository) *ExpenseService {
	return &ExpenseService{repo: repo}
}

func validExpenseCategory(c string) bool {
	switch c {
	case models.ExpenseCategorySalary, models.ExpenseCategoryTransport, models.ExpenseCategoryOffice, models.ExpenseCategoryMarketing, models.ExpenseCategoryOther:
		return true
	default:
		return false
	}
}

func (s *ExpenseService) Create(e *models.Expense, createdBy *uuid.UUID) error {
	if e.Amount < 0 {
		return errors.New("invalid amount")
	}
	if e.Category == "" {
		e.Category = models.ExpenseCategoryOffice
	}
	if !validExpenseCategory(e.Category) {
		return errors.New("category must be salary, transport, office, marketing, or other")
	}
	if e.Currency == "" {
		e.Currency = "USD"
	}
	e.CreatedBy = createdBy
	return s.repo.Create(e)
}

func (s *ExpenseService) List(limit, offset int) ([]models.Expense, error) {
	return s.repo.List(limit, offset)
}

func (s *ExpenseService) GetByID(id uuid.UUID) (*models.Expense, error) {
	return s.repo.GetByID(id)
}

func (s *ExpenseService) Update(e *models.Expense) error {
	if e.Amount < 0 {
		return errors.New("invalid amount")
	}
	if e.Category != "" && !validExpenseCategory(e.Category) {
		return errors.New("category must be salary, transport, office, marketing, or other")
	}
	if e.Currency == "" {
		e.Currency = "USD"
	}
	return s.repo.Update(e)
}

func (s *ExpenseService) Delete(id uuid.UUID) error {
	return s.repo.Delete(id)
}
