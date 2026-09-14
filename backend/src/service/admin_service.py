from fastapi import HTTPException

from src.exception.resource_not_found_exception import ResourceNotFoundException
from src.model import Admin
from src.repository.admin_repository import AdminRepository
from src.schema.admin_schema import AdminRequest
from src.utils.password import hash_password, verify_password


class AdminService:
    def __init__(self, admin_repo:AdminRepository):
        self.admin_repo = admin_repo

    async def create_admin(self, request:AdminRequest):
        admin = Admin(email=request.email, password=hash_password(request.password))
        return await self.admin_repo.create_admin(admin)

    async def login_admin(self, request:AdminRequest):
        admin = await self.admin_repo.find_by_email(request.email)
        if not admin:
            raise ResourceNotFoundException(f"Admin with email {request.email} not found")
        status = verify_password(request.password, admin.password)
        if not status:
            raise HTTPException(status_code=401, detail="Incorrect password")
        return admin