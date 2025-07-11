package auth

import (
	"errors"
	"fmt"

	"github.com/lestrrat-go/jwx/v3/jwt"
)

var (
	ErrInvalidToken = errors.New("invalid token")
)

func ParseToken(tokenStr string) (jwt.Token, error) {
	keySet, err := FetchJWKSet()
	if err != nil {
		return nil, fmt.Errorf("fetch key set: %w", err)
	}

	// Parse and validate JWT token with JWK
	token, err := jwt.Parse([]byte(tokenStr), jwt.WithKeySet(keySet))
	if err != nil {
		return nil, ErrInvalidToken
	}

	return token, nil
}
