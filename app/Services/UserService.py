# services/UserService.py

from app.Infrastructure.DataBase.Repositories.UserRepo import UserRepo
from app.Infrastructure.DataBase.session import get_async_session
from app.Infrastructure.DataBase.Models.user import User

class UserService:
    """
    Тут вся логика, связанная с пользователями:
    - валидация
    - проверка дубликатов
    - комбинирование с другими репозиториями и т.д.
    """

    @staticmethod
    async def register_user(id: int, name: str, email: str, password: str) -> User | None:
        # Получаем сессию
        async for session in get_async_session():
            repo = UserRepo(session)

            # Проверим, нет ли уже такого email
            exists = await repo.get_by_email(email)
            if exists:
                return None  # например, возвращаем None, если пользователь уже есть

            # Создадим нового
            user = await repo.create(id=id, name=name, email=email, password=password)
            return user

    @staticmethod
    async def get_profile(id: int) -> User | None:
        async for session in get_async_session():
            repo = UserRepo(session)
            return await repo.get_by_id(id)

    @staticmethod
    async def delete_profile(id: int) -> bool:
        async for session in get_async_session():
            repo = UserRepo(session)
            return await repo.delete(id)
