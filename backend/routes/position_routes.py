# backend/routes/position_routes.py
from flask import Blueprint, jsonify, request
from config import get_sqlserver_connection

position_bp = Blueprint('positions', __name__)

@position_bp.route("/positions", methods=["GET"])
def get_positions():
    sql = get_sqlserver_connection()
    cur = sql.cursor()
    cur.execute("SELECT PositionID, PositionName FROM Positions ORDER BY PositionName")
    rows = [{"PositionID": r[0], "PositionName": r[1]} for r in cur.fetchall()]
    cur.close()
    sql.close()
    return jsonify(rows)

@position_bp.route("/positions/<int:pos_id>", methods=["GET"])
def get_position_by_id(pos_id):
    sql = get_sqlserver_connection()
    cur = sql.cursor()
    cur.execute("SELECT PositionID, PositionName FROM Positions WHERE PositionID = ?", (pos_id,))
    row = cur.fetchone()
    cur.close()
    sql.close()
    if not row:
        return jsonify({"error": "Position not found"}), 404
    return jsonify({"PositionID": row[0], "PositionName": row[1]})

@position_bp.route("/positions", methods=["POST"])
def add_position():
    data = request.get_json()
    position_name = data.get("PositionName")
    if not position_name:
        return jsonify({"error": "Position name required"}), 400
    
    sql = get_sqlserver_connection()
    cur = sql.cursor()
    cur.execute("SELECT COUNT(*) FROM Positions WHERE PositionName = ?", (position_name,))
    if cur.fetchone()[0] > 0:
        cur.close()
        sql.close()
        return jsonify({"error": "Position already exists"}), 409
    
    cur.execute("""
        INSERT INTO Positions (PositionName, CreatedAt, UpdatedAt)
        VALUES (?, GETDATE(), GETDATE())
        SELECT SCOPE_IDENTITY()
    """, (position_name,))
    cur.execute("SELECT @@IDENTITY")
    new_id = cur.fetchone()[0]
    sql.commit()
    cur.close()
    sql.close()
    return jsonify({"message": "Position added", "PositionID": new_id}), 201

@position_bp.route("/positions/<int:pos_id>", methods=["PUT"])
def update_position(pos_id):
    data = request.get_json()
    position_name = data.get("PositionName")
    if not position_name:
        return jsonify({"error": "Position name required"}), 400
    
    sql = get_sqlserver_connection()
    cur = sql.cursor()
    cur.execute("SELECT COUNT(*) FROM Positions WHERE PositionID = ?", (pos_id,))
    if cur.fetchone()[0] == 0:
        cur.close()
        sql.close()
        return jsonify({"error": "Position not found"}), 404
    
    cur.execute("UPDATE Positions SET PositionName = ?, UpdatedAt = GETDATE() WHERE PositionID = ?", (position_name, pos_id))
    sql.commit()
    cur.close()
    sql.close()
    return jsonify({"message": "Position updated"}), 200

@position_bp.route("/positions/<int:pos_id>", methods=["DELETE"])
def delete_position(pos_id):
    sql = get_sqlserver_connection()
    cur = sql.cursor()
    
    cur.execute("SELECT COUNT(*) FROM Employees WHERE PositionID = ?", (pos_id,))
    if cur.fetchone()[0] > 0:
        cur.close()
        sql.close()
        return jsonify({"error": "Cannot delete position with employees"}), 409
    
    cur.execute("DELETE FROM Positions WHERE PositionID = ?", (pos_id,))
    sql.commit()
    cur.close()
    sql.close()
    return jsonify({"message": "Position deleted"}), 200