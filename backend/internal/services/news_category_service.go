package services

import (
	"errors"
	"strings"

	"github.com/bararug/website-backend/internal/models"
	"github.com/bararug/website-backend/internal/repositories"
)

var ErrNewsCategoryNameRequired = errors.New("category name is required")

type NewsCategoryService struct {
	repo *repositories.NewsCategoryRepository
}

func NewNewsCategoryService(repo *repositories.NewsCategoryRepository) *NewsCategoryService {
	return &NewsCategoryService{repo: repo}
}

func (s *NewsCategoryService) List() ([]models.NewsCategory, error) {
	return s.repo.List()
}

func (s *NewsCategoryService) Create(c *models.NewsCategory) error {
	c.Name = strings.TrimSpace(c.Name)
	if c.Name == "" {
		return ErrNewsCategoryNameRequired
	}
	return s.repo.Create(c)
}
