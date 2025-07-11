from app.Api.Telegram_Api.Bot import dp, bot, notification_about_events
import asyncio


async def main():
    asyncio.create_task(notification_about_events())
    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())
