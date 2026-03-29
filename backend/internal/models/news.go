package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/datatypes"
)

type News struct {
	ID               uuid.UUID       `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	Title            string          `gorm:"type:text;not null" json:"title"`
	Excerpt          *string         `gorm:"type:text" json:"excerpt,omitempty"`
	Body             *string         `gorm:"type:text" json:"body,omitempty"`
	Category         *string         `gorm:"size:120" json:"category,omitempty"`
	CategoryID       *uuid.UUID      `gorm:"type:uuid;index" json:"category_id,omitempty"`
	CategoryRef      *NewsCategory   `gorm:"foreignKey:CategoryID" json:"category_ref,omitempty"`
	FeaturedImageURL *string         `gorm:"type:text" json:"featured_image_url,omitempty"`
	GalleryURLs      datatypes.JSON  `gorm:"column:gallery_urls;type:jsonb" json:"gallery_urls"`
	PublishedAt      *time.Time      `json:"published_at,omitempty"`
	CreatedAt        time.Time       `json:"created_at"`
	UpdatedAt        time.Time       `json:"updated_at"`
}

func (News) TableName() string { return "news_items" }
