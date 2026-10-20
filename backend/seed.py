
import json
import os
from datetime import date
from decimal import Decimal
from pathlib import Path
# test

from dotenv import load_dotenv #type:ignore
from sqlalchemy import func, select #type:ignore

from auth import hash_password
from database import SessionLocal
from models import Book, User, UserRole


load_dotenv()

DATA_FILE = Path(__file__).resolve().parent / "bookleaf_sample_data.json"

AUTHOR_PASSWORD = os.getenv("SEED_DEFAULT_PASSWORD")
ADMIN_NAME = os.getenv("ADMIN_NAME", "BookLeaf Admin")
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "").strip().lower()
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD")


def parse_date(value: str | None) -> date | None:
    """Convert an ISO date string into a Python date."""
    return date.fromisoformat(value) if value else None


def parse_money(value) -> Decimal | None:
    """Convert a JSON number into an exact decimal amount."""
    return Decimal(str(value)) if value is not None else None


def money_or_zero(value) -> Decimal:
    """Return a decimal amount, using zero when it is missing."""
    amount = parse_money(value)
    return amount if amount is not None else Decimal("0.00")


def load_dataset() -> list[dict]:
    """Read and validate the supplied sample dataset."""

    if not DATA_FILE.exists():
        raise FileNotFoundError(
            f"Dataset not found: {DATA_FILE}\n"
            "Place bookleaf_sample_data.json in the backend folder."
        )

    with DATA_FILE.open("r", encoding="utf-8") as file:
        data = json.load(file)

    authors = data.get("authors") if isinstance(data, dict) else None

    if not isinstance(authors, list):
        raise ValueError(
            "Invalid dataset: expected an 'authors' list."
        )

    if not all(isinstance(author, dict) for author in authors):
        raise ValueError("Every author record must be an object.")

    book_count = sum(
        len(author.get("books", []))
        for author in authors
    )

    # Check that we are using the supplied assignment dataset.
    if len(authors) != 10 or book_count != 18:
        raise ValueError(
            f"Expected 10 authors and 18 books; "
            f"found {len(authors)} authors and {book_count} books."
        )

    return authors


def seed_database() -> None:
    """Insert or update sample authors, books, and one admin account."""

    if not AUTHOR_PASSWORD or not ADMIN_EMAIL or not ADMIN_PASSWORD:
        raise RuntimeError(
            "Set SEED_DEFAULT_PASSWORD, ADMIN_EMAIL, and "
            "ADMIN_PASSWORD in the backend .env file."
        )

    authors_data = load_dataset()

    author_emails = {
        author["email"].strip().lower()
        for author in authors_data
    }

    if ADMIN_EMAIL in author_emails:
        raise ValueError(
            "ADMIN_EMAIL must not match a sample author email."
        )

    author_ids = [author["author_id"] for author in authors_data]

    book_ids = [
        book["book_id"]
        for author in authors_data
        for book in author.get("books", [])
    ]

    # One transaction: either the changes commit together or roll back.
    with SessionLocal.begin() as db:

        for author_data in authors_data:
            email = author_data["email"].strip().lower()
            external_author_id = author_data["author_id"]

            # Find the author by the original ID, or by email on
            # an earlier seed run where the original ID was absent.
            user = db.scalar(
                select(User).where(
                    User.external_id == external_author_id
                )
            )

            if user is None:
                user = db.scalar(
                    select(User).where(User.email == email)
                )

            if user is None:
                user = User(
                    full_name=author_data["name"],
                    email=email,
                    password_hash=hash_password(AUTHOR_PASSWORD),
                    role=UserRole.AUTHOR,
                )
                db.add(user)

            # Update the profile without resetting an existing
            # author's password on every seed run.
            user.external_id = external_author_id
            user.full_name = author_data["name"]
            user.email = email
            user.phone = author_data.get("phone")
            user.city = author_data.get("city")
            user.joined_date = parse_date(
                author_data.get("joined_date")
            )
            user.role = UserRole.AUTHOR

            # Make sure the user has a database ID before adding books.
            db.flush()

            for book_data in author_data.get("books", []):
                external_book_id = book_data["book_id"]
                isbn = book_data.get("isbn")

                book = db.scalar(
                    select(Book).where(
                        Book.external_id == external_book_id
                    )
                )

                # Reuse a matching existing book when possible.
                if book is None and isbn:
                    book = db.scalar(
                        select(Book).where(Book.isbn == isbn)
                    )

                if book is None:
                    book = Book()
                    db.add(book)

                # Map the JSON fields into our database model.
                book.external_id = external_book_id
                book.author_id = user.id
                book.title = book_data["title"]
                book.isbn = isbn
                book.genre = book_data.get("genre")
                book.publication_date = parse_date(
                    book_data.get("publication_date")
                )
                book.status = book_data["status"]

                book.mrp = parse_money(book_data.get("mrp"))
                book.author_royalty_per_copy = parse_money(
                    book_data.get("author_royalty_per_copy")
                )

                book.copies_sold = int(
                    book_data.get("total_copies_sold") or 0
                )
                book.total_royalty_earned = money_or_zero(
                    book_data.get("total_royalty_earned")
                )
                book.royalty_paid = money_or_zero(
                    book_data.get("royalty_paid")
                )
                book.royalty_pending = money_or_zero(
                    book_data.get("royalty_pending")
                )

                book.last_royalty_payout_date = parse_date(
                    book_data.get("last_royalty_payout_date")
                )
                book.print_partner = book_data.get("print_partner")
                book.available_on = book_data.get("available_on") or []

        # The JSON contains no admin account, so create one separately.
        admin = db.scalar(
            select(User).where(User.email == ADMIN_EMAIL)
        )

        if admin is None:
            admin = User(
                full_name=ADMIN_NAME,
                email=ADMIN_EMAIL,
                password_hash=hash_password(ADMIN_PASSWORD),
                role=UserRole.ADMIN,
            )
            db.add(admin)
        else:
            admin.full_name = ADMIN_NAME
            admin.role = UserRole.ADMIN
            # Keep an existing admin password unchanged.


    # Verify the supplied records were persisted.
    with SessionLocal() as db:
        saved_authors = db.scalar(
            select(func.count(User.id)).where(
                User.external_id.in_(author_ids)
            )
        ) or 0

        saved_books = db.scalar(
            select(func.count(Book.id)).where(
                Book.external_id.in_(book_ids)
            )
        ) or 0

    print("Database seeding completed.")
    print(f"Sample authors verified: {saved_authors}/10")
    print(f"Sample books verified: {saved_books}/18")
    print(f"Admin email: {ADMIN_EMAIL}")
    print("Author password: configured in SEED_DEFAULT_PASSWORD")
    print("Admin password: configure in .env when first creating the account")

    if saved_authors != 10 or saved_books != 18:
        raise RuntimeError(
            "The database record counts do not match the supplied dataset."
        )


if __name__ == "__main__":
    seed_database()
