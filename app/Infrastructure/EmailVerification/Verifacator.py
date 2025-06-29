# verification.py

from telegram import Update
from telegram.ext import (
    CommandHandler,
    MessageHandler,
    filters,
    ConversationHandler,
    CallbackContext,
)
import random, smtplib
from email.mime.text import MIMEText
import os

# ----- состояния разговора -----
ASK_EMAIL, ASK_CODE = range(2)

# временное хранилище: chat_id → { email, code }
pending = {}


def start_verify(update: Update, ctx: CallbackContext) -> int:
    update.message.reply_text("🏷 Введи, пожалуйста, свой e-mail для верификации:")
    return ASK_EMAIL


def receive_email(update: Update, ctx: CallbackContext) -> int:
    email = update.message.text.strip()
    code = str(random.randint(100000, 999999))
    chat_id = update.effective_chat.id
    pending[chat_id] = {"email": email, "code": code}

    # формируем и шлём письмо через Gmail SMTP
    msg = MIMEText(f"Твой код верификации: {code}")
    msg["Subject"] = "Код для верификации"
    msg["From"] = os.getenv("GMAIL_USER")
    msg["To"] = email

    try:
        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.starttls()
        server.login(os.getenv("GMAIL_USER"), os.getenv("GMAIL_APP_PASS"))
        server.send_message(msg)
    except Exception as e:
        update.message.reply_text(f"❌ Ошибка отправки: {e}")
    finally:
        server.quit()

    update.message.reply_text("✉ Код отправлен! Проверь почту и пришли его сюда:")
    return ASK_CODE


def receive_code(update: Update, ctx: CallbackContext) -> int:
    chat_id = update.effective_chat.id
    user_code = update.message.text.strip()
    data = pending.get(chat_id)

    if data and user_code == data["code"]:
        update.message.reply_text("✅ Отлично, верификация прошла!")
        # пометь в БД или памяти, что user верифицирован
        pending.pop(chat_id, None)
    else:
        update.message.reply_text("❌ Код не подошёл. Попробуй ещё раз или /cancel")
    return ConversationHandler.END


def cancel(update: Update, ctx: CallbackContext) -> int:
    pending.pop(update.effective_chat.id, None)
    update.message.reply_text("Верификацию отменили.")
    return ConversationHandler.END


# сам ConversationHandler, который надо добавить в диспатчер
verify_conv = ConversationHandler(
    entry_points=[CommandHandler("verify", start_verify)],
    states={
        ASK_EMAIL: [
            MessageHandler(filters.TEXT & ~filters.COMMAND, receive_email)
        ],  # Фильтры в верхнем регистре
        ASK_CODE: [
            MessageHandler(filters.TEXT & ~filters.COMMAND, receive_code)
        ],  # Фильтры в верхнем регистре
    },
    fallbacks=[CommandHandler("cancel", cancel)],
    allow_reentry=False,
)
