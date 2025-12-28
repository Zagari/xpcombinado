from fastapi import APIRouter, Depends, HTTPException

from app.auth import get_user_id
from app.services.family_safety import family_safety_service


router = APIRouter()


@router.get("/")
async def list_accounts(user_id: str = Depends(get_user_id)):
    """List all family member accounts."""
    accounts = await family_safety_service.get_accounts(user_id)

    if not accounts:
        raise HTTPException(
            status_code=404,
            detail="No accounts found. Please connect to Microsoft Family Safety first."
        )

    return {"accounts": accounts}
