import os
from dotenv import load_dotenv
load_dotenv()

def _parse_db_url(url):
    """Parse mysql://user:pass@host:port/dbname into dict."""
    import re
    m = re.match(r'mysql(?:\+\w+)?://([^:]+):([^@]+)@([^:/]+):?(\d+)?/(.+)', url)
    if m:
        return dict(user=m.group(1), password=m.group(2),
                    host=m.group(3), port=int(m.group(4) or 3306), database=m.group(5))
    return None

class Config:
    _db_url = os.getenv('DATABASE_URL') or os.getenv('MYSQL_URL')
    _parsed = _parse_db_url(_db_url) if _db_url else None

    DB_HOST     = (_parsed['host']     if _parsed else None) or os.getenv('DB_HOST', 'localhost')
    DB_USER     = (_parsed['user']     if _parsed else None) or os.getenv('DB_USER', 'root')
    DB_PASSWORD = (_parsed['password'] if _parsed else None) or os.getenv('DB_PASSWORD', 'root')
    DB_NAME     = (_parsed['database'] if _parsed else None) or os.getenv('DB_NAME', 'course_allocation')
    DB_PORT     = (_parsed['port']     if _parsed else None) or int(os.getenv('DB_PORT', 3306))

    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'super-secret-jwt-key-2024')
