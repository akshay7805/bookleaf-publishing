
from fastapi import APIRouter, Depends #type:ignore
from sqlalchemy import select #type:ignore
from sqlalchemy.orm import Session #type:ignore

from database import get_db
from dependencies import require_author
from models import Book, User


router = APIRouter(
    prefix="/api/author",
    tags=["Author"],
)


@router.get("/overview")
def get_author_overview(
    current_user: User = Depends(require_author),
    db: Session = Depends(get_db),
):
    # Fetch only books belonging to the authenticated author.
    statement = select(Book).where(
        Book.author_id == current_user.id
    )
    books = db.scalars(statement).all()

    # Calculate dashboard statistics.
    total_books = len(books)

    total_copies_sold = sum(
        book.copies_sold or 0 for book in books
    )

    total_royalty_earned = sum(
        book.total_royalty_earned or 0 for book in books
    )

    royalty_paid = sum(
        book.royalty_paid or 0 for book in books
    )

    royalty_pending = sum(
        book.royalty_pending or 0 for book in books
    )

    return {
        "author": {
            "id": current_user.id,
            "full_name": current_user.full_name,
            "email": current_user.email,
        },
        "statistics": {
            "total_books": total_books,
            "total_copies_sold": total_copies_sold,
            "total_royalty_earned": total_royalty_earned,
            "royalty_paid": royalty_paid,
            "royalty_pending": royalty_pending,
        },
    }


@router.get("/books")
def get_author_books(
    current_user: User = Depends(require_author),
    db: Session = Depends(get_db),
):
    # Never accept the author ID from the frontend.
    statement = select(Book).where(
        Book.author_id == current_user.id
    )

    books = db.scalars(statement).all()

    return [
        {
            "id": book.id,
            "title": book.title,
            "isbn": book.isbn,
            "genre": book.genre,
            "publication_date": book.publication_date,
            "status": book.status,
            "mrp": book.mrp,
            "copies_sold": book.copies_sold,
            "total_royalty_earned": book.total_royalty_earned,
            "royalty_paid": book.royalty_paid,
            "royalty_pending": book.royalty_pending,
        }
        for book in books
    ]
