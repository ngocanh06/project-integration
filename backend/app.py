from flask import Flask
from flask_cors import CORS

from config import Config
from routes.dashboard_routes import dashboard_bp

app = Flask(__name__)
CORS(app)

app.register_blueprint(dashboard_bp)

@app.route("/")
def home():
    return "Dashboard backend is running with Flask + SQL Server + MySQL"

if __name__ == "__main__":
    app.run(
        host="localhost",
        port=Config.FLASK_PORT,
        debug=True
    )