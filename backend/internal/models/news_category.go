package models

import (
	"time"

	"github.com/google/uuid"
)

type NewsCategory struct {
	ID        uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	Name      string    `gorm:"size:160;not null;uniqueIndex" json:"name"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

func (NewsCategory) TableName() string { return "news_categories" }
