package models

import (
	"time"

	"github.com/google/uuid"
)

type Role string

const (
	RoleAdmin   Role = "admin"
	RoleUser    Role = "user"
	RolePartner Role = "partner"
)

// User maps to table `users`.
type User struct {
	ID           uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	Email        string    `gorm:"size:255;not null;uniqueIndex:uni_users_email" json:"email"`
	PasswordHash string    `gorm:"column:password_hash;size:255;not null" json:"-"`
	Role         Role      `gorm:"size:20;not null" json:"role"`
	CreatedAt    time.Time `json:"created_at"`
}

func (User) TableName() string { return "users" }

// UserPublic is safe to return from APIs (no password).
type UserPublic struct {
	ID          uuid.UUID `json:"id"`
	Email       string    `json:"email"`
	Role        Role      `json:"role"`
	Permissions []string  `json:"permissions,omitempty"`
}
