from datetime import datetime
from typing import Optional, Literal

from pydantic import BaseModel, Field


class PostCreate(BaseModel):
    category: Literal["General", "Event", "Announcement"] = "General"
    title: str = Field(..., min_length=1, max_length=255)
    content: Optional[str] = None
    image: Optional[str] = None


class PostUpdate(BaseModel):
    category: Optional[Literal["General", "Event", "Announcement"]] = None
    title: Optional[str] = Field(default=None, min_length=1, max_length=255)
    content: Optional[str] = None
    image: Optional[str] = None


class PostResponse(BaseModel):
    id: int
    user_id: int
    category: str
    title: str
    content: Optional[str] = None
    image: Optional[str] = None
    is_admin: Optional[bool] = False
    updated_at: Optional[datetime] = None
    user_name: Optional[str] = None
    user_batch: Optional[str] = None
