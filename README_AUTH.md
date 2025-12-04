# Authentication System Documentation

## Overview
This project now uses JWT-based authentication with `bcrypt` for password hashing and `jsonwebtoken` for token management. It replaces the previous `passport-local` session-based authentication.

## Changes Made
- **Dependencies**: Added `bcrypt`, `jsonwebtoken`, `cookie-parser` (and types).
- **Auth Helpers**: `server/auth.ts` updated with `hashPassword`, `comparePasswords`, `signAccessToken`, `signRefreshToken`.
- **Middleware**: `server/middleware/requireAuth.ts` protects routes by verifying the access token from the `Authorization` header or cookies.
- **Routes**: `server/routes/auth.ts` adds:
    - `POST /auth/register`: Register new user.
    - `POST /auth/login`: Login and receive access/refresh tokens.
    - `POST /auth/refresh`: Refresh access token using httpOnly cookie.
    - `POST /auth/logout`: Clear refresh token cookie.
- **Database**: `users` table updated to store `email`, `password_hash`, `display_name`. All user-owned tables now have a `user_id` foreign key.

## Setup Instructions

### 1. Install Dependencies
Run the following command to install the required packages:
```bash
npm install bcrypt jsonwebtoken cookie-parser @types/bcrypt @types/jsonwebtoken @types/cookie-parser
```

### 2. Environment Variables
Add the following to your `.env` file:
```env
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=your_super_secret_refresh_key
REFRESH_TOKEN_EXPIRES_IN=7d
```

### 3. Run Database Migrations
Apply the SQL migration to update your database schema:
```bash
psql -d <your_database_name> -f migrations/20250101_jwt_users_and_ownership.sql
```

## API Endpoints & Testing (Curl)

### Register
```bash
curl -X POST http://localhost:5000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","displayName":"Test User"}'
```
**Expect**: `201 Created` with user details.

### Login
```bash
curl -i -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```
**Expect**: `200 OK` with `accessToken` in body and `refresh_token` in `Set-Cookie` header.

### Refresh Token
```bash
curl -i -X POST http://localhost:5000/auth/refresh \
  --cookie "refresh_token=<your_refresh_token_cookie_value>"
```
**Expect**: `200 OK` with new `accessToken`.

### Protected Route Example
```bash
curl -H "Authorization: Bearer <ACCESS_TOKEN>" http://localhost:5000/api/documents
```
**Expect**: `200 OK` (list of documents) or `401 Unauthorized` if token is missing/invalid.

### Logout
```bash
curl -X POST http://localhost:5000/auth/logout \
  --cookie "refresh_token=<your_refresh_token_cookie_value>"
```
**Expect**: `200 OK` and cookie cleared.

## Security Notes
- **Refresh Tokens**: Stored in httpOnly, Secure, SameSite=Strict cookies to prevent XSS.
- **Access Tokens**: Short-lived (15m). Client should store in memory (not localStorage) if possible, or handle with care.
- **CSRF**: Since refresh tokens are in cookies, ensure your frontend uses proper CSRF protection if applicable (though SameSite=Strict helps significantly).

## Revert Instructions
To revert to the previous state:
1.  **Git Revert**:
    ```bash
    git checkout server/auth.ts server/routes.ts server/index.ts shared/schema.ts
    rm server/middleware/requireAuth.ts server/routes/auth.ts migrations/20250101_jwt_users_and_ownership.sql
    ```
2.  **Database Rollback**:
    Execute the following SQL:
    ```sql
    DROP TABLE IF EXISTS users CASCADE;
    ALTER TABLE documents DROP COLUMN IF EXISTS user_id;
    -- Repeat for all modified tables
    ```
