from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.model import Student_Master


class StudentMasterRepository:
    def __init__(self, session:AsyncSession):
        self.session = session

    async def create_student_master(self, student_master:Student_Master):
        self.session.add(student_master)
        await self.session.flush()
        await self.session.refresh(student_master)
        return student_master

    async def fetch_all(self):
        stmt = select(Student_Master)
        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def get_student_by_id(self, id:int):
        return await self.session.get(Student_Master, id)

    async def delete_student_master(self, student_master:Student_Master):
        await self.session.delete(student_master)

    async def get_by_card_id(self, card_id:str):
        result = await self.session.execute(
            select(Student_Master).where(Student_Master.card_id == card_id)
        )
        return result.scalar_one_or_none()

    async def fetch_by_batch_id(self, batch_id:int):
        stmt = select(Student_Master).where(Student_Master.batch_id == batch_id)
        result = await self.session.execute(stmt)
        return result.scalars().all()