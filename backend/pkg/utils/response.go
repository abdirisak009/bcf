package utils

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type envelope struct {
	Success bool        `json:"success"`
	Data    any         `json:"data,omitempty"`
	Error   string      `json:"error,omitempty"`
	Message string      `json:"message,omitempty"`
}

// OK sends a successful JSON response.
func OK(c *gin.Context, status int, data any) {
	c.JSON(status, envelope{Success: true, Data: data})
}

// Fail sends an error JSON response.
func Fail(c *gin.Context, status int, msg string) {
	c.JSON(status, envelope{Success: false, Error: msg})
}

// FailValidation sends 400 with validation details.
func FailValidation(c *gin.Context, err error) {
	c.JSON(http.StatusBadRequest, envelope{Success: false, Error: err.Error()})
}
