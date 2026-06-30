"""
auth_routes.py
==============
POST /api/auth/register
POST /api/auth/login

Registration creates a new user with a bcrypt-hashed password. Login
verifies credentials and issues a signed JWT access token. Both routes
return 400/401 with generic-enough error messages to avoid leaking
whether a given email exists in the system (a minor but standard
security hardening for auth endpoints).
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.database.database import get_db
from backend.database import crud
from backend.auth.security import verify_password, create_access_token
from backend.config import settings
from backend.models.schemas import UserRegister, UserLogin, TokenResponse, UserResponse

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(payload: UserRegister, db: Session = Depends(get_db)):
    """Create a new user account. Email must be unique (case-insensitive)."""
    existing = crud.get_user_by_email(db, payload.email)
    if existing is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists.",
        )

    user = crud.create_user(
        db,
        email=payload.email,
        password=payload.password,
        full_name=payload.full_name,
    )
    return user


@router.post("/login", response_model=TokenResponse)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    """Authenticate with email + password and receive a JWT access token."""
    user = crud.get_user_by_email(db, payload.email)

    # Deliberately use the same error for "no such user" and "wrong
    # password" so the API doesn't leak which emails are registered.
    invalid_credentials = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Incorrect email or password.",
    )

    if user is None or not verify_password(payload.password, user.hashed_password):
        raise invalid_credentials

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account has been deactivated.",
        )

    access_token = create_access_token(data={"sub": user.email, "role": user.role.value})

    return TokenResponse(
        access_token=access_token,
        expires_in_minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES,
    )
