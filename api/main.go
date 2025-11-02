package main

import (
	"encoding/json"
	"fmt"
	"log"
	"log/slog"
	"net/http"
	"os"
	"github.com/dreamsofcode-io/authly/api/auth"
	"github.com/dreamsofcode-io/authly/api/middleware"
	"github.com/rs/cors"
)

type AuthResponse struct {
	Status  string     `json:"status"`
	Message string     `json:"message"`
	User    *auth.User `json:"user,omitempty"`
}

type ErrorResponse struct {
	Error string `json:"error"`
}

type contextKey string

const UserContextKey contextKey = "user"

var logger *slog.Logger

func verifyAuthHandler(w http.ResponseWriter, r *http.Request) {
	// Get user from request
	user, err := auth.UserFromRequest(r)
	if err != nil {
		slog.Error("failed to get user", slog.Any("error", err))

		// Return 401 Unauthorized with appropriate error message
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusUnauthorized)

		errorMessage := "Authentication failed"

		errorResponse := ErrorResponse{
			Error: errorMessage,
		}
		json.NewEncoder(w).Encode(errorResponse)
		return
	}

	response := AuthResponse{
		Status:  "success",
		Message: "Token is valid",
		User:    &user,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func main() {
	logger = slog.New(slog.NewJSONHandler(os.Stdout, nil))

	router := http.NewServeMux()

	router.HandleFunc("/health", healthHandler)
	router.Handle("/api/auth/verify", http.HandlerFunc(verifyAuthHandler))
	router.Handle("/api/me", http.HandlerFunc(verifyAuthHandler))

	// Get allowed origins from environment, default to localhost for development
	allowedOrigins := []string{"http://localhost:5173"}
	if origins := os.Getenv("ALLOWED_ORIGINS"); origins != "" {
		allowedOrigins = []string{origins}
	}

	// Enable CORS
	handler := cors.New(cors.Options{
		AllowedOrigins: allowedOrigins,
		AllowedMethods: []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders: []string{"Content-Type", "Authorization"},
	}).Handler(middleware.Logging(logger, router))

	// Get port from environment, default to 8080
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	if port[0] != ':' {
		port = ":" + port
	}

	fmt.Println("Server starting on port", port)
	fmt.Println("Allowed origins:", allowedOrigins)

	if err := http.ListenAndServe(port, handler); err != nil {
		log.Fatal("Server failed to start:", err)
	}
}
