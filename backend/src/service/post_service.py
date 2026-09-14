from datetime import date
from pathlib import Path
import shutil

from fastapi import HTTPException, UploadFile
from sqlalchemy import select
from starlette import status

from src.exception.resource_not_found_exception import ResourceNotFoundException
from src.model import Post, User
from src.repository.post_repository import PostRepository
from src.repository.profile_repository import ProfileRepository
from src.repository.student_master_repository import StudentMasterRepository
from src.repository.user_repository import UserRepository
from src.schema.post_schema import PostResponse

BASE_DIR = Path(__file__).resolve().parent.parent


class PostService:
    def __init__(
        self,
        post_repo: PostRepository,
        user_repo: UserRepository,
        profile_repo: ProfileRepository,
        student_master_repo: StudentMasterRepository,
    ):
        self.post_repo = post_repo
        self.user_repo = user_repo
        self.profile_repo = profile_repo
        self.student_master_repo = student_master_repo

    def _get_role(self, current_user):
        if (
            getattr(current_user, "is_admin", False)
            or getattr(current_user, "role", None) == "Admin"
            or not hasattr(current_user, "student_master_id")
        ):
            return "Admin"

        student_master = getattr(current_user, "student_master", None)

        if student_master is None or getattr(student_master, "batch", None) is None:
            return "Student"

        return (
            "Alumni"
            if date.today() >= student_master.batch.end_date
            else "Student"
        )

    def _calculate_role(self, user):
        student_master = getattr(user, "student_master", None)

        if student_master is None or getattr(student_master, "batch", None) is None:
            return None

        return (
            "Alumni"
            if date.today() >= student_master.batch.end_date
            else "Student"
        )

    async def _get_user_info(self, user_id: int, is_admin_post: bool = False):
        if is_admin_post:
            return "Admin", "Administration"

        user = await self.user_repo.get_by_id(user_id)
        if not user:
            return "Admin", "Administration"

        profile = await self.profile_repo.get_profile_by_user_id(user_id)
        name = profile.name if profile and profile.name else (user.email.split("@")[0] if user.email else "User")
        batch = user.student_master.batch if user.student_master and user.student_master.batch else None
        batch_name = batch.name if batch else "Alumni"
        return name, batch_name

    async def create_post(
        self,
        title: str,
        content: str | None,
        category: str | None,
        post_image: UploadFile | None,
        current_user,
    ):
        is_admin = (
            getattr(current_user, "is_admin", False)
            or getattr(current_user, "role", None) == "Admin"
            or not hasattr(current_user, "student_master_id")
        )

        target_user_id = None
        if is_admin:
            # Query first valid user_id to satisfy database Foreign Key constraint
            stmt = select(User.id).limit(1)
            result = await self.user_repo.session.execute(stmt)
            first_uid = result.scalar_one_or_none()
            target_user_id = first_uid if first_uid is not None else 1
        else:
            role = self._get_role(current_user)
            if role != "Alumni":
                raise HTTPException(
                    status_code=403,
                    detail="Only alumni can create posts.",
                )
            target_user_id = current_user.id

        image_path = None
        if post_image and getattr(post_image, "filename", None):
            filepath = BASE_DIR.joinpath(
                "public",
                "images",
                post_image.filename,
            )
            filepath.parent.mkdir(parents=True, exist_ok=True)
            with open(filepath, "wb") as buffer:
                shutil.copyfileobj(post_image.file, buffer)

            await post_image.close()
            image_path = "/public/images/" + post_image.filename

        post = Post(
            user_id=target_user_id,
            category=category or "General",
            title=title,
            content=content,
            image=image_path,
            is_admin=is_admin,
        )

        created_post = await self.post_repo.create_post(post)

        user_name, user_batch = await self._get_user_info(created_post.user_id, is_admin_post=created_post.is_admin)

        return PostResponse(
            id=created_post.id,
            user_id=created_post.user_id,
            category=created_post.category,
            title=created_post.title,
            content=created_post.content,
            image=created_post.image,
            is_admin=bool(created_post.is_admin),
            updated_at=created_post.updated_at,
            user_name=user_name,
            user_batch=user_batch,
        )

    async def update_post(
        self,
        post_id: int,
        title: str,
        content: str | None,
        category: str | None,
        post_image: UploadFile | None,
        current_user,
    ):
        is_admin = (
            getattr(current_user, "is_admin", False)
            or getattr(current_user, "role", None) == "Admin"
            or not hasattr(current_user, "student_master_id")
        )

        post = await self.post_repo.get_post_by_id(post_id)
        if not post:
            raise ResourceNotFoundException(
                f"Post with id {post_id} not found."
            )

        if not is_admin:
            role = self._get_role(current_user)
            if role != "Alumni":
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Only alumni can update posts.",
                )
            if post.user_id != current_user.id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You can update only your own post.",
                )

        if post_image is not None and getattr(post_image, "filename", None):
            filepath = BASE_DIR.joinpath(
                "public",
                "images",
                post_image.filename,
            )
            filepath.parent.mkdir(parents=True, exist_ok=True)
            with open(filepath, "wb") as buffer:
                shutil.copyfileobj(post_image.file, buffer)

            await post_image.close()
            post.image = f"/public/images/{post_image.filename}"

        post.title = title
        post.content = content
        if category:
            post.category = category

        updated_post = await self.post_repo.update_post(post)
        user_name, user_batch = await self._get_user_info(updated_post.user_id, is_admin_post=updated_post.is_admin)

        return PostResponse(
            id=updated_post.id,
            user_id=updated_post.user_id,
            category=updated_post.category,
            title=updated_post.title,
            content=updated_post.content,
            image=updated_post.image,
            is_admin=bool(updated_post.is_admin),
            updated_at=updated_post.updated_at,
            user_name=user_name,
            user_batch=user_batch,
        )

    async def get_post_by_id(self, post_id: int):
        post = await self.post_repo.get_post_by_id(post_id)

        if not post:
            raise ResourceNotFoundException(
                f"Post with id {post_id} not found."
            )

        user_name, user_batch = await self._get_user_info(post.user_id, is_admin_post=getattr(post, "is_admin", False))

        return PostResponse(
            id=post.id,
            user_id=post.user_id,
            category=post.category,
            title=post.title,
            content=post.content,
            image=post.image,
            is_admin=bool(getattr(post, "is_admin", False)),
            updated_at=post.updated_at,
            user_name=user_name,
            user_batch=user_batch,
        )

    async def get_all_posts(self):
        posts = await self.post_repo.get_all_posts()

        result = []
        for post in posts:
            user_name, user_batch = await self._get_user_info(post.user_id, is_admin_post=getattr(post, "is_admin", False))
            result.append(
                PostResponse(
                    id=post.id,
                    user_id=post.user_id,
                    category=post.category,
                    title=post.title,
                    content=post.content,
                    image=post.image,
                    is_admin=bool(getattr(post, "is_admin", False)),
                    updated_at=post.updated_at,
                    user_name=user_name,
                    user_batch=user_batch,
                )
            )
        return result

    async def get_posts_by_category(self, category: str):
        posts = await self.post_repo.get_posts_by_category(category)

        result = []
        for post in posts:
            user_name, user_batch = await self._get_user_info(post.user_id, is_admin_post=getattr(post, "is_admin", False))
            result.append(
                PostResponse(
                    id=post.id,
                    user_id=post.user_id,
                    category=post.category,
                    title=post.title,
                    content=post.content,
                    image=post.image,
                    is_admin=bool(getattr(post, "is_admin", False)),
                    updated_at=post.updated_at,
                    user_name=user_name,
                    user_batch=user_batch,
                )
            )
        return result

    async def delete_post(
        self,
        post_id: int,
        current_user,
    ):
        is_admin = (
            getattr(current_user, "is_admin", False)
            or getattr(current_user, "role", None) == "Admin"
            or not hasattr(current_user, "student_master_id")
        )

        post = await self.post_repo.get_post_by_id(post_id)
        if not post:
            raise ResourceNotFoundException(
                f"Post with id {post_id} not found."
            )

        if not is_admin:
            role = self._get_role(current_user)
            if role != "Alumni":
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Only alumni can delete posts.",
                )
            if post.user_id != current_user.id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You can delete only your own posts.",
                )

        await self.post_repo.delete_post(post)

        return {
            "message": "Post deleted successfully."
        }

    async def get_by_user_id(self, user_id: int):
        user = await self.user_repo.get_by_id(user_id)
        if not user:
            raise ResourceNotFoundException(f"User with id {user_id} not found.")

        posts = await self.post_repo.get_by_user_id(user_id)

        profile = await self.profile_repo.get_profile_by_user_id(user_id)
        user_name = profile.name if profile and profile.name else "User"
        batch = user.student_master.batch if user.student_master and user.student_master.batch else None
        user_batch = batch.name if batch else "Alumni"

        return [
            PostResponse(
                id=post.id,
                user_id=post.user_id,
                category=post.category,
                title=post.title,
                content=post.content,
                image=post.image,
                is_admin=bool(getattr(post, "is_admin", False)),
                updated_at=post.updated_at,
                user_name=user_name,
                user_batch=user_batch,
            )
            for post in posts
        ]