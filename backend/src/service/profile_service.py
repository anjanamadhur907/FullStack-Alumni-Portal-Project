from datetime import date
from typing import Optional

from fastapi import HTTPException
from starlette import status

from src.exception.resource_not_found_exception import ResourceNotFoundException
from src.model import Student_Master, Profile, User
from src.repository.profile_repository import ProfileRepository
from src.schema.profile_schema import ProfileResponse, ProfileUpdate


class ProfileService:
    def __init__(self, profile_repo: ProfileRepository):
        self.profile_repo = profile_repo

    async def get_profile(self, current_user):
        if getattr(current_user, "is_admin", False) or not hasattr(current_user, "student_master_id"):
            return ProfileResponse(
                user_id=current_user.id,
                name="Admin",
                dob=None,
                gender=None,
                website_url1=None,
                website_url2=None,
                website_url3=None,
                about="System Administrator",
                role="Admin",
            )

        profile = await self.profile_repo.get_profile_by_user_id(current_user.id)
        student_master = getattr(current_user, "student_master", None)
        batch = getattr(student_master, "batch", None) if student_master else None

        today = date.today()
        # If batch has ended (today >= batch.end_date), role is Alumni!
        role = "Alumni" if (batch and today >= batch.end_date) else "Student"

        if not profile:
            profile_name = student_master.name if student_master else "Member"
            new_profile = Profile(user_id=current_user.id, name=profile_name)
            try:
                profile = await self.profile_repo.create_profile(new_profile)
            except Exception:
                return ProfileResponse(
                    user_id=current_user.id,
                    name=profile_name,
                    dob=None,
                    gender=None,
                    website_url1=None,
                    website_url2=None,
                    website_url3=None,
                    about=None,
                    role=role,
                )

        return ProfileResponse(
            user_id=current_user.id,
            name=profile.name or (student_master.name if student_master else "Member"),
            dob=profile.dob,
            gender=profile.gender,
            website_url1=profile.website_url1,
            website_url2=profile.website_url2,
            website_url3=profile.website_url3,
            about=profile.about,
            role=role,
        )

    async def update_profile(self, current_user, profile_data: ProfileUpdate):
        profile = await self.profile_repo.get_profile_by_user_id(current_user.id)
        student_master = getattr(current_user, "student_master", None)
        batch = getattr(student_master, "batch", None) if student_master else None

        today = date.today()
        role = "Alumni" if (batch and today >= batch.end_date) else "Student"

        if not profile:
            profile = Profile(user_id=current_user.id, name=student_master.name if student_master else "Member")
            profile = await self.profile_repo.create_profile(profile)

        update_data = profile_data.model_dump(exclude_unset=True)

        for key, value in update_data.items():
            setattr(profile, key, value)

        profile = await self.profile_repo.update_profile(profile)

        return ProfileResponse(
            user_id=profile.user_id,
            name=profile.name or (student_master.name if student_master else "Member"),
            dob=profile.dob,
            gender=profile.gender,
            website_url1=profile.website_url1,
            website_url2=profile.website_url2,
            website_url3=profile.website_url3,
            about=profile.about,
            role=role,
        )