import mysql.connector

def list_users():
    try:
        conn = mysql.connector.connect(
            host='127.0.0.1',
            user='root',
            password='H@hoanganh123',
            database='auth_db'
        )
        cur = conn.cursor(dictionary=True)
        cur.execute('SELECT user_id, username, email, role_id FROM users')
        users = cur.fetchall()
        for u in users:
            role_map = {1: "Admin", 2: "HR Manager", 3: "Payroll Manager", 4: "Employee"}
            role_name = role_map.get(u['role_id'], "Unknown")
            print(f"Role: {role_name} | Username: {u['username']} | Email: {u['email']}")
        cur.close()
        conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    list_users()
