from app.Api.Telegram_Api.Bot import dp, bot, notification_about_events
from app.Api.submissions_handler import submissions_handler
import asyncio


async def main():
    asyncio.create_task(notification_about_events())
    asyncio.create_task(submissions_handler())
    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())
