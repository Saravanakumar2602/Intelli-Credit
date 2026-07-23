import os
import sys
from dotenv import load_dotenv

# Set PYTHONPATH to root project directory
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

# Load environment variables
load_dotenv(dotenv_path=os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".env")))

from sqlalchemy import create_engine
from backend.database.base_class import Base
from backend.database.connection import engine

# Import all models to register them on Base.metadata
import backend.models

def main():
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        print("Error: DATABASE_URL not found in loaded environment!")
        sys.exit(1)

    env = os.getenv("ENV", "development")
    if env == "production":
        print("ERROR: Refusing to drop tables in production environment (ENV=production).")
        print("Set ENV=development explicitly if you really intend to reset this database.")
        sys.exit(1)

    confirm = input(f"WARNING: This will DROP ALL TABLES on '{db_url.split('@')[-1]}'.\nType 'yes' to confirm: ")
    if confirm.strip().lower() != "yes":
        print("Aborted.")
        sys.exit(0)

    if db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql://", 1)

    env = os.getenv("ENV", "development")
    if env == "production":
        print("ERROR: Refusing to drop tables in production environment (ENV=production).")
        print("Set ENV=development explicitly to run this script.")
        sys.exit(1)

    confirm = input(f"This will DROP ALL TABLES on: {db_url.split('@')[-1]}\nType 'yes' to confirm: ")
    if confirm.strip().lower() != "yes":
        print("Aborted.")
        sys.exit(0)
    
    # We want to drop all tables, even those not in our metadata (if they exist)
    from sqlalchemy import inspect
    inspector = inspect(engine)
    existing_tables = inspector.get_table_names()
    
    if existing_tables:
        print(f"Found existing tables in DB: {existing_tables}")
        print("Dropping all existing tables...")
        with engine.begin() as conn:
            for table in existing_tables:
                print(f"Dropping table '{table}' with CASCADE...")
                conn.exec_driver_sql(f'DROP TABLE IF EXISTS "{table}" CASCADE;')
        print("All existing tables dropped successfully!")
    else:
        print("No existing tables found in database.")

    print("Re-creating all schema tables from SQLAlchemy models...")
    Base.metadata.create_all(bind=engine)
    print("All schema tables created successfully!")

if __name__ == "__main__":
    main()
