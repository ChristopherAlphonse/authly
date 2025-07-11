package auth

import (
	"errors"
	"net/http"
	"strings"
)

var (
	ErrMissingAuthorizationHeader = errors.New("missing Authorization header")
	ErrInvalidAuthorizationHeader = errors.New("invalid Authorization header")
	ErrEmptyToken                 = errors.New("empty token")
)

func GetBearerToken(r *http.Request) (string, error) {
	authHeader := r.Header.Get("Authorization")
	if authHeader == "" {
		return "", ErrMissingAuthorizationHeader
	}

	if !strings.HasPrefix(authHeader, "Bearer ") {
		return "", ErrInvalidAuthorizationHeader
	}

	token := strings.TrimPrefix(authHeader, "Bearer ")
	if token == "" {
		return "", ErrEmptyToken
	}

	return token, nil
}
