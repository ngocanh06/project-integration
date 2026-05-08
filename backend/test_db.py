import sys
sys.path.append('c:/Users/pc/project-integration/backend')
from database.db_hr_connector import get_sql_connection

try:
    conn = get_sql_connection()
    if conn:
        print("SUCCESS")
    else:
        print("CONN IS NONE")
except Exception as e:
    print("ERR:", repr(e))
