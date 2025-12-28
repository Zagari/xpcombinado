from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from datetime import datetime, timedelta
from uuid import uuid4

from app.auth import get_user_id
from app.services.family_safety import family_safety_service
from app.services.scheduler import schedule_block, cancel_scheduled_block


router = APIRouter()


class ReleaseTimeRequest(BaseModel):
    account_id: str
    minutes: int
    targets: list[str] = ["DESKTOP", "MOBILE"]


class ReleaseTimeResponse(BaseModel):
    session_id: str
    expires_at: str
    success: bool


@router.post("/release", response_model=ReleaseTimeResponse)
async def release_time(
    request: ReleaseTimeRequest,
    user_id: str = Depends(get_user_id),
):
    """Release screen time for a child - unblock devices and schedule block."""
    session_id = str(uuid4())
    expires_at = datetime.now() + timedelta(minutes=request.minutes)

    # Unblock all target devices
    for target in request.targets:
        success = await family_safety_service.unblock_device(
            user_id=user_id,
            account_id=request.account_id,
            target=target,
        )
        if not success:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to unblock {target}"
            )

    # Schedule block for when time expires
    for target in request.targets:
        schedule_block(
            user_id=user_id,
            account_id=request.account_id,
            target=target,
            session_id=f"{session_id}_{target}",
            run_at=expires_at,
        )

    return ReleaseTimeResponse(
        session_id=session_id,
        expires_at=expires_at.isoformat(),
        success=True,
    )


class BlockRequest(BaseModel):
    account_id: str
    targets: list[str] = ["DESKTOP", "MOBILE"]
    session_id: str | None = None


@router.post("/block")
async def block_now(
    request: BlockRequest,
    user_id: str = Depends(get_user_id),
):
    """Immediately block devices (manual block or early termination)."""
    # Cancel any scheduled blocks
    if request.session_id:
        for target in request.targets:
            cancel_scheduled_block(f"{request.session_id}_{target}")

    # Block all target devices
    for target in request.targets:
        success = await family_safety_service.block_device(
            user_id=user_id,
            account_id=request.account_id,
            target=target,
        )
        if not success:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to block {target}"
            )

    return {"success": True}
