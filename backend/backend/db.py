import os
import mysql.connector

# Use environment variables for database configuration
db_config = {
    "host": os.environ.get("DB_HOST", "localhost"),
    "user": os.environ.get("DB_USER", "root"),
    "password": os.environ.get("DB_PASSWORD", ""),
    "database": os.environ.get("DB_NAME", "email_assistant")
}

def get_db_connection():
    return mysql.connector.connect(**db_config)
