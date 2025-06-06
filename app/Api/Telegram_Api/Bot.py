import os
from aiogram import Bot, Dispatcher
from aiogram.types import Message
from aiogram.filters import Command
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import StatesGroup, State

API_TOKEN = "7766131056:AAF70m3Omm0BeaXbRSOm_pzIQCtbPckzBCA"

email_bd: set[str] = set()
email_bd.add("ars.laptev@innopolis.university")
email_bd.add("d.khasanshin@innopolis.university")

bot = Bot(token=API_TOKEN)
dp = Dispatcher()

class Form(StatesGroup):
    waiting_for_text = State()

@dp.message(Command(commands=["start"]))
async def cmd_start(message: Message, state: FSMContext):
    await message.answer("Send your email for authorization")
    await state.set_state(Form.waiting_for_text)

@dp.message(Form.waiting_for_text)
async def process_next_message(message: Message, state: FSMContext):
    user_email = message.text
    if user_email in
    await bot.send_message(message.from_user.id, f"{user_text}")
    await state.clear()

if __name__ == "__main__":
    dp.run_polling(bot)
