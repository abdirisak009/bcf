package models

import "github.com/google/uuid"

// UserPermission stores one granted dashboard permission for a user (non-admin).
// Admins implicitly have all permissions and typically have no rows here.
type UserPermission struct {
	UserID uuid.UUID `gorm:"type:uuid;primaryKey" json:"user_id"`
	Key    string    `gorm:"size:64;primaryKey" json:"key"`
}

func (UserPermission) TableName() string { return "user_permissions" }
