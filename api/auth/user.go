package auth

import (
	"errors"
	"fmt"
	"net/http"
)

type User struct {
	ID    string
	Email string
	Name  string
}

var (
	ErrMissingUserID = errors.New("missing user id")
)

func UserFromRequest(r *http.Request) (User, error) {
	tokenStr, err := GetBearerToken(r)
	if err != nil {
		return User{}, fmt.Errorf("get bearer token: %w", err)
	}

	token, err := ParseToken(tokenStr)

	userID, exists := token.Subject()
	if !exists {
		return User{}, ErrMissingUserID
	}

	var email string
	var name string

	token.Get("email", &email)
	token.Get("name", &name)

	// Add user to context
	user := User{
		ID:    userID,
		Email: email,
		Name:  name,
	}

	return user, nil
}
