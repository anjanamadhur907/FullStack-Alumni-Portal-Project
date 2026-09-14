import random

from src.exception.resource_not_found_exception import ResourceNotFoundException
from src.model import Student_Master
from src.repository.student_master_repository import StudentMasterRepository
from src.schema.student_master_schema import StudentMasterRequest


class StudentMasterService:
    def __init__(self, student_master_repo:StudentMasterRepository):
        self.student_master_repo = student_master_repo

    async def generate_card_id(self, batch_id:int):
        """
                Format:
                INFO + Batch(2 Digit) + Random(4 Digit)

                Example:
                INFO013482
        """
        while True:
            random_number = random.randint(10000, 99999)
            card_id = f"INF{batch_id:02d}{random_number}"
            student = await self.student_master_repo.get_by_card_id(card_id)
            if not student:
                return card_id

    async def create_student_master(self, request:StudentMasterRequest):
        card_id = await self.generate_card_id(request.batch_id)

        student_master = Student_Master(name=request.name,batch_id=request.batch_id ,card_id=card_id)
        return await self.student_master_repo.create_student_master(student_master)

    async def fetch_all(self):
        return await self.student_master_repo.fetch_all()

    async def get_student_by_id(self, id:int):
        return await self.student_master_repo.get_student_by_id(id)

    async def delete_student_master(self, id:int):
        student_master = await self.student_master_repo.get_student_by_id(id)
        if not student_master:
            raise ResourceNotFoundException(f"Student master with id {id} not found")
        return await self.student_master_repo.delete_student_master(student_master)

    async def update_student_master(self,id:int, request:StudentMasterRequest):
        student_master = await self.get_student_by_id(id)
        if not student_master:
            raise ResourceNotFoundException(f"Student master with id {id} not found")
        student_master.name = request.name
        student_master.batch_id = request.batch_id
        return student_master

    async def fetch_by_batch_id(self, batch_id:int):
        return await self.student_master_repo.fetch_by_batch_id(batch_id)

    # async def get_by_card_id(self, card_id:str):
    #     return await self.student_master_repo.get_by_card_id(card_id)
