package services

import (
	"encoding/json"
	"errors"
	"strings"

	"github.com/google/uuid"
	"gorm.io/datatypes"

	"github.com/bararug/website-backend/internal/models"
	"github.com/bararug/website-backend/internal/repositories"
)

var ErrNewsTitleRequired = errors.New("title is required")

var ErrNewsInvalidCategory = errors.New("invalid category_id")

type NewsService struct {
	repo    *repositories.NewsRepository
	catRepo *repositories.NewsCategoryRepository
}

func NewNewsService(repo *repositories.NewsRepository, catRepo *repositories.NewsCategoryRepository) *NewsService {
	return &NewsService{repo: repo, catRepo: catRepo}
}

func (s *NewsService) List(limit, offset int) ([]models.News, error) {
	if limit <= 0 {
		limit = 20
	}
	return s.repo.List(limit, offset)
}

func (s *NewsService) GetByID(id uuid.UUID) (*models.News, error) {
	return s.repo.GetByID(id)
}

func (s *NewsService) Create(n *models.News) error {
	n.Title = strings.TrimSpace(n.Title)
	if n.Title == "" {
		return ErrNewsTitleRequired
	}
	if n.CategoryID != nil {
		ok, err := s.catRepo.Exists(*n.CategoryID)
		if err != nil {
			return err
		}
		if !ok {
			return ErrNewsInvalidCategory
		}
	}
	return s.repo.Create(n)
}

func (s *NewsService) Update(n *models.News) error {
	n.Title = strings.TrimSpace(n.Title)
	if n.Title == "" {
		return ErrNewsTitleRequired
	}
	if n.CategoryID != nil {
		ok, err := s.catRepo.Exists(*n.CategoryID)
		if err != nil {
			return err
		}
		if !ok {
			return ErrNewsInvalidCategory
		}
	}
	return s.repo.Update(n)
}

func (s *NewsService) Delete(id uuid.UUID) error {
	return s.repo.Delete(id)
}

// SetGalleryURLs marshals gallery URLs into the JSON column.
func (s *NewsService) SetGalleryURLs(n *models.News, urls []string) error {
	if len(urls) == 0 {
		n.GalleryURLs = datatypes.JSON([]byte("[]"))
		return nil
	}
	b, err := json.Marshal(urls)
	if err != nil {
		return err
	}
	n.GalleryURLs = datatypes.JSON(b)
	return nil
}
