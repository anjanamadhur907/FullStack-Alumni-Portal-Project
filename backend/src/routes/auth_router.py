from datetime import date
from fastapi import APIRouter, Depends

from src.dependency.service_dependency import get_auth_service
from src.schema.auth_schema import (
    VerifyCardResponse,
    VerifyCardRequest,
    SignupResponse,
    SignupRequest,
    SigninRequest,
    SigninResponse,
)
from src.service.auth_service import AuthService
from src.utils.jwt_util import generate_token

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/verify_card", status_code=201, response_model=VerifyCardResponse)
async def verify_card(request: VerifyCardRequest, auth_service: AuthService = Depends(get_auth_service)):
    return await auth_service.verify_card(request.card_id)


@router.post("/signup", status_code=201, response_model=SignupResponse)
async def signup(request: SignupRequest, auth_service: AuthService = Depends(get_auth_service)):
    return await auth_service.signup(request)


@router.post("/signin", status_code=200, response_model=SigninResponse)
async def signin(request: SigninRequest, auth_service: AuthService = Depends(get_auth_service)):
    user = await auth_service.signin(request)

    student_master = getattr(user, "student_master", None)
    batch = getattr(student_master, "batch", None) if student_master else None
    today = date.today()

    # If batch has finished (today >= batch.end_date), the student is an ALUMNI!
    role = "Alumni" if (batch and today >= batch.end_date) else "Student"
    name = student_master.name if student_master else user.email.split("@")[0]
    batch_name = batch.name if batch else None

    return SigninResponse(
        id=user.id,
        email=user.email,
        mobile=user.mobile,
        role=role,
        name=name,
        batch_name=batch_name,
        token=generate_token({
            "id": user.id,
            "email": user.email,
            "mobile": user.mobile,
            "role": role,
        }),
    )
