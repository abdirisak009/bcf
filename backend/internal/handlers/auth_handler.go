package handlers

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"

	"github.com/bararug/website-backend/internal/services"
	pkgutils "github.com/bararug/website-backend/pkg/utils"
)

type AuthHandler struct {
	svc *services.AuthService
}

func NewAuthHandler(svc *services.AuthService) *AuthHandler {
	return &AuthHandler{svc: svc}
}

func (h *AuthHandler) Register(c *gin.Context) {
	var req services.RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		pkgutils.FailValidation(c, err)
		return
	}
	out, err := h.svc.Register(&req)
	if err != nil {
		if errors.Is(err, services.ErrEmailTaken) {
			pkgutils.Fail(c, http.StatusConflict, err.Error())
			return
		}
		pkgutils.Fail(c, http.StatusInternalServerError, err.Error())
		return
	}
	pkgutils.OK(c, http.StatusCreated, out)
}

func (h *AuthHandler) Login(c *gin.Context) {
	var req services.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		pkgutils.FailValidation(c, err)
		return
	}
	out, err := h.svc.Login(&req)
	if err != nil {
		if errors.Is(err, services.ErrInvalidCredentials) {
			pkgutils.Fail(c, http.StatusUnauthorized, err.Error())
			return
		}
		pkgutils.Fail(c, http.StatusInternalServerError, err.Error())
		return
	}
	pkgutils.OK(c, http.StatusOK, out)
}
