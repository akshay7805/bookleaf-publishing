
from __future__ import annotations

from datetime import date, datetime
from decimal import Decimal
from enum import Enum
from sqlalchemy import JSON #type: ignore

from sqlalchemy import (       #type: ignore
    Boolean,
    Date,
    DateTime,
    Enum as SQLEnum,
    ForeignKey,
    Index,
    Integer,
    Numeric,
    String,
    Text,
    func,
) 
from sqlalchemy.orm import Mapped, mapped_column, relationship #type:ignore

from database import Base


# -------------------------
# ENUMS: Allowed values
# -------------------------

class UserRole(str, Enum):
    AUTHOR = "author"
    ADMIN = "admin"


class TicketStatus(str, Enum):
    OPEN = "Open"
    IN_PROGRESS = "In Progress"
    RESOLVED = "Resolved"
    CLOSED = "Closed"


class TicketPriority(str, Enum):
    CRITICAL = "Critical"
    HIGH = "High"
    MEDIUM = "Medium"
    LOW = "Low"


class TicketCategory(str, Enum):
    ROYALTY_PAYMENTS = "Royalty & Payments"
    ISBN_METADATA = "ISBN & Metadata Issues"
    PRINTING_QUALITY = "Printing & Quality"
    DISTRIBUTION = "Distribution & Availability"
    PRODUCTION = "Book Status & Production Updates"
    GENERAL = "General Inquiry"


# Store enum values as readable strings in the database.
def enum_column(enum_class, name: str):
    return SQLEnum(
        enum_class,
        name=name,
        native_enum=False,
        values_callable=lambda cls: [item.value for item in cls],
    )


# -------------------------
# 1. USERS TABLE
# -------------------------

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    full_name: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(
        String(255), unique=True, index=True, nullable=False
    )
    password_hash: Mapped[str] = mapped_column(
        String(255), nullable=False
    )
    role: Mapped[UserRole] = mapped_column(
        enum_column(UserRole, "user_role"),
        default=UserRole.AUTHOR,
        nullable=False,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    external_id: Mapped[str | None] = mapped_column(
    String(20), unique=True, nullable=True
     )
    phone: Mapped[str | None] = mapped_column(
    String(32), nullable=True
    )
    city: Mapped[str | None] = mapped_column(
    String(100), nullable=True
    )
    joined_date: Mapped[date | None] = mapped_column(
    Date, nullable=True
    )

    books: Mapped[list[Book]] = relationship(back_populates="author")

    authored_tickets: Mapped[list[Ticket]] = relationship(
        back_populates="author",
        foreign_keys="Ticket.author_id",
    )

    assigned_tickets: Mapped[list[Ticket]] = relationship(
        back_populates="assigned_admin",
        foreign_keys="Ticket.assigned_admin_id",
    )

    sent_messages: Mapped[list[TicketMessage]] = relationship(
        back_populates="sender"
    )


# -------------------------
# 2. BOOKS TABLE
# -------------------------

class Book(Base):
    __tablename__ = "books"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    author_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"), index=True, nullable=False
    )

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    isbn: Mapped[str | None] = mapped_column(
        String(32), unique=True, nullable=True
    )
    genre: Mapped[str | None] = mapped_column(
        String(100), nullable=True
    )
    publication_date: Mapped[date | None] = mapped_column(
        Date, nullable=True
    )
    status: Mapped[str] = mapped_column(
        String(100), default="In Production", nullable=False
    )

    mrp: Mapped[Decimal | None] = mapped_column(
         Numeric(12, 2), nullable=True
)     
    copies_sold: Mapped[int] = mapped_column(
        Integer, default=0, nullable=False
    )
    total_royalty_earned: Mapped[Decimal] = mapped_column(
        Numeric(12, 2), default=Decimal("0.00"), nullable=False
    )
    royalty_paid: Mapped[Decimal] = mapped_column(
        Numeric(12, 2), default=Decimal("0.00"), nullable=False
    )
    royalty_pending: Mapped[Decimal] = mapped_column(
        Numeric(12, 2), default=Decimal("0.00"), nullable=False
    )
    external_id: Mapped[str | None] = mapped_column(
        String(20), unique=True, nullable=True
    )

    author_royalty_per_copy: Mapped[Decimal | None] = mapped_column(
        Numeric(12, 2), nullable=True
    )

    last_royalty_payout_date: Mapped[date | None] = mapped_column(
        Date, nullable=True
    )

    print_partner: Mapped[str | None] = mapped_column(
        String(100), nullable=True
    )

    available_on: Mapped[list[str]] = mapped_column(
       JSON, default=list, nullable=False
    )

    author: Mapped[User] = relationship(back_populates="books")


# -------------------------
# 3. TICKETS TABLE
# -------------------------

class Ticket(Base):
    __tablename__ = "tickets"

    __table_args__ = (
        Index("ix_tickets_status_created", "status", "created_at"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    author_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"), index=True, nullable=False
    )
    book_id: Mapped[int | None] = mapped_column(
        ForeignKey("books.id", ondelete="SET NULL"),
        nullable=True,
    )
    assigned_admin_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )

    subject: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)

    category: Mapped[TicketCategory] = mapped_column(
        enum_column(TicketCategory, "ticket_category"),
        default=TicketCategory.GENERAL,
        nullable=False,
    )
    ai_category: Mapped[TicketCategory | None] = mapped_column(
        enum_column(TicketCategory, "ai_ticket_category"),
        nullable=True,
    )

    priority: Mapped[TicketPriority] = mapped_column(
        enum_column(TicketPriority, "ticket_priority"),
        default=TicketPriority.MEDIUM,
        nullable=False,
    )
    ai_priority: Mapped[TicketPriority | None] = mapped_column(
        enum_column(TicketPriority, "ai_ticket_priority"),
        nullable=True,
    )

    status: Mapped[TicketStatus] = mapped_column(
        enum_column(TicketStatus, "ticket_status"),
        default=TicketStatus.OPEN,
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    author: Mapped[User] = relationship(
        back_populates="authored_tickets",
        foreign_keys=[author_id],
    )
    book: Mapped[Book | None] = relationship()
    assigned_admin: Mapped[User | None] = relationship(
        back_populates="assigned_tickets",
        foreign_keys=[assigned_admin_id],
    )
    messages: Mapped[list[TicketMessage]] = relationship(
        back_populates="ticket",
        cascade="all, delete-orphan",
        order_by="TicketMessage.created_at",
    )


# -------------------------
# 4. TICKET MESSAGES TABLE
# -------------------------

class TicketMessage(Base):
    __tablename__ = "ticket_messages"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    ticket_id: Mapped[int] = mapped_column(
        ForeignKey("tickets.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    sender_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"), nullable=False
    )

    body: Mapped[str] = mapped_column(Text, nullable=False)
    is_internal: Mapped[bool] = mapped_column(
        Boolean, default=False, nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    ticket: Mapped[Ticket] = relationship(back_populates="messages")
    sender: Mapped[User] = relationship(back_populates="sent_messages")
