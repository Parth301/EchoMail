import logging
from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from db import get_db_connection

# Configure logging
logging.basicConfig(level=logging.INFO, 
                    format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Create admin blueprint
admin_bp = Blueprint("admin", __name__)

@admin_bp.route("/users", methods=["GET"])
@jwt_required()  # Require valid JWT token
def get_users():
    """
    Retrieve list of non-admin users with admin access control
    """
    try:
        # Get the current user's identity from JWT
        current_user = get_jwt_identity()
        
        # Strict admin access control
        if not current_user.get('is_admin'):
            logger.warning(f"Unauthorized access attempt by user {current_user.get('email')}")
            return jsonify({"error": "Unauthorized: Admin access required"}), 403

        # Database connection
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        try:
            # Fetch non-admin users with minimal sensitive information
            cursor.execute("""
                SELECT 
                    id, 
                    email, 
                    created_at, 
                    last_login
                FROM user 
                WHERE active = 1 
                AND is_admin = 0  # Explicitly exclude admin users
                ORDER BY created_at DESC
            """)
            users = cursor.fetchall()
            
            logger.info(f"Non-admin users retrieved successfully. Total users: {len(users)}")
            return jsonify(users), 200

        except Exception as e:
            logger.error(f"Users Fetch Error: {e}")
            return jsonify({"error": "Failed to retrieve users"}), 500

        finally:
            cursor.close()
            conn.close()

    except Exception as e:
        logger.error(f"Unexpected error in get_users: {e}")
        return jsonify({"error": "An unexpected error occurred"}), 500

@admin_bp.route("/logs/<int:user_id>", methods=["GET"])
@jwt_required()  # Require valid JWT token
def get_user_logs(user_id):
    """
    Retrieve user logs with admin access control
    """
    try:
        # Get the current user's identity from JWT
        current_user = get_jwt_identity()
        
        # Strict admin access control
        if not current_user.get('is_admin'):
            logger.warning(f"Unauthorized logs access attempt by user {current_user.get('email')}")
            return jsonify({"error": "Unauthorized: Admin access required"}), 403

        # Database connection
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        try:
            # Fetch logs with comprehensive details
            cursor.execute("""
                SELECT 
                    id, 
                    timestamp, 
                    action, 
                    email_content, 
                    ip_address
                FROM email_log 
                WHERE user_id = %s 
                ORDER BY timestamp DESC
                LIMIT 100  # Prevent massive log retrieval
            """, (user_id,))
            logs = cursor.fetchall()
            
            logger.info(f"Logs retrieved for user {user_id}. Total logs: {len(logs)}")
            return jsonify(logs), 200

        except Exception as e:
            logger.error(f"User Logs Fetch Error for user {user_id}: {e}")
            return jsonify({"error": "Failed to retrieve user logs"}), 500

        finally:
            cursor.close()
            conn.close()

    except Exception as e:
        logger.error(f"Unexpected error in get_user_logs: {e}")
        return jsonify({"error": "An unexpected error occurred"}), 500
