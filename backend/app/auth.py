from fastapi import HTTPException, Depends, Header
from jose import jwt, JWTError
from app.config import get_settings


async def verify_supabase_token(authorization: str = Header(...)) -> dict:
    """Verify Supabase JWT token and return user data."""
    settings = get_settings()

    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")

    token = authorization.replace("Bearer ", "")

    try:
        payload = jwt.decode(
            token,
            settings.supabase_jwt_secret,
            algorithms=["HS256"],
            audience="authenticated",
        )
        return payload
    except JWTError as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")


def get_user_id(token_data: dict = Depends(verify_supabase_token)) -> str:
    """Extract user_id from verified token."""
    return token_data.get("sub")
