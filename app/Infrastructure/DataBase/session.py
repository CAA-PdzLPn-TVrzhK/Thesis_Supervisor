# db/session.py

from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from app.config import DATABASE_URL

# создаём движок (echo=True для логов SQL)
engine = create_async_engine(DATABASE_URL, echo=True, future=True)

# фабрика сессий
AsyncSessionLocal = async_sessionmaker(bind=engine, expire_on_commit=False)


async def get_async_session() -> AsyncSession:
    """
    Асинхронный генератор: yield сессии и автоматически её закрывает после использования.
    Пример для Depends в FastAPI или вручную в async-функциях.
    """
    async with AsyncSessionLocal() as session:
        yield session
