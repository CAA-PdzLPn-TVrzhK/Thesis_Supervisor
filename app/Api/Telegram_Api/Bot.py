import os
from aiogram import Bot, Dispatcher, types, F
from aiogram.types import Message, WebAppInfo, ReplyKeyboardMarkup, KeyboardButton, ContentType, ReplyKeyboardRemove
from aiogram.filters import Command
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import StatesGroup, State
from aiogram.fsm.storage.memory import MemoryStorage
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, EmailStr
from uuid import uuid4
from datetime import datetime, timezone
import httpx
from app.Services.UserService import UserService
import random
import smtplib
from email.mime.text import MIMEText

appl = FastAPI()

load_dotenv()
API_TOKEN = "7766131056:AAF70m3Omm0BeaXbRSOm_pzIQCtbPckzBCA"
BASE_WEBAPP_URL = "https://caa-pdzlpn-tvrzhk.github.io/Thesis_Supervisor/app/Client/index.html"
EXTERNAL_API_URL  = "http://52.87.161.100:8000/docs#/"

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
    await message.answer("Send your email for authorization", reply_markup=ReplyKeyboardRemove())
    await state.set_state(Form.waiting_for_email)

@dp.message(Form.waiting_for_email)
async def process_email(message: Message, state: FSMContext):
    user_email = message.text.strip()
    user = await UserService.get_profile(message.chat.id)
    if user is None:
        user = await UserService.register_user(message.chat.id, "@" + message.from_user.username, user_email, False)
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

    await message.answer("The code has been sent by e-mail, enter it in the reply message:", reply_markup=ReplyKeyboardRemove())
    await state.set_state(Form.waiting_for_verification)

@dp.message(Form.waiting_for_verification)
async def process_verification(message: Message, state: FSMContext):
    chat_id = message.chat.id
    user_code = message.text.strip()
    user = await UserService.get_profile(message.chat.id)
    if pending_codes.get(chat_id) == user_code:
        pending_codes.pop(chat_id, None)
        await state.clear()
        payload = {
          "user_id": str(message.from_user.id),
          "supervisor_id": str(0),
          "program": "DSAI",
          "year": 0,
          "thesis_id": "string",
          "peer_group_id": "string",
          "points": 0,
          "progress": 0
        }
        UserCreate(**payload)
        async with httpx.AsyncClient() as client:
            resp = await client.post(EXTERNAL_API_URL, json=payload)
            if resp.status_code != 201:
                await message.answer(
                    f"❌ Не удалось зарегистрировать профиль: {resp.text}"
                )
                return

        web_app = WebAppInfo(url=BASE_WEBAPP_URL)
        keyboard = ReplyKeyboardMarkup(
            keyboard=[
                [KeyboardButton(text="Open the student's portal", web_app=web_app)]
            ],
            resize_keyboard=True,
            one_time_keyboard=True
        )
        supervisor_keyboard = ReplyKeyboardMarkup(
            keyboard=[[KeyboardButton(text="View dashboard")]],
            resize_keyboard=True
        )
        if user.status == 0:
            await message.answer("🔗 Open the student's mini-app:", reply_markup=keyboard)
        elif user.status == 1:
            await message.answer("You are logged in", reply_markup=supervisor_keyboard)
        else:
            await message.answer("Invalid code, try again.", reply_markup=ReplyKeyboardRemove())
            await state.set_state(Form.waiting_for_verification)


@dp.message(F.content_type == ContentType.WEB_APP_DATA)
async def handle_webapp_data(message: types.Message):
    data = message.web_app_data.data
    await message.answer("✅ Данные получены из мини-приложения", reply_markup=ReplyKeyboardRemove())

class UserCreate(BaseModel):
    user_id: str
    supervisor_id: str
    program: str
    year: int
    thesis_id: str
    peer_group_id: str
    points: int
    progress: int



@appl.post("/students", response_model=UserCreate)
async def reg_user(user: UserCreate):
    payload = user
    async with httpx.AsyncClient() as client:
        response = await client.post(EXTERNAL_API_URL, json=payload)
        if response.status_code != 201:
            raise HTTPException(
                status_code=502,
                detail=f"Ошибка при создании пользователя в внешнем API: {response.text}"
            )
        created = response.json()

    return created