package models

import (
	"time"

	"github.com/google/uuid"
)

type Client struct {
	ID        uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	Name      string    `gorm:"size:255;not null" json:"name"`
	LogoURL   *string   `gorm:"column:logo_url;type:text" json:"logo_url,omitempty"`
	CreatedAt time.Time `json:"created_at"`
}

func (Client) TableName() string { return "clients" }
