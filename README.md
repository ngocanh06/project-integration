# Authentication System - Project Integration

A comprehensive authentication system with login, registration, password reset, and user profile management.

## Project Structure

```
project-integration/
├── backend/
│   ├── auth/
│   │   ├── jwt_handler.py           # JWT token generation and verification
│   │   ├── password_hasher.py       # Password hashing and verification
│   │   └── permission_checker.py    # Role-based access control
│   ├── modules/
│   │   └── auth/
│   │       ├── repository/          # Database operations
│   │       ├── routes/              # API endpoints
│   │       ├── schemas/             # Pydantic schemas
│   │       ├── services/            # Business logic
│   │       └── validation/          # Input validation
│   ├── main.py                      # FastAPI application
│   └── requirements.txt             # Python dependencies
│
└── frontend/
    ├── pages/
    │   └── auth/                    # Authentication pages
    ├── hooks/
    │   └── useAuth.js               # React auth hook
    ├── services/
    │   └── authService.js           # API service
    ├── utils/
    │   ├── auth.js                  # Auth utilities
    │   └── tokenStorage.js          # Token management
    └── package.json                 # NPM dependencies
```

## Backend Setup

### Prerequisites
- Python 3.8+
- pip or conda

### Installation

1. Navigate to backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

### Running the Backend

```bash
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at: `http://localhost:8000`
- API Documentation: `http://localhost:8000/docs`
- Alternative Docs: `http://localhost:8000/redoc`

## Frontend Setup

### Prerequisites
- Node.js 14+
- npm or yarn

### Installation

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```
REACT_APP_API_URL=http://localhost:8000
```

### Running the Frontend

```bash
npm start
```

The application will be available at: `http://localhost:3000`

## API Endpoints

### Authentication Routes

#### 1. Register User
- **Endpoint:** `POST /api/auth/register`
- **Description:** Create a new user account
- **Request Body:**
```json
{
  "full_name": "John Doe",
  "business_email": "john@company.com",
  "system_role": "user",
  "password": "SecurePass123",
  "confirm_password": "SecurePass123"
}
```
- **Response:**
```json
{
  "user_id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "john@company.com",
  "full_name": "John Doe",
  "message": "Account created successfully"
}
```

#### 2. Login User
- **Endpoint:** `POST /api/auth/login`
- **Description:** Authenticate user and get tokens
- **Request Body:**
```json
{
  "email": "john@company.com",
  "password": "SecurePass123"
}
```
- **Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "user_id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "john@company.com",
  "full_name": "John Doe",
  "system_role": "user"
}
```

#### 3. Forgot Password
- **Endpoint:** `POST /api/auth/forgot-password`
- **Description:** Request password reset code
- **Request Body:**
```json
{
  "email": "john@company.com"
}
```
- **Response:**
```json
{
  "message": "If email exists, reset code will be sent",
  "reset_code": "123456"
}
```

#### 4. Verify Reset Code
- **Endpoint:** `POST /api/auth/verify-reset-code`
- **Description:** Verify password reset code
- **Request Body:**
```json
{
  "email": "john@company.com",
  "reset_code": "123456"
}
```
- **Response:**
```json
{
  "message": "Reset code verified"
}
```

#### 5. Reset Password
- **Endpoint:** `POST /api/auth/reset-password`
- **Description:** Reset password with verification code
- **Request Body:**
```json
{
  "email": "john@company.com",
  "reset_code": "123456",
  "new_password": "NewPass123",
  "confirm_password": "NewPass123"
}
```
- **Response:**
```json
{
  "message": "Password reset successfully",
  "status": "Password reset successful"
}
```

#### 6. Change Password
- **Endpoint:** `POST /api/auth/change-password`
- **Description:** Change password (requires authentication)
- **Headers:**
```
Authorization: Bearer {access_token}
```
- **Request Body:**
```json
{
  "current_password": "OldPass123",
  "new_password": "NewPass123",
  "confirm_password": "NewPass123"
}
```
- **Response:**
```json
{
  "message": "Password changed successfully"
}
```

#### 7. Get User Profile
- **Endpoint:** `GET /api/auth/profile`
- **Description:** Get authenticated user profile
- **Headers:**
```
Authorization: Bearer {access_token}
```
- **Response:**
```json
{
  "user_id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "john@company.com",
  "full_name": "John Doe",
  "system_role": "user",
  "is_active": true,
  "created_at": "2024-01-01T12:00:00",
  "updated_at": "2024-01-01T12:00:00"
}
```

#### 8. Logout
- **Endpoint:** `POST /api/auth/logout`
- **Description:** Logout user
- **Headers:**
```
Authorization: Bearer {access_token}
```
- **Response:**
```json
{
  "message": "Logout successful"
}
```

## Password Requirements

- Minimum 8 characters
- Must contain uppercase letters (A-Z)
- Must contain lowercase letters (a-z)
- Must contain numbers (0-9)

## Frontend Components

### Pages
- **Login** - User login page
- **Register** - New user registration
- **ForgotPassword** - Password reset request
- **ResetPassword** - Password reset with verification code
- **ChangePassword** - Change password for authenticated users
- **Profile** - User profile page
- **Success** - Success confirmation page

### Hooks
- **useAuth** - Authentication hook for managing user state and auth operations

### Services
- **authService** - API calls for authentication endpoints

### Utilities
- **tokenStorage.js** - LocalStorage management for tokens and user data
- **auth.js** - Authentication utility functions

## Features

### Backend
- User registration with email validation
- Secure password hashing using bcrypt
- JWT-based authentication
- Password reset with 6-digit verification code
- Role-based access control
- Input validation using Pydantic

### Frontend
- Responsive login/register forms
- Forgot password flow with verification
- User profile management
- Protected routes
- Token-based API authentication
- Auto-logout on token expiration
- Remember me functionality

## Security Features

1. **Password Security**
   - Bcrypt hashing with 12 rounds
   - Password strength validation
   - Secure password reset flow

2. **Token Management**
   - JWT with configurable expiration
   - Separate access and refresh tokens
   - Token validation on requests

3. **Input Validation**
   - Email format validation
   - Password strength requirements
   - XSS protection through React

4. **CORS Protection**
   - Configured CORS middleware
   - Limited allowed origins

## Environment Variables

### Backend (.env)
```
SECRET_KEY=your-secret-key-change-in-production
DATABASE_URL=your-database-url
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:8000
```

## Development Notes

- Token expiration time is 30 minutes for access token
- Reset code expires after 15 minutes
- Reset code is a 6-digit number
- In development, reset code is returned in API response
- In production, reset code should be sent via email

## Testing

### Test Login Credentials
You can create test users through the registration endpoint or use:
- Email: test@company.com
- Password: TestPass123

## Troubleshooting

### Backend
1. **Module not found error**: Ensure you're in the project root and the PYTHONPATH includes the backend directory
2. **Port already in use**: Change the port in the startup command
3. **CORS errors**: Check frontend URL is in CORS_ORIGINS

### Frontend
1. **API connection error**: Verify backend is running and REACT_APP_API_URL is correct
2. **Token expired**: Clear localStorage and login again
3. **Route not found**: Check that React Router setup is correct

## Contributing

1. Follow PEP 8 for Python code
2. Follow ESLint rules for JavaScript code
3. Test all endpoints before committing
4. Update documentation for new features

## License

This project is proprietary and confidential.
