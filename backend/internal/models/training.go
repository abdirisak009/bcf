package models

import (
	"encoding/json"
	"time"

	"github.com/google/uuid"
)

// Training is a course under an academy (catalogue fields: duration, format, level, curriculum, outcomes).
type Training struct {
	ID           uuid.UUID       `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	AcademyID    *uuid.UUID      `gorm:"type:uuid;index" json:"academy_id,omitempty"`
	Academy      *Academy        `gorm:"foreignKey:AcademyID" json:"academy,omitempty"`
	Title        string          `gorm:"type:text;not null" json:"title"`
	Description  *string         `gorm:"type:text" json:"description,omitempty"`
	Slug         *string         `gorm:"size:255;uniqueIndex:uni_trainings_slug" json:"slug,omitempty"`
	Duration     *string         `gorm:"size:120" json:"duration,omitempty"`
	Format       *string         `gorm:"size:120" json:"format,omitempty"`
	Level        *string         `gorm:"size:255" json:"level,omitempty"`
	Curriculum   json.RawMessage `gorm:"type:jsonb" json:"curriculum,omitempty"`
	Outcomes     json.RawMessage `gorm:"type:jsonb" json:"outcomes,omitempty"`
	CreatedAt    time.Time       `json:"created_at"`
	Applications []Application   `gorm:"foreignKey:TrainingID;constraint:OnDelete:CASCADE" json:"-"`
}

func (Training) TableName() string { return "trainings" }
