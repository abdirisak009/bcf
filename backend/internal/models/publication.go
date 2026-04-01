package models

import (
	"time"

	"github.com/google/uuid"
)

type Publication struct {
	ID              uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	Title           string    `gorm:"type:text;not null" json:"title"`
	Excerpt         *string   `gorm:"type:text" json:"excerpt,omitempty"`
	Category        *string   `gorm:"size:120" json:"category,omitempty"`
	CoverImageURL   *string   `gorm:"column:cover_image_url;type:text" json:"cover_image_url,omitempty"`
	FileURL         *string   `gorm:"column:file_url;type:text" json:"file_url,omitempty"`
	FileDisplayMode string    `gorm:"column:file_display_mode;size:16;default:download" json:"file_display_mode"`
	CreatedAt       time.Time `json:"created_at"`
}

func (Publication) TableName() string { return "publications" }
