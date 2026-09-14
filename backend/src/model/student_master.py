from sqlalchemy import Integer, String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.db.dbConfig import Base


class Student_Master(Base):
    __tablename__ = "student_master"
    id:Mapped[int] = mapped_column(Integer, primary_key=True)
    card_id:Mapped[str] = mapped_column(String(20), unique=True)
    name:Mapped[str] = mapped_column(String(100))
    batch_id:Mapped[int] = mapped_column(ForeignKey("batch.id"))

    batch:Mapped["Batch"] = relationship("Batch", back_populates="student_masters")

    user:Mapped["User"] = relationship("User", back_populates="student_master", uselist=False, cascade="all, delete-orphan")