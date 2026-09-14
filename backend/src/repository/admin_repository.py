from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.model import Admin


class AdminRepository:
    def __init__(self, session:AsyncSession):
        self.session = session

    async def create_admin(self, admin:Admin):
        self.session.add(admin)
        await self.session.flush()
        await self.session.refresh(admin)
        return admin

    async def find_by_email(self, email:str):
        stmt = select(Admin).where(Admin.email == email)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_id(self, id: int):
        stmt = select(Admin).where(Admin.id == id)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()