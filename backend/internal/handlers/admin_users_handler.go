package handlers

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"github.com/bararug/website-backend/internal/middleware"
	"github.com/bararug/website-backend/internal/services"
	pkgutils "github.com/bararug/website-backend/pkg/utils"
)

type AdminUsersHandler struct {
	svc *services.AdminUsersService
}

func NewAdminUsersHandler(svc *services.AdminUsersService) *AdminUsersHandler {
	return &AdminUsersHandler{svc: svc}
}

func (h *AdminUsersHandler) List(c *gin.Context) {
	list, err := h.svc.List()
	if err != nil {
		pkgutils.Fail(c, http.StatusInternalServerError, err.Error())
		return
	}
	pkgutils.OK(c, http.StatusOK, gin.H{"items": list})
}

func (h *AdminUsersHandler) Create(c *gin.Context) {
	var req services.AdminCreateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		pkgutils.FailValidation(c, err)
		return
	}
	out, err := h.svc.Create(&req)
	if err != nil {
		if errors.Is(err, services.ErrEmailTaken) {
			pkgutils.Fail(c, http.StatusConflict, err.Error())
			return
		}
		pkgutils.Fail(c, http.StatusBadRequest, err.Error())
		return
	}
	pkgutils.OK(c, http.StatusCreated, out)
}

func (h *AdminUsersHandler) Update(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		pkgutils.Fail(c, http.StatusBadRequest, "invalid id")
		return
	}
	var req services.AdminUpdateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		pkgutils.FailValidation(c, err)
		return
	}
	actorVal, ok := c.Get(middleware.CtxUserIDKey)
	if !ok {
		pkgutils.Fail(c, http.StatusUnauthorized, "unauthorized")
		return
	}
	actorID, ok := actorVal.(uuid.UUID)
	if !ok {
		pkgutils.Fail(c, http.StatusUnauthorized, "unauthorized")
		return
	}
	out, err := h.svc.Update(actorID, id, &req)
	if err != nil {
		switch {
		case errors.Is(err, services.ErrCannotDemoteSelf):
			pkgutils.Fail(c, http.StatusForbidden, err.Error())
		default:
			pkgutils.Fail(c, http.StatusBadRequest, err.Error())
		}
		return
	}
	pkgutils.OK(c, http.StatusOK, out)
}

func (h *AdminUsersHandler) Delete(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		pkgutils.Fail(c, http.StatusBadRequest, "invalid id")
		return
	}
	actorVal, ok := c.Get(middleware.CtxUserIDKey)
	if !ok {
		pkgutils.Fail(c, http.StatusUnauthorized, "unauthorized")
		return
	}
	actorID, ok := actorVal.(uuid.UUID)
	if !ok {
		pkgutils.Fail(c, http.StatusUnauthorized, "unauthorized")
		return
	}
	if err := h.svc.Delete(actorID, id); err != nil {
		switch {
		case errors.Is(err, services.ErrLastAdmin):
			pkgutils.Fail(c, http.StatusForbidden, err.Error())
		default:
			pkgutils.Fail(c, http.StatusBadRequest, err.Error())
		}
		return
	}
	pkgutils.OK(c, http.StatusOK, gin.H{"deleted": true})
}
