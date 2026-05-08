import sys
try:
    import flask
    import flask_cors
    import pyodbc
    import dotenv
    import mysql.connector
    print("SUCCESS: All core modules installed")
except ImportError as e:
    print(f"ERROR: Missing module {e.name}")
    sys.exit(1)
