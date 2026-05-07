# API Documentation

## Base URL
```
http://localhost:8000/api
```

## Authentication

All protected endpoints require an `Authorization` header:
```
Authorization: Bearer {access_token}
```

## Error Responses

All error responses follow this format:
```json
{
  "detail": "Error message describing what went wrong"
}
```

### Common HTTP Status Codes
- `200 OK` - Request successful
- `201 Created` - Resource created
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Missing or invalid authentication
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

---

## Endpoints

### 1. User Registration

**Endpoint:** `POST /auth/register`

**Description:** Register a new user account

**Request Body:**
```json
{
  "full_name": "John Doe",
  "business_email": "john@company.com",
  "system_role": "user",
  "password": "SecurePass123",
  "confirm_password": "SecurePass123"
}
```

**Parameters:**
- `full_name` (string, required): User's full name (2-100 characters)
- `business_email` (string, required): Valid email address
- `system_role` (string, required): One of `user`, `manager`, `admin`
- `password` (string, required): Password (min 8 characters)
- `confirm_password` (string, required): Must match password

**Success Response (200):**
```json
{
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "john@company.com",
  "full_name": "John Doe",
  "message": "Account created successfully"
}
```

**Error Responses:**

Invalid email format (400):
```json
{
  "detail": "Invalid email format"
}
```

User already exists (400):
```json
{
  "detail": "User with this email already exists"
}
```

Passwords don't match (400):
```json
{
  "detail": "Passwords do not match"
}
```

Weak password (400):
```json
{
  "detail": "Password must contain uppercase, lowercase, and digits"
}
```

---

### 2. User Login

**Endpoint:** `POST /auth/login`

**Description:** Authenticate user and receive tokens

**Request Body:**
```json
{
  "email": "john@company.com",
  "password": "SecurePass123"
}
```

**Parameters:**
- `email` (string, required): User's email
- `password` (string, required): User's password

**Success Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "john@company.com",
  "full_name": "John Doe",
  "system_role": "user"
}
```

**Error Responses:**

Invalid credentials (401):
```json
{
  "detail": "Invalid email or password"
}
```

Inactive account (400):
```json
{
  "detail": "User account is inactive"
}
```

---

### 3. Forgot Password

**Endpoint:** `POST /auth/forgot-password`

**Description:** Request a password reset code

**Request Body:**
```json
{
  "email": "john@company.com"
}
```

**Parameters:**
- `email` (string, required): User's email address

**Success Response (200):**
```json
{
  "message": "If email exists, reset code will be sent",
  "reset_code": "123456"
}
```

**Note:** For security reasons, the API returns a success message even if the email doesn't exist. The reset code is included in the development response but should be sent via email in production.

---

### 4. Verify Reset Code

**Endpoint:** `POST /auth/verify-reset-code`

**Description:** Verify the reset code sent to user's email

**Request Body:**
```json
{
  "email": "john@company.com",
  "reset_code": "123456"
}
```

**Parameters:**
- `email` (string, required): User's email address
- `reset_code` (string, required): 6-digit code received

**Success Response (200):**
```json
{
  "message": "Reset code verified"
}
```

**Error Responses:**

Invalid code (400):
```json
{
  "detail": "Invalid or expired reset code"
}
```

Code format invalid (400):
```json
{
  "detail": "Reset code must be exactly 6 digits"
}
```

---

### 5. Reset Password

**Endpoint:** `POST /auth/reset-password`

**Description:** Reset user password with verification code

**Request Body:**
```json
{
  "email": "john@company.com",
  "reset_code": "123456",
  "new_password": "NewSecurePass123",
  "confirm_password": "NewSecurePass123"
}
```

**Parameters:**
- `email` (string, required): User's email address
- `reset_code` (string, required): Code from forgot-password
- `new_password` (string, required): New password (min 8 characters)
- `confirm_password` (string, required): Must match new_password

**Success Response (200):**
```json
{
  "message": "Password reset successfully",
  "status": "Password reset successful"
}
```

**Error Responses:**

Invalid/expired code (400):
```json
{
  "detail": "Invalid or expired reset code"
}
```

Passwords don't match (400):
```json
{
  "detail": "Passwords do not match"
}
```

---

### 6. Change Password

**Endpoint:** `POST /auth/change-password`

**Description:** Change password for authenticated user

**Headers:**
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "current_password": "OldSecurePass123",
  "new_password": "NewSecurePass123",
  "confirm_password": "NewSecurePass123"
}
```

**Parameters:**
- `current_password` (string, required): User's current password
- `new_password` (string, required): New password (min 8 characters)
- `confirm_password` (string, required): Must match new_password

**Success Response (200):**
```json
{
  "message": "Password changed successfully"
}
```

**Error Responses:**

Wrong current password (400):
```json
{
  "detail": "Current password is incorrect"
}
```

Unauthorized (401):
```json
{
  "detail": "Invalid or expired token"
}
```

---

### 7. Get User Profile

**Endpoint:** `GET /auth/profile`

**Description:** Get authenticated user's profile information

**Headers:**
```
Authorization: Bearer {access_token}
```

**Success Response (200):**
```json
{
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "john@company.com",
  "full_name": "John Doe",
  "system_role": "user",
  "is_active": true,
  "created_at": "2024-01-15T10:30:45.123456",
  "updated_at": "2024-01-15T10:30:45.123456"
}
```

**Error Responses:**

Unauthorized (401):
```json
{
  "detail": "Invalid or expired token"
}
```

User not found (404):
```json
{
  "detail": "User not found"
}
```

---

### 8. Logout

**Endpoint:** `POST /auth/logout`

**Description:** Logout the current user

**Headers:**
```
Authorization: Bearer {access_token}
```

**Success Response (200):**
```json
{
  "message": "Logout successful"
}
```

**Error Responses:**

Unauthorized (401):
```json
{
  "detail": "Invalid or expired token"
}
```

---

## Rate Limiting

Currently, there is no rate limiting implemented. In production, implement:
- 5 failed login attempts = 15 minute lockout
- 3 password reset requests per hour per email
- General API rate limiting: 100 requests per minute per IP

## Password Requirements

All passwords must meet these requirements:
- ✓ Minimum 8 characters
- ✓ At least one uppercase letter (A-Z)
- ✓ At least one lowercase letter (a-z)
- ✓ At least one number (0-9)

Example valid password: `SecurePass123`

## Token Management

### Access Token
- Expires in 30 minutes
- Used for all authenticated requests
- Included in Authorization header

### Refresh Token
- Expires in 7 days
- Stored securely in localStorage
- Used to obtain new access token when expired

## CORS Configuration

The API accepts requests from:
- `http://localhost:3000`
- `http://localhost:5000`
- `http://127.0.0.1:3000`

Add your frontend URL to CORS_ORIGINS in production.

## Example Workflows

### Registration & Login Flow
```
1. POST /auth/register
   → Receives user confirmation

2. POST /auth/login
   → Receives access_token and refresh_token

3. Store tokens in localStorage

4. Include token in all authenticated requests
   Authorization: Bearer {access_token}
```

### Password Reset Flow
```
1. POST /auth/forgot-password
   → Receives reset code (via email in production)

2. POST /auth/verify-reset-code
   → Verifies code validity

3. POST /auth/reset-password
   → Confirms password reset

4. User can now login with new password
```

### Protected Resource Access
```
1. GET /auth/profile
   → Returns user profile if token is valid
   → Returns 401 if token is missing or expired
```
