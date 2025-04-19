import os
import pymysql
db_config = {
    "host": os.environ.get("DB_HOST", "localhost"),
    "user": os.environ.get("DB_USER", "root"),
    "password": os.environ.get("DB_PASSWORD", ""),
    "database": os.environ.get("DB_NAME", "email_assistant"),
    "cursorclass": pymysql.cursors.DictCursor  # Optional: returns rows as dictionaries
}
def get_db_connection():
    return pymysql.connect(**db_config)
