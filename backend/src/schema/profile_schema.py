from datetime import date
from typing import Optional

from pydantic import BaseModel


class ProfileUpdate(BaseModel):
    name: Optional[str]=None
    dob: Optional[date] = None
    gender: Optional[str] = None
    website_url1: Optional[str] = None
    website_url2: Optional[str] = None
    website_url3: Optional[str] = None
    about: Optional[str] = None


class ProfileResponse(BaseModel):
    user_id: int
    name:Optional[str]
    dob: Optional[date]
    gender: Optional[str]
    website_url1: Optional[str]
    website_url2: Optional[str]
    website_url3: Optional[str]
    about: Optional[str]
    role: str