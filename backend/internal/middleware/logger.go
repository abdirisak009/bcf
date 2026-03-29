package middleware

import (
	"github.com/gin-gonic/gin"
)

// Logger wraps Gin's structured request logger (timestamp, method, path, status, latency).
func Logger() gin.HandlerFunc {
	return gin.Logger()
}
