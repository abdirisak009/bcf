package middleware

import (
	"crypto/subtle"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"

	"github.com/bararug/website-backend/internal/models"
	"github.com/bararug/website-backend/internal/permissions"
	"github.com/bararug/website-backend/internal/repositories"
	pkgutils "github.com/bararug/website-backend/pkg/utils"
)

// AuthDashboard allows X-Dashboard-Key (full access), or JWT with admin role (full access),
// or JWT with explicit permission in user_permissions (or partner default: news only).
func AuthDashboard(jwtSecret string, dashboardKey string, authRepo *repositories.AuthRepository, requiredPerm string) gin.HandlerFunc {
	return func(c *gin.Context) {
		if len(dashboardKey) > 0 {
			got := strings.TrimSpace(c.GetHeader("X-Dashboard-Key"))
			if len(got) > 0 && subtle.ConstantTimeCompare([]byte(got), []byte(dashboardKey)) == 1 {
				c.Set(CtxRoleKey, models.RoleAdmin)
				c.Next()
				return
			}
		}
		h := c.GetHeader("Authorization")
		if h == "" || !strings.HasPrefix(strings.ToLower(h), "bearer ") {
			pkgutils.Fail(c, http.StatusUnauthorized, "missing or invalid authorization header")
			c.Abort()
			return
		}
		raw := strings.TrimSpace(h[7:])
		claims, err := pkgutils.ParseJWT(jwtSecret, raw)
		if err != nil {
			pkgutils.Fail(c, http.StatusUnauthorized, "invalid or expired token")
			c.Abort()
			return
		}
		c.Set(CtxUserIDKey, claims.UserID)
		c.Set(CtxRoleKey, claims.Role)
		c.Set(CtxEmailKey, claims.Email)

		if claims.Role == models.RoleAdmin {
			c.Next()
			return
		}

		perms, err := authRepo.GetPermissionKeys(claims.UserID)
		if err != nil {
			pkgutils.Fail(c, http.StatusInternalServerError, err.Error())
			c.Abort()
			return
		}
		if userHasDashboardPerm(claims.Role, perms, requiredPerm) {
			c.Next()
			return
		}
		pkgutils.Fail(c, http.StatusForbidden, "forbidden")
		c.Abort()
	}
}

func userHasDashboardPerm(role models.Role, perms []string, required string) bool {
	if role == models.RoleAdmin {
		return true
	}
	if role == models.RolePartner && len(perms) == 0 {
		return required == permissions.News
	}
	for _, p := range perms {
		if p == required {
			return true
		}
	}
	return false
}

// AuthAdminOrKey allows X-Dashboard-Key or JWT with admin role only (user management, etc.).
func AuthAdminOrKey(jwtSecret string, dashboardKey string) gin.HandlerFunc {
	return func(c *gin.Context) {
		if len(dashboardKey) > 0 {
			got := strings.TrimSpace(c.GetHeader("X-Dashboard-Key"))
			if len(got) > 0 && subtle.ConstantTimeCompare([]byte(got), []byte(dashboardKey)) == 1 {
				c.Set(CtxRoleKey, models.RoleAdmin)
				c.Next()
				return
			}
		}
		h := c.GetHeader("Authorization")
		if h == "" || !strings.HasPrefix(strings.ToLower(h), "bearer ") {
			pkgutils.Fail(c, http.StatusUnauthorized, "missing or invalid authorization header")
			c.Abort()
			return
		}
		raw := strings.TrimSpace(h[7:])
		claims, err := pkgutils.ParseJWT(jwtSecret, raw)
		if err != nil {
			pkgutils.Fail(c, http.StatusUnauthorized, "invalid or expired token")
			c.Abort()
			return
		}
		if claims.Role != models.RoleAdmin {
			pkgutils.Fail(c, http.StatusForbidden, "forbidden")
			c.Abort()
			return
		}
		c.Set(CtxUserIDKey, claims.UserID)
		c.Set(CtxRoleKey, claims.Role)
		c.Set(CtxEmailKey, claims.Email)
		c.Next()
	}
}
