from sqlalchemy import Integer, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.db.dbConfig import Base


class User(Base):
    __tablename__ = "user"
    id:Mapped[int] = mapped_column(Integer, primary_key=True)
    student_master_id:Mapped[int] = mapped_column(ForeignKey("student_master.id"), unique=True)
    email:Mapped[str] = mapped_column(String(100), unique=True)
    mobile:Mapped[str] = mapped_column(String(15), unique=True, nullable=True)
    password:Mapped[str] = mapped_column(String(100))

    student_master:Mapped["Student_Master"] = relationship("Student_Master", back_populates="user")

    profile:Mapped["Profile"] = relationship("Profile", back_populates="user", uselist=False, cascade="all, delete-orphan")

    posts:Mapped[list["Post"]] = relationship("Post", back_populates="user", cascade="all, delete-orphan")