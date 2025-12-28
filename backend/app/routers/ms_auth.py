from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.auth import get_user_id
from app.config import get_settings
from app.services.family_safety import family_safety_service


router = APIRouter()


class OAuthCallbackRequest(BaseModel):
    oauth_response_url: str


@router.get("/login-url")
async def get_login_url():
    """Get the Microsoft OAuth login URL."""
    settings = get_settings()

    # This is the Family Safety OAuth URL
    login_url = (
        "https://login.microsoftonline.com/common/oauth2/v2.0/authorize"
        "?response_type=token"
        f"&client_id={settings.ms_client_id}"
        "&scope=openid%20offline_access%20https://graph.microsoft.com/.default"
        f"&redirect_uri={settings.ms_redirect_uri}"
        "&cobrandid=9ad43f27-5c5e-4f27-9e67-9f7e1ac341e7"
    )

    return {"login_url": login_url}


@router.post("/callback")
async def oauth_callback(
    request: OAuthCallbackRequest,
    user_id: str = Depends(get_user_id),
):
    """Process OAuth callback and create session."""
    success = await family_safety_service.create_session(
        user_id=user_id,
        oauth_response_url=request.oauth_response_url,
    )

    if not success:
        raise HTTPException(
            status_code=400,
            detail="Failed to create Family Safety session. Please try again."
        )

    return {"success": True, "message": "Connected to Microsoft Family Safety"}
