package auth

import (
	"errors"
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
	return User{}, nil
}
