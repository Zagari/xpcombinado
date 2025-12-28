from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.jobstores.memory import MemoryJobStore
from datetime import datetime

from app.services.family_safety import family_safety_service


scheduler = AsyncIOScheduler(
    jobstores={"default": MemoryJobStore()},
    job_defaults={"coalesce": True, "max_instances": 1},
)


async def block_device_job(
    user_id: str,
    account_id: str,
    target: str,
    session_id: str
):
    """Job to block device when time expires."""
    print(f"[{datetime.now()}] Blocking device for session {session_id}")

    success = await family_safety_service.block_device(
        user_id=user_id,
        account_id=account_id,
        target=target,
    )

    if success:
        print(f"[{datetime.now()}] Device blocked successfully for session {session_id}")
    else:
        print(f"[{datetime.now()}] Failed to block device for session {session_id}")

    # TODO: Update session status in Supabase


def schedule_block(
    user_id: str,
    account_id: str,
    target: str,
    session_id: str,
    run_at: datetime,
):
    """Schedule a device block for a specific time."""
    job_id = f"block_{session_id}"

    # Remove existing job if any
    existing_job = scheduler.get_job(job_id)
    if existing_job:
        scheduler.remove_job(job_id)

    scheduler.add_job(
        block_device_job,
        "date",
        run_date=run_at,
        args=[user_id, account_id, target, session_id],
        id=job_id,
    )

    print(f"Scheduled block for session {session_id} at {run_at}")


def cancel_scheduled_block(session_id: str):
    """Cancel a scheduled block."""
    job_id = f"block_{session_id}"
    existing_job = scheduler.get_job(job_id)
    if existing_job:
        scheduler.remove_job(job_id)
        print(f"Cancelled scheduled block for session {session_id}")
