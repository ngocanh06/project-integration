from flask import Blueprint, jsonify
from services.dashboard_service import get_dashboard_data

dashboard_bp = Blueprint("dashboard", __name__)

@dashboard_bp.route("/api/dashboard", methods=["GET"])
def dashboard():
    try:
        data = get_dashboard_data()
        return jsonify(data), 200

    except Exception as error:
        return jsonify({
            "message": "Cannot load dashboard data",
            "error": str(error)
        }), 500