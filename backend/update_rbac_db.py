import mysql.connector

def update_rbac():
    try:
        conn = mysql.connector.connect(
            host='127.0.0.1',
            user='root',
            password='H@hoanganh123',
            database='auth_db'
        )
        cur = conn.cursor(dictionary=True)

        print("Deleting old role permissions...")
        cur.execute("DELETE FROM role_permissions")

        # Get all permissions to create a map
        cur.execute("SELECT permission_id, resource, action FROM permissions")
        perms = cur.fetchall()
        
        perm_map = {}
        for p in perms:
            key = (p['resource'], p['action'])
            perm_map[key] = p['permission_id']

        def get_pids(resource, actions):
            ids = []
            for action in actions:
                pid = perm_map.get((resource, action))
                if pid:
                    ids.append(pid)
            return ids

        # ROLE 1: ADMIN (System only)
        admin_perms = []
        admin_perms += get_pids('users', ['read', 'create', 'update', 'delete'])
        admin_perms += get_pids('roles', ['read', 'create', 'update', 'delete'])
        admin_perms += get_pids('audit', ['read'])
        
        # ROLE 4: EMPLOYEE (Read only for core modules)
        employee_perms = []
        employee_perms += get_pids('employees', ['read'])
        employee_perms += get_pids('attendance', ['read'])
        employee_perms += get_pids('dividends', ['read'])
        employee_perms += get_pids('payroll', ['read'])

        # ROLE 2: HR MANAGER (Employee + HR CRUD + HR Reports)
        hr_perms = list(employee_perms)
        hr_perms += get_pids('employees', ['create', 'update', 'delete'])
        hr_perms += get_pids('attendance', ['create', 'update', 'delete'])
        hr_perms += get_pids('departments', ['read', 'create', 'update', 'delete'])
        hr_perms += get_pids('positions', ['read', 'create', 'update', 'delete'])
        # Filter reports for HR
        cur.execute("SELECT permission_id FROM permissions WHERE resource='reports' AND (description LIKE '%nhân sự%' OR description LIKE '%chấm công%')")
        hr_perms += [r['permission_id'] for r in cur.fetchall()]

        # ROLE 3: PAYROLL MANAGER (Employee + Payroll CRUD + Payroll Reports)
        payroll_perms = list(employee_perms)
        payroll_perms += get_pids('payroll', ['create', 'update', 'delete', 'approve', 'export'])
        payroll_perms += get_pids('dividends', ['create', 'update', 'delete'])
        # Filter reports for Payroll
        cur.execute("SELECT permission_id FROM permissions WHERE resource='reports' AND (description LIKE '%lương%' OR description LIKE '%cổ tức%')")
        payroll_perms += [r['permission_id'] for r in cur.fetchall()]

        # Helper to insert
        def insert_perms(role_id, pids):
            pids = list(set(pids)) # Unique
            for pid in pids:
                cur.execute("INSERT INTO role_permissions (role_id, permission_id) VALUES (%s, %s)", (role_id, pid))
            print(f"Inserted {len(pids)} permissions for role {role_id}")

        insert_perms(1, admin_perms)
        insert_perms(2, hr_perms)
        insert_perms(3, payroll_perms)
        insert_perms(4, employee_perms)

        conn.commit()
        print("Successfully updated all role permissions.")
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        if conn: conn.close()

if __name__ == "__main__":
    update_rbac()
