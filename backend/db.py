import os
import pymysql

def get_db_connection():
    return pymysql.connect(
        host=os.environ["buvdpvm918jfonwzvibq-mysql.services.clever-cloud.com"],
        user=os.environ["udmktifdo3wwwnth"],
        password=os.environ["LpCIiJ9bFdx2eekWOI4K"],
        database=os.environ["buvdpvm918jfonwzvibq"],
        port=int(os.environ.get("DB_PORT", 3306)),
        cursorclass=pymysql.cursors.DictCursor
    )
