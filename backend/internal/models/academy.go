package models

import (
	"time"

	"github.com/google/uuid"
)

type Academy struct {
	ID          uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	Name        string     `gorm:"size:255;not null" json:"name"`
	Description *string    `gorm:"type:text" json:"description,omitempty"`
	Slug        *string    `gorm:"size:255;uniqueIndex:uni_academies_slug" json:"slug,omitempty"`
	SortOrder   int        `gorm:"default:0" json:"sort_order"`
	CreatedAt   time.Time  `json:"created_at"`
	Trainings   []Training `gorm:"foreignKey:AcademyID" json:"trainings,omitempty"`
}

func (Academy) TableName() string { return "academies" }
