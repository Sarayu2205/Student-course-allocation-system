import mysql.connector
from config import Config

def get_conn():
    return mysql.connector.connect(
        host=Config.DB_HOST,
        port=Config.DB_PORT,
        user=Config.DB_USER,
        password=Config.DB_PASSWORD,
        database=Config.DB_NAME,
        consume_results=True
    )

def run(sql, params=None, fetch='all'):
    conn = get_conn()
    cur = conn.cursor(dictionary=True)
    try:
        cur.execute(sql, params or ())
        if fetch == 'one':
            result = cur.fetchone()
        elif fetch == 'id':
            conn.commit()
            return cur.lastrowid
        else:
            result = cur.fetchall()
        conn.commit()
        return result
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        try: cur.fetchall()
        except: pass
        cur.close()
        conn.close()
