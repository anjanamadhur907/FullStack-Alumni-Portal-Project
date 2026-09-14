from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.model import Batch


class BatchRepository:
    def __init__(self, session:AsyncSession):
        self.session = session

    async def create_batch(self, batch:Batch):
        self.session.add(batch)
        await self.session.flush()
        await self.session.refresh(batch)
        return batch

    async def fetch_all(self):
        stmt = select(Batch)
        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def fetch_one_batch(self, id:int):
        return await self.session.get(Batch, id)

    async def delete_batch(self, batch:Batch):
        await self.session.delete(batch)
        await self.session.flush()