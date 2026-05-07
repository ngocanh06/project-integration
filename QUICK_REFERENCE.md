# Quick Reference - Admin Implementation

## 🚀 Quick Start Commands

### Backend
```bash
# Install & setup
pip install -r backend/requirements.txt

# Run server
cd backend
uvicorn main:app --reload

# Server: http://localhost:8000/docs (Swagger)
```

### Frontend
```bash
# Install & setup
npm install

# Run dev server
npm start

# App: http://localhost:3000
```

## 📡 Key API Endpoints

### Users
- `GET /api/users` - List users (Admin)
- `POST /api/users` - Create user (Admin)
- `PUT /api/users/{id}` - Edit user (Admin)
- `DELETE /api/users/{id}` - Delete user (Admin)

### Roles
- `GET /api/roles` - List roles
- `POST /api/roles` - Create role (Admin)
- `POST /api/roles/{id}/permissions` - Add permission (Admin)
- `DELETE /api/roles/{id}/permissions/{perm_id}` - Remove permission (Admin)

### Permissions
- `GET /api/permissions` - List permissions
- `POST /api/permissions` - Create permission (Admin)

## 🎨 Frontend Components

### Page Routes
- `/admin/users` - User management
- `/admin/users/add` - Create user
- `/admin/users/{id}/edit` - Edit user
- `/admin/roles` - Role management
- `/admin/permissions` - Permission management

### Import Components
```javascript
import PrivateRoute from '../components/PrivateRoute';
import PublicRoute from '../components/PublicRoute';
import { useRole } from '../hooks/useRole';
import userService from '../services/userService';
import roleService from '../services/roleService';
```

## 🔐 Authorization Checks

### Frontend
```javascript
const { isAdmin, hasRole } = useRole();

if (!isAdmin()) {
  navigate('/dashboard');
}
```

### Backend
```python
from middleware.role_middleware import RoleMiddleware
from auth.permission_checker import PermissionChecker

# In routes
RoleMiddleware.require_admin(request, db)
PermissionChecker.has_permission(user_id, "user:manage", db)
```

## 📝 Response Format

All API responses follow this format:
```json
{
  "success": true/false,
  "message": "descriptive message",
  "data": { ... },
  "total": 0  // for list endpoints
}
```

## 🗄️ Database Models

### User
```python
user_id, email, full_name, password (hashed),
system_role, is_active, created_at, updated_at
```

### Role
```python
role_id, role_name, description,
permissions[] (relationship), created_at, updated_at
```

### Permission
```python
permission_id, permission_name, resource, action,
description, created_at
```

## 🔑 Default Roles
- `admin` - Full system access
- `manager` - Manager-level operations
- `user` - Basic user operations

## 💾 Key Files Modified/Created

### Backend New Files
- `models/role_model.py`
- `modules/auth/routes/user_routes.py`
- `modules/auth/routes/role_routes.py`
- `modules/auth/services/user_service.py`
- `modules/auth/services/role_service.py`
- `modules/auth/repository/user_repository.py`
- `modules/auth/repository/role_repository.py`
- `middleware/auth_middleware.py`
- `middleware/role_middleware.py`
- `database/db_auth_connector.py`
- `alerts/alert_generator.py`
- `alerts/salary_discrepancy_alert.py`

### Backend Modified Files
- `main.py` - Added new routes
- `database.py` - Added models
- `auth/permission_checker.py` - Enhanced

### Frontend New Files
- `components/PrivateRoute.jsx`
- `components/PublicRoute.jsx`
- `pages/admin/UserList.jsx`
- `pages/admin/UserAdd.jsx`
- `pages/admin/UserEdit.jsx`
- `pages/admin/RoleList.jsx`
- `pages/admin/PermissionList.jsx`
- `pages/admin/Admin.css`
- `hooks/useRole.js`
- `services/userService.js`
- `services/roleService.js`
- `styles/auth.css`

### Frontend Modified Files
- `App.js` - Added admin routes

## 🧪 Test Admin Account

```
Email: admin@example.com
Password: Admin@123
Role: admin
```

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| 401 Unauthorized | Check token in localStorage, verify not expired |
| 403 Forbidden | Confirm user role is 'admin' in database |
| CORS Error | Verify frontend URL in CORS middleware |
| Database Error | Check DATABASE_URL env var, MySQL running |
| Route not found | Check import statements and path names |

## 📊 Permission Naming Convention

Format: `{resource}:{action}`

Examples:
- `user:manage` - Manage users
- `role:manage` - Manage roles
- `report:view` - View reports
- `attendance:manage` - Manage attendance

## 🔄 Common Workflows

### Create New User
1. Go to `/admin/users`
2. Click "Add New User"
3. Fill form with email, name, password, role
4. Click "Create User"
5. User appears in list

### Create New Role
1. Go to `/admin/roles`
2. Click "Add New Role"
3. Enter role name and description
4. Click "Create"
5. Go to role and manage permissions

### Assign Permission to Role
1. Go to `/admin/roles`
2. Click role name
3. Click "Manage Permissions"
4. Select permission from list
5. Click "Add"

## 🎯 Success Indicators

- ✅ Backend server starts without errors
- ✅ Frontend loads without CORS errors
- ✅ Can login with credentials
- ✅ Admin can access /admin pages
- ✅ Can create/edit/delete users
- ✅ Can manage roles and permissions
- ✅ Console shows no errors
- ✅ API responses are properly formatted

---

For detailed implementation information, see: `ADMIN_IMPLEMENTATION.md`
