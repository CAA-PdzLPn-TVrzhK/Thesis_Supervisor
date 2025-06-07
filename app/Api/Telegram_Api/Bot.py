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
    waiting_for_email = State()
    waiting_for_password = State()

@dp.message(Command(commands=["start"]))
async def cmd_start(message: Message, state: FSMContext):
    await message.answer("Send your email for authorization")
    await state.set_state(Form.waiting_for_email)

@dp.message(Form.waiting_for_email)
async def process_next_message(message: Message, state: FSMContext):
    user_email = message.text
    await bot.send_message(message.chat.id, text=f"{message.chat.id}")
    user = await UserService.get_profile(message.chat.id)
    if user is None:
        await bot.send_message(message.chat.id, text="Пашол нахуй ноунейм")
        await state.clear()
    elif user.email == user_email:
        await state.clear()
        await bot.send_message(message.chat.id, text="Send password")
        await state.set_state(Form.waiting_for_password)
    else:
        await state.clear()
        await bot.send_message(message.chat.id, text="Wrong email, please try another one")
        await state.set_state(Form.waiting_for_email)


@dp.message(Form.waiting_for_password)
async def process_next_message(message: Message, state: FSMContext):
    user_password = message.text
    user = await UserService.get_profile(message.chat.id)
    if user.password == user_password:
        await state.clear()
        keyboard = ReplyKeyboardMarkup(
               keyboard=[[KeyboardButton(text="Submit work"), KeyboardButton(text="Пойти нахуй")]],
                 resize_keyboard=True)
        await message.answer("You are logged in",reply_markup=keyboard)
    else:
        await state.clear()
        await bot.send_message(message.chat.id, text="Wrong password")
        await state.set_state(Form.waiting_for_password)

if __name__ == "__main__":
    dp.run_polling(bot)
