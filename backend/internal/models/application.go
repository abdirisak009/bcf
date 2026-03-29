package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/datatypes"
)

// Application is a training application (table: training_applications).
type Application struct {
	ID         uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	TrainingID uuid.UUID `gorm:"type:uuid;not null;index" json:"training_id"`
	Training   *Training `gorm:"foreignKey:TrainingID" json:"training,omitempty"`
	Email      string    `gorm:"size:255;not null" json:"email"`
	FirstName  *string   `gorm:"size:255" json:"first_name,omitempty"`
	LastName   *string   `gorm:"size:255" json:"last_name,omitempty"`
	Phone      *string   `gorm:"size:80" json:"phone,omitempty"`
	Company    *string   `gorm:"size:255" json:"company,omitempty"`
	Message    *string   `gorm:"type:text" json:"message,omitempty"`
	Status     string    `gorm:"size:50;not null;default:pending" json:"status"`
	CreatedAt  time.Time `json:"created_at"`

	// ApplicantType: "individual" | "organization" (default individual for legacy rows).
	ApplicantType       string         `gorm:"size:20;not null;default:individual" json:"applicant_type,omitempty"`
	JobTitle            *string        `gorm:"size:255" json:"job_title,omitempty"`
	EmployeeCountBand   *string        `gorm:"size:32" json:"employee_count_band,omitempty"`
	EmployeeCountCustom *string        `gorm:"size:128" json:"employee_count_custom,omitempty"`
	ParticipantCount    *int           `json:"participant_count,omitempty"`
	ParticipantRoles    datatypes.JSON `gorm:"type:jsonb" json:"participant_roles,omitempty"`
	TrainingFormat      *string        `gorm:"size:32" json:"training_format,omitempty"`
}

func (Application) TableName() string { return "training_applications" }
