import os
from aiogram import Bot, Dispatcher, types, F
from aiogram.types import Message, WebAppInfo, ReplyKeyboardMarkup, KeyboardButton, ContentType, ReplyKeyboardRemove
from aiogram.filters import Command
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import StatesGroup, State
from aiogram.fsm.storage.memory import MemoryStorage
from aiogram.utils import keyboard
from dotenv import load_dotenv
import requests
import random
import smtplib
from email.mime.text import MIMEText


load_dotenv()
API_TOKEN = "7766131056:AAF70m3Omm0BeaXbRSOm_pzIQCtbPckzBCA"
BASE_WEBAPP_URL = "https://thesis-supervisor.pages.dev"
EXTERNAL_API_URL  = "https://dprwupbzatrqmqpdwcgq.supabase.co"
headers = {
    "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwcnd1cGJ6YXRycW1xcGR3Y2dxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExODQ3NzcsImV4cCI6MjA2Njc2MDc3N30.yl_E-xLFHTtkm_kx6bOkPenMG7IZx588-jamWhpg3Lc",
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
    resp = requests.get(f"http://52.87.161.100:8000/users/telegram/{message.from_user.id}")
    if resp.status_code == 200:
        # webapp_url = f"{BASE_WEBAPP_URL}?user_id={message.from_user.id}"
        web_app = types.WebAppInfo(url=BASE_WEBAPP_URL)
        keyboard = ReplyKeyboardMarkup(
            keyboard=[
                [KeyboardButton(text="Log in to the portal", web_app=web_app)],
                [KeyboardButton(text="Change email")],
            ],
            resize_keyboard=True,
            one_time_keyboard=True
        )
        await message.answer("You already have an account with our service, and you can either log in to your account or log in with your new email.", reply_markup=keyboard)
    else:
        await message.answer(f"Send your email for authorization", reply_markup=ReplyKeyboardRemove())
        await state.set_state(Form.waiting_for_email)

@dp.message(F.text == "Change email")
async def cmd_email(message: Message, state: FSMContext):
    resp = requests.delete(
        EXTERNAL_API_URL + "users/" + str(requests.get(EXTERNAL_API_URL + "users/telegram/" + str(message.from_user.id)).json()["_id"]), headers = headers)
    if resp.status_code == 204:
        await message.answer("Send your Innopolis University email for authorization", reply_markup=ReplyKeyboardRemove())
        await state.set_state(Form.waiting_for_email)
    else:
        await message.answer("Nothing was found in the database using your ID, click /start to restart the bot", reply_markup=ReplyKeyboardRemove())
        await state.clear()

@dp.message(Form.waiting_for_email)
async def process_email(message: Message, state: FSMContext):
    user_email = message.text.strip()
    if user_email.endswith("@innopolis.university"):
    # user = await UserService.get_profile(message.chat.id)
    # if user is None:
    #     user = await UserService.register_user(message.chat.id, "@" + message.from_user.username, user_email, False)
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
        answer = requests.get(EXTERNAL_API_URL + "supervisors/" + str(chat_id))
        if answer.status_code == 404:
            payload = {
                "telegram_id": str(chat_id),
                "username": str(message.from_user.username),
                "first_name": str(message.from_user.first_name) or " ",
                "last_name": str(message.from_user.last_name) or " ",
                "role": "student",
                "department": "educ",
                "email": str(user_email)
            }
            headers = {
                "Content-Type": "application/json"
            }
            requests.post(EXTERNAL_API_URL + "users/", json=payload, headers=headers)
            payload = {
              "user_id": str(message.from_user.id),
              "supervisor_id": "Shilov",
              "program": "DSAI",
              "department": "string",
              "year": 0,
              "thesis_id": "string",
              "peer_group_id": "string",
              "points": 0,
              "progress": 0
            }
            headers = {
                "Content-Type": "application/json"
            }
            requests.post(EXTERNAL_API_URL+"students/", json=payload, headers=headers)
            # if response2.status_code == 201:
            #     print("Студент успешно создан!")
            #     print("Ответ сервера:", response2.json())
            # else:
            #     print(f"Ошибка: статус {response2.status_code}")
            #     print("Текст ответа:", response2.text)
            webapp_url = f"{BASE_WEBAPP_URL}?user_id={chat_id}"
            web_app = types.WebAppInfo(url=webapp_url)
            keyboard = ReplyKeyboardMarkup(
                keyboard=[
                    [KeyboardButton(text="Open the student's portal", web_app=web_app)]
                ],
                resize_keyboard=True,
                one_time_keyboard=True
            )
        await message.answer("🔗 Open the student's mini-app:", reply_markup=keyboard)
    else:
        await state.set_state(Form.waiting_for_verification)
        await message.answer("Incorrect code, please try again.", reply_markup=ReplyKeyboardRemove())

@dp.message(F.content_type == ContentType.WEB_APP_DATA)
async def handle_webapp_data(message: types.Message):
    data = message.web_app_data.data
    await message.answer("✅ Данные получены из мини-приложения", reply_markup=ReplyKeyboardRemove())
