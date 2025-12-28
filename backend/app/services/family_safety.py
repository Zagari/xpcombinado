import asyncio
from datetime import datetime, timedelta
from typing import Optional
from pyfamilysafety import FamilySafety
from pyfamilysafety.authenticator import Authenticator
from pyfamilysafety.enum import OverrideTarget, OverrideType


class FamilySafetyService:
    """Wrapper for pyfamilysafety library."""

    def __init__(self):
        self._sessions: dict[str, FamilySafety] = {}

    async def create_session(self, user_id: str, oauth_response_url: str) -> bool:
        """Create a new Family Safety session from OAuth response."""
        try:
            auth = Authenticator()
            await auth.async_initialize(oauth_response_url)

            fs = FamilySafety(auth)
            await fs.update()

            self._sessions[user_id] = fs
            return True
        except Exception as e:
            print(f"Error creating session: {e}")
            return False

    async def get_session(self, user_id: str) -> Optional[FamilySafety]:
        """Get existing session for user."""
        return self._sessions.get(user_id)

    async def get_accounts(self, user_id: str) -> list[dict]:
        """Get all family member accounts."""
        fs = await self.get_session(user_id)
        if not fs:
            return []

        await fs.update()
        accounts = []

        for account in fs.accounts:
            accounts.append({
                "id": account.user_id,
                "name": account.first_name,
                "today_usage": account.today_screentime_usage,
            })

        return accounts

    async def unblock_device(
        self,
        user_id: str,
        account_id: str,
        target: str = "DESKTOP"
    ) -> bool:
        """Unblock a device for a family member."""
        fs = await self.get_session(user_id)
        if not fs:
            return False

        try:
            account = fs.get_account(account_id)
            target_enum = OverrideTarget[target]

            await account.override_device(
                target=target_enum,
                override=OverrideType.CANCEL,
            )
            return True
        except Exception as e:
            print(f"Error unblocking device: {e}")
            return False

    async def block_device(
        self,
        user_id: str,
        account_id: str,
        target: str = "DESKTOP",
        until: Optional[datetime] = None
    ) -> bool:
        """Block a device for a family member."""
        fs = await self.get_session(user_id)
        if not fs:
            return False

        try:
            account = fs.get_account(account_id)
            target_enum = OverrideTarget[target]

            # Block until far future if no until specified
            block_until = until or (datetime.now() + timedelta(days=365))

            await account.override_device(
                target=target_enum,
                override=OverrideType.UNTIL,
                valid_until=block_until,
            )
            return True
        except Exception as e:
            print(f"Error blocking device: {e}")
            return False


# Singleton instance
family_safety_service = FamilySafetyService()
