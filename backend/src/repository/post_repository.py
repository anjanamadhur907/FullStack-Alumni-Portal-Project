from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.model import Post


class PostRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create_post(self, post: Post):
        self.session.add(post)
        await self.session.flush()
        await self.session.refresh(post)
        return post

    async def get_post_by_id(self, post_id: int):
        result = await self.session.execute(
            select(Post).where(Post.id == post_id)
        )
        return result.scalar_one_or_none()

    async def get_all_posts(self):
        result = await self.session.execute(
            select(Post).order_by(Post.updated_at.desc())
        )
        return result.scalars().all()

    async def get_posts_by_category(self, category: str):
        result = await self.session.execute(
            select(Post)
            .where(Post.category == category)
            .order_by(Post.updated_at.desc())
        )
        return result.scalars().all()

    async def get_posts_by_user_id(self, user_id: int):
        result = await self.session.execute(
            select(Post)
            .where(Post.user_id == user_id)
            .order_by(Post.updated_at.desc())
        )
        return result.scalars().all()

    async def update_post(self, post: Post):
        await self.session.flush()
        await self.session.refresh(post)
        return post

    async def delete_post(self, post: Post):
        await self.session.delete(post)
        await self.session.flush()

    async def get_by_user_id(self, user_id:int):
        stmt = select(Post).where(Post.user_id == user_id)
        result = await self.session.execute(stmt)
        return result.scalars().all()