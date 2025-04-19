import os
import pymysql

def get_db_connection():
    return pymysql.connect(
        host=os.environ["sql12.freesqldatabase.com"],
        user=os.environ["sql12774147"],
        password=os.environ["1GJN1Weipi"],
        database=os.environ["sql12774147"],
        port=int(os.environ.get("DB_PORT", 3306)),
        cursorclass=pymysql.cursors.DictCursor
    )
