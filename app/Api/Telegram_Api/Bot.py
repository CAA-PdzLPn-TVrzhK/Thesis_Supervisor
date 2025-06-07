import os
from aiogram import Bot, Dispatcher
from aiogram.types import Message, ReplyKeyboardMarkup, KeyboardButton
from aiogram.filters import Command
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import StatesGroup, State
from aiogram.fsm.storage.memory import MemoryStorage
from app.Services.UserService import UserService

API_TOKEN = "7766131056:AAF70m3Omm0BeaXbRSOm_pzIQCtbPckzBCA"

email_bd: set[str] = {
    "ars.laptev@innopolis.university",
    "d.khasanshin@innopolis.university",
    "ru.nasibullin@innopolis.university",
    "n.selezenev@innopolis.university",
    "t.kagarmanov@innopolis.university"
}

bot = Bot(token=API_TOKEN)
dp = Dispatcher(storage=MemoryStorage())

class Form(StatesGroup):
    waiting_for_text = State()

@dp.message(Command(commands=["start"]))
async def cmd_start(message: Message, state: FSMContext):
    await message.answer("Send your email for authorization")
    await state.set_state(Form.waiting_for_text)

@dp.message(Form.waiting_for_text)
async def process_next_message(message: Message, state: FSMContext):
    user_email = message.text
    if user_email in email_bd:
        keyboard = ReplyKeyboardMarkup(
            keyboard=[[KeyboardButton(text="Submit work"), KeyboardButton(text="Пойти нахуй")]],
            resize_keyboard=True
        )
        await message.answer(
            "You are logged in",
            reply_markup=keyboard
        )
    else:
        await message.answer("You are not allowed to send messages", reply_markup=ReplyKeyboardMarkup(keyboard=[]))
    await state.clear()

@dp.message()
async def handle_my_request(message: Message):
    if message.text == "Пойти нахуй":
        await message.answer("иди нахуй")
if __name__ == "__main__":
    dp.run_polling(bot)
