package models

import (
	"time"

	"github.com/google/uuid"
)

// FreeTrainingProgram is a shareable free training offer (table: free_training_programs).
type FreeTrainingProgram struct {
	ID              uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	Title           string    `gorm:"type:text;not null" json:"title"`
	Slug            string    `gorm:"size:160;uniqueIndex;not null" json:"slug"`
	VenueLocation   string    `gorm:"type:text;not null" json:"venue_location"`
	Content         string    `gorm:"type:text;not null" json:"content"`
	Outcomes        string    `gorm:"type:text;not null" json:"outcomes"`
	SuccessMessage  string    `gorm:"type:text;not null;default:''" json:"success_message"`
	// CertificateDownloadEnabled: when true, registrations in Shortlisted or Precepts may download a PDF certificate (phone match).
	CertificateDownloadEnabled bool `gorm:"not null;default:true" json:"certificate_download_enabled"`
	IsActive                   bool `gorm:"not null;default:true" json:"is_active"`
	// CertificateSignatureImageURL optional PNG/JPEG for certificates issued for this program.
	CertificateSignatureImageURL *string `gorm:"type:text" json:"certificate_signature_image_url,omitempty"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
}

func (FreeTrainingProgram) TableName() string { return "free_training_programs" }

// FreeTrainingRegistration is a self-service signup (table: free_training_registrations).
type FreeTrainingRegistration struct {
	ID         uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	ProgramID  uuid.UUID `gorm:"type:uuid;not null;index" json:"program_id"`
	Program    *FreeTrainingProgram `gorm:"foreignKey:ProgramID" json:"program,omitempty"`
	FullName   string    `gorm:"size:255;not null" json:"full_name"`
	Email      string    `gorm:"size:255;not null;index" json:"email"`
	Phone      string    `gorm:"size:80" json:"phone"`
	Location   string    `gorm:"type:text;not null" json:"location"`
	Gender     string    `gorm:"size:16" json:"gender"`
	Message    *string   `gorm:"type:text" json:"message,omitempty"`
	Status     string    `gorm:"size:32;not null;default:pending_review;index" json:"status"`
	AdminNotes *string   `gorm:"type:text" json:"admin_notes,omitempty"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}

func (FreeTrainingRegistration) TableName() string { return "free_training_registrations" }
