# models/user.py

from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import Integer, String
from app.Infrastructure.DataBase.Base import Base

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, unique=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    password: Mapped[str] = mapped_column(String(255), nullable=False)

    def __repr__(self):
        return f"<User id={self.id} name={self.name} email={self.email} password={self.password}>"