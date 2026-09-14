from typing import Optional

from fastapi import APIRouter, UploadFile, File, Form
from fastapi.params import Depends

from src.dependency.service_dependency import (
    get_current_user,
    get_post_service,
)
from src.model import User
from src.schema.post_schema import PostResponse
from src.service.post_service import PostService

router = APIRouter(prefix="/post", tags=["Post"])


@router.post("/", response_model=PostResponse, status_code=201)
async def create_post(
    title: str = Form(...),
    content: Optional[str] = Form(None),
    category: Optional[str] = Form("General"),
    post_image: Optional[UploadFile] = File(None),
    current_user: User = Depends(get_current_user),
    post_service: PostService = Depends(get_post_service),
):
    return await post_service.create_post(
        title,
        content,
        category,
        post_image,
        current_user,
    )


@router.get("/", response_model=list[PostResponse], status_code=200)
async def get_all_posts(
    post_service: PostService = Depends(get_post_service),
):
    return await post_service.get_all_posts()


@router.get("/me", response_model=list[PostResponse], status_code=200)
async def get_my_posts(
    current_user: User = Depends(get_current_user),
    post_service: PostService = Depends(get_post_service),
):
    return await post_service.get_by_user_id(current_user.id)


@router.get("/user/{user_id}", response_model=list[PostResponse], status_code=200)
async def get_posts_by_user_id(
    user_id: int,
    post_service: PostService = Depends(get_post_service),
):
    return await post_service.get_by_user_id(user_id)


@router.get("/{post_id}", response_model=PostResponse, status_code=200)
async def get_post_by_id(
    post_id: int,
    post_service: PostService = Depends(get_post_service),
):
    return await post_service.get_post_by_id(post_id)


@router.get("/category/{category}", response_model=list[PostResponse], status_code=200)
async def get_posts_by_category(
    category: str,
    post_service: PostService = Depends(get_post_service),
):
    return await post_service.get_posts_by_category(category)


@router.put("/{post_id}", response_model=PostResponse, status_code=200)
async def update_post(
    post_id: int,
    title: str = Form(...),
    content: Optional[str] = Form(None),
    category: Optional[str] = Form("General"),
    post_image: Optional[UploadFile] = File(None),
    current_user: User = Depends(get_current_user),
    post_service: PostService = Depends(get_post_service),
):
    return await post_service.update_post(
        post_id,
        title,
        content,
        category,
        post_image,
        current_user,
    )


@router.delete("/{post_id}", status_code=200)
async def delete_post(
    post_id: int,
    current_user: User = Depends(get_current_user),
    post_service: PostService = Depends(get_post_service),
):
    return await post_service.delete_post(
        post_id,
        current_user,
    )


@router.get("/{user_id}", status_code=200)
async def get_by_user_id(user_id: int, post_service: PostService = Depends(get_post_service)):
    return await post_service.get_by_user_id(user_id)