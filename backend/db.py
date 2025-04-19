import pymysql

def get_db_connection():
    return pymysql.connect( 
        host="buvdpvm918jfonwzvibq-mysql.services.clever-cloud.com",
        user="udmktifdo3wwwnth",
        password="LpCIiJ9bFdx2eekWOI4K",
        database="buvdpvm918jfonwzvibq",
        port=3306,
        cursorclass=pymysql.cursors.DictCursor
    )

try:
    connection = get_db_connection()
    print("Connection Successful!")

    with connection.cursor() as cursor:
        cursor.execute("SELECT email FROM user")
        users = cursor.fetchall()

        print("User Emails:")
        for user in users:
            print(user["email"])

    connection.close()

except Exception as e:
    print(f"Error: {e}")
