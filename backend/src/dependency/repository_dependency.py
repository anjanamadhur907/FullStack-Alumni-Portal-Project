from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from src.db.dbConfig import get_session
from src.repository.admin_repository import AdminRepository
from src.repository.batch_repository import BatchRepository
from src.repository.post_repository import PostRepository
from src.repository.profile_repository import ProfileRepository
from src.repository.student_master_repository import StudentMasterRepository
from src.repository.user_repository import UserRepository


def get_admin_repository(session:AsyncSession=Depends(get_session)):
    return AdminRepository(session)

def get_batch_repository(session:AsyncSession=Depends(get_session)):
    return BatchRepository(session)

def get_student_master_repository(session:AsyncSession=Depends(get_session)):
    return StudentMasterRepository(session)

def get_user_repository(session:AsyncSession=Depends(get_session)):
    return UserRepository(session)

def get_profile_repository(session:AsyncSession=Depends(get_session)):
    return ProfileRepository(session)

def get_post_repository(session:AsyncSession=Depends(get_session)):
    return PostRepository(session)