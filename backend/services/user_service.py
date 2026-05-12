# backend/services/user_service.py
from config import get_auth_connection
from auth.password_hasher import hash_password

def get_all_users():
    auth_db = get_auth_connection()
    cursor = auth_db.cursor(dictionary=True)
    cursor.execute("""
        SELECT u.user_id, u.username, u.email, u.full_name, r.role_name, u.is_active, u.created_at
        FROM users u JOIN roles r ON u.role_id = r.role_id
        ORDER BY u.user_id
    """)
    users = cursor.fetchall()
    cursor.close()
    auth_db.close()
    return users

def get_user_by_id(user_id):
    auth_db = get_auth_connection()
    cursor = auth_db.cursor(dictionary=True)
    cursor.execute("""
        SELECT u.user_id, u.username, u.email, u.full_name, u.role_id, r.role_name, u.is_active
        FROM users u JOIN roles r ON u.role_id = r.role_id
        WHERE u.user_id = %s
    """, (user_id,))
    user = cursor.fetchone()
    cursor.close()
    auth_db.close()
    return user

def create_user(username, email, password, full_name, role_id):
    auth_db = get_auth_connection()
    cursor = auth_db.cursor()
    
    cursor.execute("SELECT COUNT(*) FROM users WHERE username = %s", (username,))
    if cursor.fetchone()[0] > 0:
        cursor.close()
        auth_db.close()
        return None, "Username already exists"
    
    hashed = hash_password(password)
    cursor.execute("""
        INSERT INTO users (username, email, password_hash, full_name, role_id, is_active)
        VALUES (%s, %s, %s, %s, %s, 1)
    """, (username, email, hashed, full_name, role_id))
    
    auth_db.commit()
    new_id = cursor.lastrowid
    cursor.close()
    auth_db.close()
    return new_id, "Success"

def update_user(user_id, data):
    auth_db = get_auth_connection()
    cursor = auth_db.cursor()
    
    updates = []
    params = []
    if 'full_name' in data:
        updates.append("full_name = %s")
        params.append(data['full_name'])
    if 'email' in data:
        updates.append("email = %s")
        params.append(data['email'])
    if 'role_id' in data:
        updates.append("role_id = %s")
        params.append(data['role_id'])
    if 'is_active' in data:
        updates.append("is_active = %s")
        params.append(data['is_active'])
    
    if not updates:
        cursor.close()
        auth_db.close()
        return False, "No fields to update"
    
    params.append(user_id)
    cursor.execute(f"UPDATE users SET {', '.join(updates)} WHERE user_id = %s", params)
    auth_db.commit()
    cursor.close()
    auth_db.close()
    return True, "Success"

def delete_user(user_id):
    auth_db = get_auth_connection()
    cursor = auth_db.cursor()
    cursor.execute("DELETE FROM users WHERE user_id = %s", (user_id,))
    auth_db.commit()
    cursor.close()
    auth_db.close()
    return True