
import os

from dotenv import load_dotenv # type: ignore
from sqlalchemy import create_engine # type: ignore
from sqlalchemy.orm import DeclarativeBase, sessionmaker # type: ignore

# Load configuration from backend/.env
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL is missing from .env")

# Configure SQLAlchemy's database engine
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
)

# Create a factory for database sessions
SessionLocal = sessionmaker(
    bind=engine,
    autoflush=False,
    expire_on_commit=False,
)

# Base class for our database models
class Base(DeclarativeBase):
    pass

# Provide a session to API endpoints
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# import os
# from collections.abc import Generator

# from dotenv import load_dotenv
# from sqlalchemy import create_engine
# from sqlalchemy.orm import DeclarativeBase, sessionmaker



# load_dotenv()


# DATABASE_URL = os.getenv("DATABASE_URL")

# if not DATABASE_URL:
#     raise RuntimeError(
#         "DATABASE_URL is missing. Add it to the backend .env file."
#     )

# engine = create_engine(
#     DATABASE_URL,
#     pool_pre_ping=True,
# )



# SessionLocal = sessionmaker(
#     bind=engine,
#     autoflush=False,
#     expire_on_commit=False,
# )


# class Base(DeclarativeBase):
#     pass



# def get_db() -> Generator[Session, None, None]:
#     db = SessionLocal()

#     try:
#         yield db
#     finally:
#         db.close()
