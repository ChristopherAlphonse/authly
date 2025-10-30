# Better-Auth with Go JWT Implementation

Continuation of https://github.com/dreamsofcode-io/authly

## Overview

This implementation showcases a modern authentication flow where:

- The frontend uses Better-Auth (a TypeScript authentication library) with Next.js
- The backend is built with Go and validates JWTs issued by Better-Auth
- Authentication state is shared between the Next.js app and Go API using JWT tokens

## Project Structure

### [Frontend Application](/app)

A Next.js application that implements:

- User registration and login flows using Better-Auth
- Session management with JWT tokens
- Protected routes and authentication status display
- Integration with PostgreSQL via Drizzle ORM

### [Go API Backend](/api)

A Go service that:

- Validates JWT tokens issued by Better-Auth
- Implements JWKS (JSON Web Key Set) endpoint for public key distribution
- Provides protected API endpoints that require valid authentication
- Includes middleware for JWT verification and request logging

## How It Works

1. **Authentication Flow**: Users authenticate through the Next.js frontend using Better-Auth, which handles user registration, login, and session management.

2. **JWT Generation**: Better-Auth generates JWT tokens signed with a private key when users authenticate successfully.

3. **Token Validation**: The Go backend validates these JWT tokens using the public key exposed through the JWKS endpoint, ensuring requests are from authenticated users.

4. **Shared Authentication**: Both the Next.js app and Go API can verify the same JWT tokens, enabling seamless authentication across different services.

## Getting Started

> **New to the project? Start here:** [Quick Start Guide](QUICK_START.md) - Get up and running in 5 minutes!

### Prerequisites

- [Node.js](https://nodejs.org/) (v20 or later)
- [Go](https://golang.org/) (v1.21 or later)
- [Docker](https://www.docker.com/) and Docker Compose

### Quick Start - Full Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd authly
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd app && yarn install && cd ..
   ```

3. **Set up PostgreSQL with Docker**
   ```bash
   npm run docker:up
   ```

   This starts a PostgreSQL database using the official [postgres:14.19-alpine3.21](https://hub.docker.com/_/postgres) Docker image with the following configuration:
   - **Host**: `localhost`
   - **Port**: `5433` (to avoid conflicts with local PostgreSQL)
   - **Database**: `authly`
   - **User**: `authly`
   - **Password**: `authly_dev_password`

4. **Configure environment variables**

   Create a `.env` file in the `app` directory with:
   ```bash
   DATABASE_URL=postgresql://authly:authly_dev_password@localhost:5433/authly
   ```

5. **Initialize the database**
   ```bash
   npm run db:setup
   ```

6. **Run the application**
   ```bash
   npm run dev
   ```

   This will start:
   - Backend Go API on `http://localhost:8080`
   - Frontend Next.js app on `http://localhost:5173`

### Docker Management

- `npm run docker:up` - Start PostgreSQL in Docker (detached mode)
- `npm run docker:down` - Stop and remove PostgreSQL container
- `npm run docker:logs` - View PostgreSQL logs
- `npm run docker:restart` - Restart PostgreSQL container

### Database Management

- `npm run db:setup` - Start Docker PostgreSQL and push schema
- `npm run db:studio` - Open Drizzle Studio (database GUI)

### Development Scripts

- `npm run dev` - Run both backend and frontend in development mode
- `npm run dev:backend` - Run only the Go API backend
- `npm run dev:frontend` - Run only the Next.js frontend
- `npm run start` - Run both services in production mode

### Individual Service Setup

Check the individual README files in each project directory for specific setup instructions:

- [Frontend Setup](/app/README.md)
- [Backend Setup](/api/README.md)


