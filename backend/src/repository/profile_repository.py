from sqlalchemy.ext.asyncio import AsyncSession

from src.model import Profile


class ProfileRepository:
    def __init__(self, session:AsyncSession):
        self.session = session

    async def create_profile(self, profile:Profile):
        self.session.add(profile)
        await self.session.flush()
        await self.session.refresh(profile)
        return profile

    async def get_profile_by_user_id(self, user_id:int):
        return await self.session.get(Profile, user_id)

    # async def delete_profile(self, profile:Profile):
    #     await self.session.delete(profile)
    #     await self.session.flush()

    async def update_profile(self, profile: Profile):
        await self.session.flush()
        await self.session.refresh(profile)
        return profile