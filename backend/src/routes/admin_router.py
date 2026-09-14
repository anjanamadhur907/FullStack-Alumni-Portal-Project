from fastapi import APIRouter, Depends

from src.dependency.service_dependency import get_admin_service
from src.schema.admin_schema import AdminRequest, AdminResponse
from src.service.admin_service import AdminService
from src.utils.jwt_util import generate_token

router = APIRouter(prefix="/admin", tags=["admin"])

@router.post("/", status_code=201)
async def create_admin(request:AdminRequest, admin_service: AdminService = Depends(get_admin_service)):
    return await admin_service.create_admin(request)

@router.post("/login", status_code=200)
async def login_admin(request:AdminRequest, admin_service: AdminService = Depends(get_admin_service)):
    admin = await admin_service.login_admin(request)
    return AdminResponse(
        id=admin.id,
        email=admin.email,
        token=generate_token({"id": admin.id, "email": admin.email, "role": "Admin", "is_admin": True}),
    )
