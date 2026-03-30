package models

import (
	"time"

	"github.com/google/uuid"
)

type Partner struct {
	ID        uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	Name      string    `gorm:"size:255;not null" json:"name"`
	LogoURL   *string   `gorm:"column:logo_url;type:text" json:"logo_url,omitempty"`
	SortOrder int       `gorm:"default:0;not null" json:"sort_order"`
	CreatedAt time.Time `json:"created_at"`
}

func (Partner) TableName() string { return "partners" }
