"""
dependencies.py
===============
FastAPI dependency functions for authentication and authorization.
Route handlers declare these as parameters (e.g.
`current_user: User = Depends(get_current_user)`) and FastAPI handles
calling them, extracting the bearer token, and raising the appropriate
HTTP error before the route body ever runs.
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from backend.database.database import get_db
from backend.database.crud import get_user_by_email
from backend.auth.security import decode_access_token
from backend.models.orm_models import User, UserRole

# tokenUrl points at the login endpoint, used only for generating
# Swagger UI's "Authorize" button form — it doesn't affect runtime auth.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)


def get_current_user(
    token: str | None = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    """
    Resolve the current authenticated user from the Authorization
    bearer token. Raises 401 if the token is missing, invalid, expired,
    or no longer matches an existing/active user.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if token is None:
        raise credentials_exception

    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception

    email = payload.get("sub")
    if email is None:
        raise credentials_exception

    user = get_user_by_email(db, email)
    if user is None:
        raise credentials_exception

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account has been deactivated.",
        )

    return user


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """
    Dependency that additionally enforces the current user has the
    ADMIN role. Used on all /api/admin/* routes.
    """
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This action requires administrator privileges.",
        )
    return current_user
