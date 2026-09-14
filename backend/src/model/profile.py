from sqlalchemy import Integer, ForeignKey, Date, Enum, String, Text, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.db.dbConfig import Base

class Profile(Base):
    __tablename__ = "profile"
    user_id:Mapped[int] = mapped_column(Integer, ForeignKey("user.id"), primary_key=True)
    name:Mapped[str]= mapped_column(String(255), nullable=True)
    dob:Mapped[Date] = mapped_column(Date, nullable=True)
    gender:Mapped[str] = mapped_column(Enum("Male","Female", "Other", name="gender"), nullable=True)
    website_url1:Mapped[str] = mapped_column(String(255), nullable=True)
    website_url2:Mapped[str] = mapped_column(String(255), nullable=True)
    website_url3:Mapped[str] = mapped_column(String(255), nullable=True)
    about:Mapped[Text] = mapped_column(Text, nullable=True)
    updated_at: Mapped[DateTime] = mapped_column(DateTime, default=func.now(), nullable=True)

    user:Mapped["User"] = relationship("User", back_populates="profile")