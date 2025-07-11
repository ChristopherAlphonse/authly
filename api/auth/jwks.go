package auth

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/lestrrat-go/httprc/v3"
	"github.com/lestrrat-go/jwx/v3/jwk"
)

var (
	jwkCache *jwk.Cache
)

func keySetURL() string {
	url, exists := os.LookupEnv("BETTER_AUTH_URL")
	if !exists {
		url = "http://localhost:3000"
	}

	return fmt.Sprintf("%s/api/auth/jwks", url)
}

func StartKeyCache(ctx context.Context) error {
	// Initialize JWK cache with auto-refresh
	var err error
	jwkCache, err = jwk.NewCache(ctx, httprc.NewClient())

	err = jwkCache.Register(ctx, keySetURL())
	if err != nil {
		log.Fatal("Failed to register JWK set URL:", err)
	}

	return nil
}

func FetchJWKSet() (jwk.Set, error) {
	return jwkCache.Lookup(context.Background(), keySetURL())
}
