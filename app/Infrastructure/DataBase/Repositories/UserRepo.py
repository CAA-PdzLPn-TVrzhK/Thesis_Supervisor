# repositories/UserRepo.py

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, insert, update, delete
from app.Infrastructure.DataBase.Models.user import User

class UserRepo:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_id(self, user_id: int) -> User | None:
        stmt = select(User).where(User.id == user_id)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_email(self, email: str) -> User | None:
        stmt = select(User).where(User.email == email)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def create(self,id: int, name: str, email: str, password: str, status: bool) -> User:
        new_user = User(id=id, name=name, email=email, password=password, status=status)
        self.session.add(new_user)
        await self.session.commit()
        await self.session.refresh(new_user)
        return new_user

    async def update_name(self, user_id: int, new_name: str) -> User | None:
        stmt = select(User).where(User.id == user_id)
        res = await self.session.execute(stmt)
        user = res.scalar_one_or_none()
        if not user:
            return None

        user.name = new_name
        await self.session.commit()
        await self.session.refresh(user)
        return user

    async def delete(self, user_id: int) -> bool:
        stmt = select(User).where(User.id == user_id)
        res = await self.session.execute(stmt)
        user = res.scalar_one_or_none()
        if not user:
            return False

        await self.session.delete(user)
        await self.session.commit()
        return True

    async def change_status(self, user_id: int, new_status: bool) -> bool:
        stmt = select(User).where(User.id == user_id)
        res = await self.session.execute(stmt)
        user = res.scalar_one_or_none()
        if not user:
            return

        user.status = new_status
        await self.session.commit()
        await self.session.refresh(user)
