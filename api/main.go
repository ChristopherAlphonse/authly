package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"log/slog"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/lestrrat-go/jwx/v2/jwk"
	"github.com/lestrrat-go/jwx/v2/jwt"
	"github.com/rs/cors"

	"github.com/dreamsofcode-io/authly/api/middleware"
)

type AuthResponse struct {
	Status  string `json:"status"`
	Message string `json:"message"`
	User    *User  `json:"user,omitempty"`
}

type User struct {
	ID    string `json:"id"`
	Email string `json:"email"`
	Name  string `json:"name"`
}

type ErrorResponse struct {
	Error string `json:"error"`
}

type contextKey string

const UserContextKey contextKey = "user"

func fetchJWKSet() (jwk.Set, error) {
	return jwk.Fetch(context.Background(), jwkSetURL)
}

func authMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")

		// Extract Bearer token from Authorization header
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			w.WriteHeader(http.StatusUnauthorized)
			json.NewEncoder(w).Encode(ErrorResponse{Error: "Missing Authorization header"})
			return
		}

		// Check if it starts with "Bearer "
		if !strings.HasPrefix(authHeader, "Bearer ") {
			w.WriteHeader(http.StatusUnauthorized)
			json.NewEncoder(w).Encode(ErrorResponse{Error: "Invalid Authorization header format"})
			return
		}

		// Extract token (remove "Bearer " prefix)
		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		if tokenString == "" {
			w.WriteHeader(http.StatusUnauthorized)
			json.NewEncoder(w).Encode(ErrorResponse{Error: "Empty token"})
			return
		}

		// Fetch JWK set
		keySet, err := fetchJWKSet()
		if err != nil {
			log.Printf("Failed to fetch JWK set: %v", err)
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(ErrorResponse{Error: "Failed to fetch keys"})
			return
		}

		// Parse and validate JWT token with JWK
		token, err := jwt.Parse([]byte(tokenString), jwt.WithKeySet(keySet))
		if err != nil {
			log.Printf("JWT parse error: %v", err)
			w.WriteHeader(http.StatusUnauthorized)
			json.NewEncoder(w).Encode(ErrorResponse{Error: "Invalid token"})
			return
		}

		// Extract user information from token claims
		userID, ok := token.Get("sub")
		if !ok {
			w.WriteHeader(http.StatusUnauthorized)
			json.NewEncoder(w).Encode(ErrorResponse{Error: "Missing user ID in token"})
			return
		}

		email, _ := token.Get("email")
		name, _ := token.Get("name")

		// Add user to context
		user := &User{
			ID:    userID.(string),
			Email: getString(email),
			Name:  getString(name),
		}

		ctx := context.WithValue(r.Context(), UserContextKey, user)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

// Helper function to safely convert interface{} to string
func getString(v interface{}) string {
	if v == nil {
		return ""
	}
	if s, ok := v.(string); ok {
		return s
	}
	return ""
}

func verifyAuthHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// Get user from context (set by authMiddleware)
	user, ok := r.Context().Value(UserContextKey).(*User)
	if !ok {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "User not found in context"})
		return
	}

	response := AuthResponse{
		Status:  "success",
		Message: "Token is valid",
		User:    user,
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}

func healthHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	response := map[string]interface{}{
		"status":    "healthy",
		"timestamp": time.Now().Unix(),
		"service":   "authly-api",
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}

var (
	jwkSetURL     = "http://localhost:3000/api/auth/jwks"
	betterAuthURL = "http://localhost:3000"
)

func main() {
	/*
		if url := os.Getenv("BETTER_AUTH_URL"); url != "" {
			betterAuthURL = url
			jwkSetURL = url + "/api/auth/jwks"
		}
		log.Printf("Using Better Auth URL: %s", betterAuthURL)
		log.Printf("Using JWK Set URL: %s", jwkSetURL)*/

	logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))
	router := http.NewServeMux()

	router.HandleFunc("/health", healthHandler)
	router.Handle("/api/auth/verify", authMiddleware(http.HandlerFunc(verifyAuthHandler)))

	// Add middleware chain
	handler := cors.AllowAll().Handler(middleware.Logging(logger, router))

	port := ":8080"
	log.Printf("Server starting on port %s", port)
	log.Printf("Available endpoints:")
	log.Printf("  GET /api/auth/verify - Verify authentication token (requires JWT)")
	log.Printf("  GET /health - Health check")
	log.Printf("JWK Set URL: %s", jwkSetURL)

	fmt.Println("Server listening on port :8080")
	if err := http.ListenAndServe(port, handler); err != nil {
		log.Fatal("Server failed to start:", err)
	}
}
