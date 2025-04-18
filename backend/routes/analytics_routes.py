from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from db import get_db_connection

analytics_bp = Blueprint("analytics", __name__)

@analytics_bp.route("/api/analytics", methods=["GET"])
@jwt_required()
def get_analytics():
    """
    Fetch analytics data for the logged-in user.
    """
    identity = get_jwt_identity()
    
    if not identity or "id" not in identity:
        return jsonify({"error": "User ID not found in token"}), 401

    user_id = identity["id"]
    print(f"🔍 Fetching analytics for user ID: {user_id}")  # Debugging

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            SELECT COUNT(*) AS total_emails, 
                   SUM(CASE WHEN action = 'generated' THEN 1 ELSE 0 END) AS generated_count,
                   SUM(CASE WHEN action = 'refined' THEN 1 ELSE 0 END) AS refined_count,
                   SUM(CASE WHEN action = 'sent' THEN 1 ELSE 0 END) AS sent_count
            FROM email_log
            WHERE user_id = %s;
        """, (user_id,))  

        analytics_data = cursor.fetchone()

        if analytics_data is None:
            analytics_data = [0, 0, 0, 0]  # Default values

        response = {
            "total_emails": analytics_data[0] or 0,
            "generated_count": analytics_data[1] or 0,
            "refined_count": analytics_data[2] or 0,
            "sent_count": analytics_data[3] or 0
        }

        print("✅ Analytics Response:", response)  # Debugging
        return jsonify(response)

    except Exception as e:
        print(f"❌ Analytics Error: {e}")  # Debugging info
        return jsonify({"error": "Failed to fetch analytics"}), 500

    finally:
        cursor.close()
        conn.close()
