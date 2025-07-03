# db/init_db.py

# Этот файл компилим только если хотим пересоздать БД,
# в других случаях не трогаем

import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from app.Infrastructure.DataBase.Base import Base
from app.config import DATABASE_URL

# ОБЯЗАТЕЛЬНЫЙ импорт моделей, чтобы они зарегистрировались в Base
from app.Infrastructure.DataBase.Models.user import User  # noqa: F401


async def init_db():
    engine = create_async_engine(DATABASE_URL, echo=True)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


if __name__ == "__main__":
    asyncio.run(init_db())
    print("Done")
