from typing import Optional
from fastapi import Form
from pydantic import BaseModel, EmailStr


class VerifyCardRequest(BaseModel):
    card_id: str


class VerifyCardResponse(BaseModel):
    verified: bool
    name: str
    card_id: str


class SignupRequest(BaseModel):
    card_id: str
    email: EmailStr
    mobile: str = Form(..., min_length=10, max_length=10)
    password: str = Form(..., min_length=4)


class SignupResponse(BaseModel):
    message: str


class SigninRequest(BaseModel):
    email: EmailStr
    password: str


class SigninResponse(BaseModel):
    id: int
    email: EmailStr
    mobile: Optional[str] = None
    role: Optional[str] = None
    name: Optional[str] = None
    batch_name: Optional[str] = None
    token: str


class UserResponse(BaseModel):
    id: int
    email: str
    mobile: str
