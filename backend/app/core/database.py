from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# Pre-verify/create the search path schema to avoid startup crash on fresh Postgres databases
temp_engine = create_engine(settings.DATABASE_URL)
try:
    with temp_engine.connect() as conn:
        conn.execute(text("CREATE SCHEMA IF NOT EXISTS app_schema"))
        conn.commit()
except Exception as e:
    print(f"Warning: Could not pre-create app_schema: {e}")
finally:
    temp_engine.dispose()

engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
    connect_args={"options": "-c search_path=app_schema"},
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """Dependency: yields a DB session and ensures it's closed after the request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
