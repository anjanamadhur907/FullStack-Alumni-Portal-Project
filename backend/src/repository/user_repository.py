from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from src.model import User, Student_Master


class UserRepository:
    def __init__(self, session:AsyncSession):
        self.session = session

    async def create_user(self, user:User):
        self.session.add(user)
        await self.session.flush()
        await self.session.refresh(user)
        return user

    async def get_by_id(self, id:int):
        stmt = (
            select(User)
            .options(
                selectinload(User.student_master)
                .selectinload(Student_Master.batch)
            )
            .where(User.id == id)
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_email(self, email: str):
        stmt = (
            select(User)
            .options(
                selectinload(User.student_master)
                .selectinload(Student_Master.batch)
            )
            .where(User.email == email)
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_mobile(self, mobile: str):
        result = await self.session.execute(
            select(User).where(User.mobile == mobile)
        )
        return result.scalar_one_or_none()

    async def get_by_student_master_id(self, student_master_id: int):
        result = await self.session.execute(
            select(User).where(
                User.student_master_id == student_master_id
            )
        )
        return result.scalar_one_or_none()

    async def delete_user(self, user:User):
        await self.session.delete(user)
        await self.session.flush()