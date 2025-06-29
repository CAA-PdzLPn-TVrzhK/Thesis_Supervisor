import os
import random
import smtplib
import requests
from email.mime.text import MIMEText

from aiogram import Bot, Dispatcher, F, types
from aiogram.types import (
    Message,
    WebAppInfo,
    ReplyKeyboardMarkup,
    KeyboardButton,
    ContentType,
    ReplyKeyboardRemove,
)
from aiogram.filters import Command
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup
from aiogram.fsm.storage.memory import MemoryStorage
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

API_TOKEN = "7766131056:AAF70m3Omm0BeaXbRSOm_pzIQCtbPckzBCA"
BASE_WEBAPP_URL = "https://thesis-supervisor.pages.dev"
EXTERNAL_API_URL = "http://52.87.161.100:8000/"

headers = {
    "apikey": (
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6"
        "ImRwcnd1cGJ6YXRycW1xcGR3Y2dxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExODQ3"
        "NzcsImV4cCI6MjA2Njc2MDc3N30.yl_E-xLFHTtkm_kx6bOkPenMG7IZx588-jamWhpg3Lc"
    )
}

bot = Bot(token=API_TOKEN)
dp = Dispatcher(storage=MemoryStorage())

pending_codes: dict[int, str] = {}


class Form(StatesGroup):
    waiting_for_email = State()
    waiting_for_verification = State()
    waiting_for_password = State()
    waiting_for_the_work = State()


@dp.message(Command(commands=["start"]))
async def cmd_start(message: Message, state: FSMContext):
    resp = requests.get(f"{EXTERNAL_API_URL}users/telegram/{message.from_user.id}")
    if resp.status_code == 200:
        web_app = WebAppInfo(url=BASE_WEBAPP_URL)
        keyboard = ReplyKeyboardMarkup(
            keyboard=[
                [KeyboardButton(text="Log in to the portal", web_app=web_app)],
                [KeyboardButton(text="Change email")],
            ],
            resize_keyboard=True,
            one_time_keyboard=True,
        )
        await message.answer(
            "You already have an account with our service, and you can either log in to your account or log in with your new email.",
            reply_markup=keyboard,
        )
    else:
        await message.answer("Send your email for authorization", reply_markup=ReplyKeyboardRemove())
        await state.set_state(Form.waiting_for_email)


@dp.message(F.text == "Change email")
async def cmd_email(message: Message, state: FSMContext):
    user_resp = requests.get(f"{EXTERNAL_API_URL}users/telegram/{message.from_user.id}")
    if user_resp.status_code == 200:
        user_id = user_resp.json()["_id"]
        delete_resp = requests.delete(f"{EXTERNAL_API_URL}users/{user_id}")
        if delete_resp.status_code == 204:
            await message.answer("Send your Innopolis University email for authorization", reply_markup=ReplyKeyboardRemove())
            await state.set_state(Form.waiting_for_email)
            return

    await message.answer("Nothing was found in the database using your ID, click /start to restart the bot", reply_markup=ReplyKeyboardRemove())
    await state.clear()


@dp.message(Form.waiting_for_email)
async def process_email(message: Message, state: FSMContext):
    user_email = message.text.strip()
    if user_email.endswith("@innopolis.university"):
        code = f"{random.randint(100000, 999999)}"
        pending_codes[message.chat.id] = code

        msg = MIMEText(f"Your verification code: {code}")
        msg["Subject"] = "Telegram bot: verification code"
        msg["From"] = "markdajver@gmail.com"
        msg["To"] = user_email

        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.starttls()
        server.login("markdajver@gmail.com", "jaaf lawy rtpi glpr")
        server.send_message(msg)
        server.quit()

        await state.update_data(user_email=user_email)
        await message.answer("The code has been sent by e-mail, enter it in the reply message:", reply_markup=ReplyKeyboardRemove())
        await state.set_state(Form.waiting_for_verification)
    else:
        await message.answer("Please send an Innopolis University email")
        await state.set_state(Form.waiting_for_email)


@dp.message(Form.waiting_for_verification)
async def process_verification(message: Message, state: FSMContext):
    chat_id = message.chat.id
    user_code = message.text.strip()
    if pending_codes.get(chat_id) == user_code:
        pending_codes.pop(chat_id, None)
        data = await state.get_data()
        user_email = data.get("user_email")
        await state.clear()

        answer = requests.get(f"{EXTERNAL_API_URL}supervisors/{chat_id}")
        if answer.status_code == 404:
            user_payload = {
                "telegram_id": str(chat_id),
                "username": str(message.from_user.username),
                "first_name": str(message.from_user.first_name) or " ",
                "last_name": str(message.from_user.last_name) or " ",
                "role": "student",
                "department": "educ",
                "email": str(user_email),
            }
            headers_json = {"Content-Type": "application/json"}
            requests.post(f"{EXTERNAL_API_URL}users/", json=user_payload, headers=headers_json)

            student_payload = {
                "user_id": str(message.from_user.id),
                "supervisor_id": "Shilov",
                "program": "DSAI",
                "department": "string",
                "year": 0,
                "thesis_id": "string",
                "peer_group_id": "string",
                "points": 0,
                "progress": 0,
            }
            requests.post(f"{EXTERNAL_API_URL}students/", json=student_payload, headers=headers_json)

        webapp_url = f"{BASE_WEBAPP_URL}?user_id={chat_id}"
        web_app = WebAppInfo(url=webapp_url)
        keyboard = ReplyKeyboardMarkup(
            keyboard=[[KeyboardButton(text="Open the student's portal", web_app=web_app)]],
            resize_keyboard=True,
            one_time_keyboard=True,
        )
        await message.answer("🔗 Open the student's mini-app:", reply_markup=keyboard)
    else:
        await message.answer("Incorrect code, please try again.", reply_markup=ReplyKeyboardRemove())
        await state.set_state(Form.waiting_for_verification)


@dp.message(F.content_type == ContentType.WEB_APP_DATA)
async def handle_webapp_data(message: types.Message):
    data = message.web_app_data.data
    await message.answer("✅ Данные получены из мини-приложения", reply_markup=ReplyKeyboardRemove())
