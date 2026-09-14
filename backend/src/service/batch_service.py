from src.exception.resource_not_found_exception import ResourceNotFoundException
from src.model import Batch
from src.repository.batch_repository import BatchRepository
from src.schema.batch_schema import BatchRequest


class BatchService:
    def __init__(self, batch_repo: BatchRepository):
        self.batch_repo = batch_repo

    async def create_batch(self, request:BatchRequest):
        batch = Batch(id=request.id ,name=request.name, start_date=request.start_date, end_date=request.end_date)
        return await self.batch_repo.create_batch(batch)

    async def fetch_all(self):
        return await self.batch_repo.fetch_all()

    async def fetch_one_batch(self, id:int):
        batch = await self.batch_repo.fetch_one_batch(id)
        if not batch:
            raise ResourceNotFoundException(f"Batch with id {id} not found")
        return batch

    async def delete_batch(self, id:int):
        batch = await self.fetch_one_batch(id)
        if not batch:
            raise ResourceNotFoundException(f"Batch with id {id} not found")
        await self.batch_repo.delete_batch(batch)
        return {
            "message": f"Batch with id {id} deleted successfully"
        }

    async def update_batch(self, id:int, request:BatchRequest):
        batch = await self.fetch_one_batch(id)
        if not batch:
            raise ResourceNotFoundException(f"Batch with id {id} not found")
        batch.id = request.id
        batch.name = request.name
        batch.start_date = request.start_date
        batch.end_date = request.end_date
        return batch