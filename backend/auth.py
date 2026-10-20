
import os
from datetime import datetime, timedelta, timezone
from typing import Any

import jwt #type:ignore
from dotenv import load_dotenv #type:ignore
from pwdlib import PasswordHash #type:ignore


# Load environment variables from the backend .env file.
load_dotenv()

# Secret used to sign and verify our JWT tokens.
SECRET_KEY = os.getenv("SECRET_KEY")

if not SECRET_KEY:
    raise RuntimeError(
        "SECRET_KEY is missing. Add it to the backend .env file."
    )

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Create a password hasher using a recommended secure algorithm.
password_hasher = PasswordHash.recommended()


def hash_password(password: str) -> str:
    """Convert a plain password into a secure password hash."""
    return password_hasher.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    """Check whether a plain password matches its stored hash."""
    return password_hasher.verify(password, password_hash)


def create_access_token(
    user_id: int,
    expires_delta: timedelta | None = None,
) -> str:
    """Create a signed JWT for an authenticated user."""

    if expires_delta is None:
        expires_delta = timedelta(
            minutes=ACCESS_TOKEN_EXPIRE_MINUTES
        )

    expires_at = datetime.now(timezone.utc) + expires_delta

    payload = {
        "sub": str(user_id),
        "exp": expires_at,
    }

    token = jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM,
    )

    return token


def decode_access_token(token: str) -> dict[str, Any]:
    """Verify a JWT and return its payload."""

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM],
        )
    except jwt.InvalidTokenError as exc:
        raise ValueError(
            "Invalid or expired access token."
        ) from exc

    if not payload.get("sub"):
        raise ValueError("Token is missing the user ID.")

    return payload
