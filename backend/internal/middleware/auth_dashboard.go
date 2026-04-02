package middleware

import (
	"crypto/subtle"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"

	"github.com/bararug/website-backend/config"
	"github.com/bararug/website-backend/internal/models"
	"github.com/bararug/website-backend/internal/permissions"
	"github.com/bararug/website-backend/internal/repositories"
	pkgutils "github.com/bararug/website-backend/pkg/utils"
)

func secureStringEq(a, b string) bool {
	if len(a) != len(b) {
		return false
	}
	return subtle.ConstantTimeCompare([]byte(a), []byte(b)) == 1
}

// AuthDashboard allows X-Dashboard-Key (full access), or JWT with admin role (full access),
// or JWT with explicit permission in user_permissions (or partner default: news only).
func AuthDashboard(jwtSecret string, dashboardKey string, authRepo *repositories.AuthRepository, requiredPerm string) gin.HandlerFunc {
	return func(c *gin.Context) {
		if len(dashboardKey) > 0 {
			got := strings.TrimSpace(c.GetHeader("X-Dashboard-Key"))
			if len(got) > 0 && secureStringEq(got, strings.TrimSpace(dashboardKey)) {
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

// UserHasDashboardPermission is the same rule as AuthDashboard for a single permission key.
func UserHasDashboardPermission(role models.Role, perms []string, required string) bool {
	return userHasDashboardPerm(role, perms, required)
}

// AuthDashboardIdentity validates (in order): optional dev-only bypass header, X-Dashboard-Key, or Bearer JWT.
// It does not check a specific permission — handlers may enforce permission after parsing the body (e.g. multipart upload by folder).
func AuthDashboardIdentity(cfg *config.Config) gin.HandlerFunc {
	if cfg == nil {
		panic("middleware: AuthDashboardIdentity requires Config")
	}
	return func(c *gin.Context) {
		// Dev only: X-Dev-Upload-Bypass when APP_ENV=development and DEV_UPLOAD_BYPASS_KEY is set. Never set the key in production.
		if strings.EqualFold(strings.TrimSpace(cfg.Environment), "development") {
			if want := strings.TrimSpace(cfg.DevUploadBypassKey); len(want) > 0 {
				got := strings.TrimSpace(c.GetHeader("X-Dev-Upload-Bypass"))
				if secureStringEq(got, want) {
					c.Set(CtxRoleKey, models.RoleAdmin)
					c.Next()
					return
				}
			}
		}

		dk := strings.TrimSpace(cfg.DashboardWriteKey)
		if len(dk) > 0 {
			got := strings.TrimSpace(c.GetHeader("X-Dashboard-Key"))
			if len(got) > 0 && secureStringEq(got, dk) {
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
		claims, err := pkgutils.ParseJWT(cfg.JWTSecret, raw)
		if err != nil {
			pkgutils.Fail(c, http.StatusUnauthorized, "invalid or expired token")
			c.Abort()
			return
		}
		c.Set(CtxUserIDKey, claims.UserID)
		c.Set(CtxRoleKey, claims.Role)
		c.Set(CtxEmailKey, claims.Email)
		c.Next()
	}
}

// AuthAdminOrKey allows X-Dashboard-Key or JWT with admin role only (user management, etc.).
func AuthAdminOrKey(jwtSecret string, dashboardKey string) gin.HandlerFunc {
	return func(c *gin.Context) {
		if len(dashboardKey) > 0 {
			got := strings.TrimSpace(c.GetHeader("X-Dashboard-Key"))
			if len(got) > 0 && secureStringEq(got, strings.TrimSpace(dashboardKey)) {
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
