import os

from aiogram import Bot, Dispatcher
from aiogram.types import Message, ReplyKeyboardMarkup, KeyboardButton
from aiogram.filters import Command
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import StatesGroup, State
from aiogram.fsm.storage.memory import MemoryStorage
from app.Services.UserService import UserService
import random
import smtplib
from email.mime.text import MIMEText

pending_codes: dict[int, str] = {}

API_TOKEN = "7766131056:AAF70m3Omm0BeaXbRSOm_pzIQCtbPckzBCA"


bot = Bot(token=API_TOKEN)
dp = Dispatcher(storage=MemoryStorage())

class Form(StatesGroup):
    waiting_for_email = State()
    waiting_for_verification = State()
    waiting_for_password = State()

@dp.message(Command(commands=["start"]))
async def cmd_start(message: Message, state: FSMContext):
    await message.answer("Send your email for authorization")
    await state.set_state(Form.waiting_for_email)

@dp.message(Form.waiting_for_email)
async def process_email(message: Message, state: FSMContext):
    user_email = message.text.strip()
    user = await UserService.get_profile(message.chat.id)
    if user is None:
        user = await UserService.register_user(message.chat.id, message.chat.first_name + ' ' + message.chat.last_name, user_email, False)
    code = f"{random.randint(100000, 999999)}"
    pending_codes[message.chat.id] = code

    msg = MIMEText(f"Твой код верификации: {code}")
    msg["Subject"] = "Telegram-бот: код верификации"
    msg["From"] = "ThesisSupervisorVerificator@gmail.com"
    msg["To"] = user_email

    server = smtplib.SMTP("smtp.gmail.com", 587)
    server.starttls()
    server.login("ThesisSupervisorVerificator@gmail.com", "iymt gvrr bpko skas")
    server.send_message(msg)
    server.quit()

    await message.answer("Код отправлен на e-mail, введи его в ответном сообщении:")
    await state.set_state(Form.waiting_for_verification)

@dp.message(Form.waiting_for_verification)
async def process_verification(message: Message, state: FSMContext):
    chat_id = message.chat.id
    user_code = message.text.strip()

    if pending_codes.get(chat_id) == user_code:
        pending_codes.pop(chat_id, None)
        await state.clear()
        keyboard = ReplyKeyboardMarkup(
            keyboard=[[KeyboardButton(text="Submit work")]],
            resize_keyboard=True)
        await message.answer("You are logged in", reply_markup=keyboard)
    else:
        await message.answer("Неверный код, попробуй ещё раз.")
        await state.set_state(Form.waiting_for_verification)


if __name__ == "__main__":
    dp.run_polling(bot)
