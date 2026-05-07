# Environment Setup Guide

## Prerequisites

- Python 3.9+
- Node.js 16+
- MySQL 8.0+
- Git

## Backend Setup

### 1. Create Python Virtual Environment

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

**Requirements installed:**
- fastapi>=0.115.0
- uvicorn>=0.30.0
- pydantic>=2.10.0
- pydantic[email]>=2.10.0
- bcrypt>=4.1.0
- PyJWT>=2.8.0
- python-dotenv>=1.0.0
- sqlalchemy>=2.0.30
- pymysql>=1.1.0
- cryptography>=42.0.0

### 3. Configure Environment Variables

Create `.env` file in backend root:

```env
# Database Configuration
DATABASE_URL=mysql+pymysql://username:password@localhost:3306/auth_db

# JWT Configuration
SECRET_KEY=your-super-secret-key-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# Development
DEBUG=false
```

### 4. Create MySQL Database

```sql
-- Create database
CREATE DATABASE auth_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user
CREATE USER 'admin'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON auth_db.* TO 'admin'@'localhost';
FLUSH PRIVILEGES;
```

Update `.env` with your credentials:
```
DATABASE_URL=mysql+pymysql://admin:your_password@localhost:3306/auth_db
```

### 5. Initialize Database (Auto on First Run)

The application automatically creates tables on startup:

```bash
# Run from backend directory
uvicorn main:app --reload

# Watch console output:
# [Database] Kết nối thành công!
# [Database] Bảng đã được tạo / cập nhật.
```

### 6. Verify Backend is Running

- Backend URL: http://localhost:8000
- API Documentation: http://localhost:8000/docs
- Alternative docs: http://localhost:8000/redoc
- Health check: http://localhost:8000/health

## Frontend Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
```

**Key packages:**
- react@19.2.5
- react-router-dom@6.20.0
- axios@1.6.0
- lucide-react@1.8.0
- sass@1.99.0

### 2. Configure Environment Variables

Create `.env.local` in frontend root:

```env
# API Configuration
REACT_APP_API_URL=http://localhost:8000

# Additional settings
REACT_APP_ENV=development
```

### 3. Start Development Server

```bash
npm start

# Will automatically open http://localhost:3000 in browser
```

### 4. Build for Production

```bash
npm run build

# Output: build/ folder (ready for deployment)
```

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    user_id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    password TEXT NOT NULL,
    system_role VARCHAR(50) NOT NULL DEFAULT 'user',
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (system_role)
);
```

### Roles Table
```sql
CREATE TABLE roles (
    role_id VARCHAR(36) PRIMARY KEY,
    role_name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_role_name (role_name)
);
```

### Permissions Table
```sql
CREATE TABLE permissions (
    permission_id VARCHAR(36) PRIMARY KEY,
    permission_name VARCHAR(100) UNIQUE NOT NULL,
    resource VARCHAR(100) NOT NULL,
    action VARCHAR(100) NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_permission_name (permission_name),
    INDEX idx_resource (resource)
);
```

### Role_Permission Junction Table
```sql
CREATE TABLE role_permission (
    role_id VARCHAR(36) NOT NULL,
    permission_id VARCHAR(36) NOT NULL,
    PRIMARY KEY (role_id, permission_id),
    FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(permission_id) ON DELETE CASCADE
);
```

## Initial Data Setup

### Create Default Roles

After backend starts, execute SQL:

```sql
INSERT INTO roles (role_id, role_name, description) VALUES
('admin-001', 'admin', 'Administrator with full system access'),
('manager-001', 'manager', 'Manager with enhanced access'),
('user-001', 'user', 'Regular user with basic access');
```

### Create Default Permissions

```sql
INSERT INTO permissions (permission_id, permission_name, resource, action, description) VALUES
('perm-001', 'user:manage', 'user', 'manage', 'Can manage users'),
('perm-002', 'user:view', 'user', 'view', 'Can view users'),
('perm-003', 'role:manage', 'role', 'manage', 'Can manage roles'),
('perm-004', 'role:view', 'role', 'view', 'Can view roles'),
('perm-005', 'report:view', 'report', 'view', 'Can view reports'),
('perm-006', 'attendance:manage', 'attendance', 'manage', 'Can manage attendance');
```

### Assign Permissions to Admin Role

```sql
INSERT INTO role_permission (role_id, permission_id)
SELECT r.role_id, p.permission_id FROM roles r, permissions p
WHERE r.role_name = 'admin'
  AND p.permission_name IN ('user:manage', 'role:manage', 'report:view');
```

### Create Initial Admin User

```bash
# Use the admin panel or API
POST /api/users
{
  "email": "admin@example.com",
  "full_name": "System Administrator",
  "password": "Admin@123456",
  "system_role": "admin"
}
```

## Verification Checklist

### Backend
- [ ] Virtual environment activated
- [ ] All requirements installed (`pip list`)
- [ ] .env file created with DATABASE_URL
- [ ] MySQL database created
- [ ] Database tables auto-created on startup
- [ ] Can access http://localhost:8000/docs
- [ ] Health check returns 200: http://localhost:8000/health

### Frontend
- [ ] node_modules installed
- [ ] .env.local created with REACT_APP_API_URL
- [ ] npm start runs without errors
- [ ] Can access http://localhost:3000
- [ ] Console has no error messages
- [ ] Can login with test credentials

### Integration
- [ ] Backend responds to frontend requests
- [ ] Authentication flow works end-to-end
- [ ] Can create users via admin panel
- [ ] Can manage roles and permissions
- [ ] No CORS errors in browser console

## Troubleshooting

### Backend Issues

**Port 8000 already in use:**
```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :8000
kill -9 <PID>
```

**MySQL connection refused:**
```bash
# Check MySQL is running
# Windows: Services app → MySQL80
# macOS: brew services list
# Linux: sudo systemctl status mysql

# Test connection
mysql -u admin -p -h localhost
```

**ModuleNotFoundError:**
```bash
# Reinstall dependencies
pip install -r requirements.txt --force-reinstall
```

### Frontend Issues

**Port 3000 already in use:**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :3000
kill -9 <PID>
```

**CORS errors:**
- Verify REACT_APP_API_URL in .env.local
- Check backend CORS middleware includes frontend URL
- Backend must be running on http://localhost:8000

**Blank page or 404:**
- Check browser console for errors
- Verify all imports are correct
- Clear browser cache and hard refresh (Ctrl+Shift+R)

### Database Issues

**Connection string error:**
```bash
# Format: mysql+pymysql://user:password@host:port/database
# Example: mysql+pymysql://admin:pass@localhost:3306/auth_db
```

**Authentication failed:**
```sql
-- Reset MySQL user password
ALTER USER 'admin'@'localhost' IDENTIFIED BY 'new_password';
FLUSH PRIVILEGES;
```

## Security Checklist for Production

- [ ] Change SECRET_KEY to secure random value
- [ ] Set DEBUG=false in .env
- [ ] Use environment-specific database
- [ ] Configure HTTPS/SSL
- [ ] Update CORS allowed origins
- [ ] Set strong password policies
- [ ] Enable rate limiting
- [ ] Set up logging and monitoring
- [ ] Use environment variables for secrets
- [ ] Regular security updates

## Docker Setup (Optional)

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: root_password
      MYSQL_DATABASE: auth_db
      MYSQL_USER: admin
      MYSQL_PASSWORD: admin_password
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: mysql+pymysql://admin:admin_password@mysql:3306/auth_db
      SECRET_KEY: your-secret-key
    depends_on:
      - mysql

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      REACT_APP_API_URL: http://localhost:8000
    depends_on:
      - backend

volumes:
  mysql_data:
```

Run with: `docker-compose up`

## Next Steps

1. Complete environment setup above
2. Run both backend and frontend
3. Login with test credentials
4. Test admin features
5. Read ADMIN_IMPLEMENTATION.md for detailed info
6. Check QUICK_REFERENCE.md for common tasks

---

**Setup Guide for Admin Implementation**
**Version: 1.0**
**Last Updated: 2026-05-07**
