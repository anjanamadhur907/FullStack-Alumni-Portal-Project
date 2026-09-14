from fastapi import HTTPException

from src.exception.resource_not_found_exception import ResourceNotFoundException
from src.model import User, Profile
from src.repository.profile_repository import ProfileRepository
from src.repository.student_master_repository import StudentMasterRepository
from src.repository.user_repository import UserRepository
from src.schema.auth_schema import SignupRequest, SigninRequest
from src.utils import password
from src.utils.password import hash_password, verify_password


class AuthService:
    def __init__(self,
                 student_repo:StudentMasterRepository,
                 user_repo:UserRepository,
                 profile_repo:ProfileRepository
                 ):
        self.student_repo = student_repo
        self.user_repo = user_repo
        self.profile_repo = profile_repo

    async def verify_card(self, card_id:str):
        student = await self.student_repo.get_by_card_id(card_id)
        if not student:
            raise HTTPException(status_code=404, detail="Invalid card id")
        return {
            "verified":True,
            "name":student.name,
            "card_id":student.card_id
        }

    async def signup(self, data:SignupRequest):
        print(data)
        print(data.card_id)
        student = await self.student_repo.get_by_card_id(data.card_id)
        if not student:
            raise HTTPException(status_code=404, detail="Invalid card id")

        user = await self.user_repo.get_by_student_master_id(student.id)
        if user:
            raise HTTPException(status_code=400, detail="User already exists")

        email = await self.user_repo.get_by_email(data.email)
        if email:
            raise HTTPException(status_code=400, detail="Email already exists")

        user = User(student_master_id=student.id,
                    email=data.email,
                    mobile=data.mobile,
                    password=hash_password(data.password))

        user = await self.user_repo.create_user(user)

        profile = Profile(user_id = user.id)

        await self.profile_repo.create_profile(profile)
        return {
            "message":"Signup successful"
        }

    async def signin(self, request:SigninRequest):
        user = await self.user_repo.get_by_email(request.email)
        if not user:
            raise HTTPException(status_code=404, detail="Invalid email | email not found")
        status = verify_password(request.password, user.password)
        if not status:
            raise HTTPException(status_code=400, detail="Invalid password")
        return user