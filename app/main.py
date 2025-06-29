from datetime import datetime

from app.Api.Telegram_Api.Bot import dp, bot

if __name__ == "__main__":
    dp.run_polling(bot)

# API_BASE = "http://52.87.161.100:8000/"
#
# now = datetime.now()
# print(now)
