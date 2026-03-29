package middleware

import (
	"crypto/subtle"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"

	"github.com/bararug/website-backend/internal/models"
	pkgutils "github.com/bararug/website-backend/pkg/utils"
)

const (
	CtxUserIDKey = "auth_user_id"
	CtxRoleKey   = "auth_role"
	CtxEmailKey  = "auth_email"
)

// Auth validates Bearer JWT and stores user id / role in context.
func Auth(jwtSecret string) gin.HandlerFunc {
	return func(c *gin.Context) {
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
		c.Next()
	}
}

// RequireRoles aborts with 403 unless the user's role is allowed.
func RequireRoles(allowed ...models.Role) gin.HandlerFunc {
	set := make(map[models.Role]struct{}, len(allowed))
	for _, r := range allowed {
		set[r] = struct{}{}
	}
	return func(c *gin.Context) {
		v, ok := c.Get(CtxRoleKey)
		if !ok {
			pkgutils.Fail(c, http.StatusUnauthorized, "unauthorized")
			c.Abort()
			return
		}
		role, ok := v.(models.Role)
		if !ok {
			pkgutils.Fail(c, http.StatusForbidden, "forbidden")
			c.Abort()
			return
		}
		if _, ok := set[role]; !ok {
			pkgutils.Fail(c, http.StatusForbidden, "forbidden")
			c.Abort()
			return
		}
		c.Next()
	}
}

// AuthNewsCreate allows POST /news when X-Dashboard-Key matches dashboardKey (if non-empty), otherwise Bearer JWT as admin or partner.
func AuthNewsCreate(jwtSecret string, dashboardKey string) gin.HandlerFunc {
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
		role := claims.Role
		if role != models.RoleAdmin && role != models.RolePartner {
			pkgutils.Fail(c, http.StatusForbidden, "forbidden")
			c.Abort()
			return
		}
		c.Next()
	}
}

// AuthPublicationCreate allows POST /publications when X-Dashboard-Key matches dashboardKey (if non-empty), otherwise Bearer JWT as admin only.
func AuthPublicationCreate(jwtSecret string, dashboardKey string) gin.HandlerFunc {
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
		if claims.Role != models.RoleAdmin {
			pkgutils.Fail(c, http.StatusForbidden, "forbidden")
			c.Abort()
			return
		}
		c.Next()
	}
}
