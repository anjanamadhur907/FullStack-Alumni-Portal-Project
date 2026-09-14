from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from starlette import status

from src.dependency.repository_dependency import (
    get_admin_repository,
    get_batch_repository,
    get_student_master_repository,
    get_profile_repository,
    get_user_repository,
    get_post_repository,
)
from src.repository.admin_repository import AdminRepository
from src.repository.batch_repository import BatchRepository
from src.repository.post_repository import PostRepository
from src.repository.profile_repository import ProfileRepository
from src.repository.student_master_repository import StudentMasterRepository
from src.repository.user_repository import UserRepository
from src.service.admin_service import AdminService
from src.service.auth_service import AuthService
from src.service.batch_service import BatchService
from src.service.post_service import PostService
from src.service.profile_service import ProfileService
from src.service.student_master_service import StudentMasterService
from src.utils.jwt_util import verify_token

security = HTTPBearer()

async def get_current_user(
    header: HTTPAuthorizationCredentials = Depends(security),
    user_repo: UserRepository = Depends(get_user_repository),
    admin_repo: AdminRepository = Depends(get_admin_repository),
):
    token = header.credentials
    payload = verify_token(token)
    user_id = payload.get("id")
    email = payload.get("email")
    role = payload.get("role")
    is_admin_flag = payload.get("is_admin")

    # 1. Check if token explicitly identifies Admin or if email matches Admin
    if role == "Admin" or is_admin_flag is True:
        admin = None
        if user_id:
            admin = await admin_repo.get_by_id(user_id)
        if not admin and email:
            admin = await admin_repo.find_by_email(email)
        if admin:
            setattr(admin, "is_admin", True)
            setattr(admin, "role", "Admin")
            return admin

    # 2. Check if email matches Admin table directly (to prevent ID collision with user table)
    if email:
        admin = await admin_repo.find_by_email(email)
        if admin:
            setattr(admin, "is_admin", True)
            setattr(admin, "role", "Admin")
            return admin

    # 3. Check student/alumni User table
    user = None
    if email:
        user = await user_repo.get_by_email(email)
    elif user_id:
        user = await user_repo.get_by_id(user_id)

    if user:
        setattr(user, "is_admin", False)
        return user

    # 4. Fallback to check Admin by ID
    if user_id:
        admin = await admin_repo.get_by_id(user_id)
        if admin:
            setattr(admin, "is_admin", True)
            setattr(admin, "role", "Admin")
            return admin

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Unauthorized user or invalid token.",
    )

def get_admin_service(admin_repo: AdminRepository = Depends(get_admin_repository)):
    return AdminService(admin_repo)

def get_batch_service(batch_repo: BatchRepository = Depends(get_batch_repository)):
    return BatchService(batch_repo)

def get_student_master_service(student_master_repo: StudentMasterRepository = Depends(get_student_master_repository)):
    return StudentMasterService(student_master_repo)

def get_profile_service(profile_repo: ProfileRepository = Depends(get_profile_repository)):
    return ProfileService(profile_repo)

def get_post_service(
    post_repo: PostRepository = Depends(get_post_repository),
    user_repo: UserRepository = Depends(get_user_repository),
    profile_repo: ProfileRepository = Depends(get_profile_repository),
    student_master_repo: StudentMasterRepository = Depends(get_student_master_repository),
):
    return PostService(post_repo, user_repo, profile_repo, student_master_repo)

def get_auth_service(
    student_repo: StudentMasterRepository = Depends(get_student_master_repository),
    user_repo: UserRepository = Depends(get_user_repository),
    profile_repo: ProfileRepository = Depends(get_profile_repository),
):
    return AuthService(student_repo, user_repo, profile_repo)