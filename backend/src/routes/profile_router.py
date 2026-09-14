from fastapi import APIRouter
from fastapi.params import Depends
from src.dependency.service_dependency import get_current_user, get_profile_service
from src.model import User
from src.schema.profile_schema import ProfileResponse, ProfileUpdate
from src.service.profile_service import ProfileService

router = APIRouter(prefix="/profile", tags=["profile"])

@router.get("/me",response_model=ProfileResponse, status_code=200)
async def get_my_profile(current_user:User=Depends(get_current_user),
                         profile_service:ProfileService=Depends(get_profile_service)):
    return await profile_service.get_profile(current_user)

@router.put("/me",response_model=ProfileResponse, status_code=200)
async def update_profile(profile_data:ProfileUpdate,
                         current_user:User=Depends(get_current_user),
                         profile_service:ProfileService=Depends(get_profile_service)):
    return await profile_service.update_profile(current_user, profile_data)

# @router.delete("/me",response_model=ProfileResponse, status_code=200)
# async def delete_profile(current_user:User=Depends(get_current_user),profile_service:ProfileService=Depends(get_profile_service)):
#     return await profile_service.delete_profile(current_user)
