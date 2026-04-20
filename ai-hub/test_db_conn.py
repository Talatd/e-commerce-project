import os
import sqlalchemy
from sqlalchemy import text
from dotenv import load_dotenv

def test_conn():
    load_dotenv()
    DB_URL = (
        f"mysql+mysqlconnector://{os.getenv('DB_USER', 'root')}:"
        f"{os.getenv('DB_PASSWORD', 'root')}@"
        f"{os.getenv('DB_HOST', 'localhost')}:3306/"
        f"{os.getenv('DB_NAME', 'smartstore_db')}"
    )
    print(f"Connecting to: {os.getenv('DB_HOST')} as {os.getenv('DB_USER')}")
    try:
        engine = sqlalchemy.create_engine(DB_URL)
        with engine.connect() as conn:
            print("Successfully connected to the database!")
            res = conn.execute(text("SHOW TABLES;"))
            tables = [r[0] for r in res]
            print(f"Available tables: {tables}")
            
            # Check if our seeded data is there
            res = conn.execute(text("SELECT COUNT(*) FROM orders;"))
            count = res.scalar()
            print(f"Total orders found: {count}")
            
            return True
    except Exception as e:
        print(f"Connection failed: {str(e)}")
        return False

if __name__ == "__main__":
    test_conn()
