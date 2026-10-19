import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Default to local PostgreSQL, fall back to SQLite if PostgreSQL fails
DEFAULT_PG_URL = "postgresql+psycopg2://chintansood7@localhost:5432/civicscan"
DATABASE_URL = os.getenv("DATABASE_URL", DEFAULT_PG_URL)

try:
    if DATABASE_URL.startswith("sqlite"):
        engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
    else:
        engine = create_engine(DATABASE_URL, pool_pre_ping=True)
    # Test connection
    with engine.connect() as conn:
        pass
except Exception as e:
    print(f"[!] Warning: Could not connect to {DATABASE_URL}: {e}. Falling back to SQLite.")
    DATABASE_URL = "sqlite:///./civicscan.db"
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
