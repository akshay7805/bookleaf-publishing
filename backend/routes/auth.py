
from fastapi import APIRouter, Depends, HTTPException, status #type:ignore
from sqlalchemy import func, select #type:ignore
from sqlalchemy.orm import Session #type:ignore

from auth import (
    ACCESS_TOKEN_EXPIRE_MINUTES,
    create_access_token,
    verify_password,
)
from database import get_db
from models import User
from schemas import LoginRequest, TokenResponse, UserSummary


router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"],
)


@router.post("/login", response_model=TokenResponse)
def login(
    data: LoginRequest,
    db: Session = Depends(get_db),
):
    # Normalize the email before searching.
    email = str(data.email).strip().lower()

    # Find the user without loading all users into Python.
    statement = select(User).where(
        func.lower(User.email) == email
    )
    user = db.scalar(statement)

    # Use the same message for an unknown email or wrong password.
    if user is None or not verify_password(
        data.password,
        user.password_hash,
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Create a token only after credentials are verified.
    token = create_access_token(user_id=user.id)

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=UserSummary(
            id=user.id,
            full_name=user.full_name,
            email=user.email,
            role=user.role,
        ),
    )
