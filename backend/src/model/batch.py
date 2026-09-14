from sqlalchemy import Integer, String, Date
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.db.dbConfig import Base


class Batch(Base):
    __tablename__ = "batch"
    id:Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=False)
    name:Mapped[str] = mapped_column(String(100))
    start_date:Mapped[Date] = mapped_column(Date)
    end_date:Mapped[Date] = mapped_column(Date)

    student_masters:Mapped[list["Student_Master"]] = relationship("Student_Master", back_populates="batch", cascade="all, delete-orphan")