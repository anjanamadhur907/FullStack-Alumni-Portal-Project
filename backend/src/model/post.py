from sqlalchemy import Integer, ForeignKey, Enum, String, Text, DateTime, Boolean, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.db.dbConfig import Base


class Post(Base):
    __tablename__ = "post"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("user.id"))
    category: Mapped[str] = mapped_column(Enum("General", "Event", "Announcement", name="category"), default="General")
    title: Mapped[str] = mapped_column(String(255))
    content: Mapped[Text] = mapped_column(Text, nullable=True)
    image: Mapped[str] = mapped_column(String(255), nullable=True)
    is_admin: Mapped[bool] = mapped_column(Boolean, default=False, nullable=True)
    updated_at: Mapped[DateTime] = mapped_column(DateTime, default=func.now(), nullable=True)

    user: Mapped["User"] = relationship("User", back_populates="posts")