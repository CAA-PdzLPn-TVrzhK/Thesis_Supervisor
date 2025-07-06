import asyncio
import random
import smtplib
import datetime
import requests
from email_validator import validate_email, EmailNotValidError
from email.mime.text import MIMEText
from aiogram import Bot, Dispatcher, F, types
from aiogram.types import (
    Message,
    WebAppInfo,
    ReplyKeyboardMarkup,
    KeyboardButton,
    ReplyKeyboardRemove,
)
from aiogram.filters import Command
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup
from aiogram.fsm.storage.memory import MemoryStorage
from dotenv import load_dotenv

load_dotenv()

API_TOKEN = "7766131056:AAF70m3Omm0BeaXbRSOm_pzIQCtbPckzBCA"
BASE_WEBAPP_URL = "https://thesis-supervisor.netlify.app/"
EXTERNAL_API_URL = "https://dprwupbzatrqmqpdwcgq.supabase.co/rest/v1/"

headers = {
    "apikey": (
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6"
        "ImRwcnd1cGJ6YXRycW1xcGR3Y2dxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExODQ3"
        "NzcsImV4cCI6MjA2Njc2MDc3N30."
        "yl_E-xLFHTtkm_kx6bOkPenMG7IZx588-jamWhpg3Lc"
    ),
    "Content-Type": "application/json",
    "Prefer": "return=representation"
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
    user_id = message.from_user.id
    resp = requests.get(f"{EXTERNAL_API_URL}users?telegram_id=eq.{user_id}", headers=headers)
    if len(resp.json()) != 0:
        webapp_url = f"{BASE_WEBAPP_URL}?user_id={message.from_user.id}"
        web_app = WebAppInfo(url=webapp_url)
        keyboard = ReplyKeyboardMarkup(
            keyboard=[
                [KeyboardButton(text="Log in to the portal", web_app=web_app)],
                [KeyboardButton(text="Change email")],
            ],
            resize_keyboard=True,
            one_time_keyboard=True,
        )
        await message.answer(
            "You already have an account with our service, and you can "
            "either log in to your account or log in with your new email.",
            reply_markup=keyboard,
        )
    else:
        await message.answer(
            "Send your Innopolis University email for authorization",
            reply_markup=ReplyKeyboardRemove()
        )
        await state.set_state(Form.waiting_for_email)


@dp.message(F.text == "Change email")
async def cmd_email(message: Message, state: FSMContext):
    user_id = message.from_user.id
    user_resp = requests.get(f"{EXTERNAL_API_URL}users?telegram_id=eq.{user_id}", headers=headers)
    if len(user_resp.json()) != 0:
        db_id = user_resp.json()[0]["id"]
        await message.answer(
            "Send your Innopolis University email for authorization",
            reply_markup=ReplyKeyboardRemove(),
        )
        await state.set_state(Form.waiting_for_email)
    else:
        await message.answer(
            "Nothing was found in the database using your ID, "
            "click /start to restart the bot",
            reply_markup=ReplyKeyboardRemove(),
        )
        await state.clear()


@dp.message(Form.waiting_for_email)
async def process_email(message: Message, state: FSMContext):
    user_email = message.text.strip()
    if user_email.endswith("@innopolis.university"):
        # try:
        #     v = validate_email(user_email, check_deliverability=True)
        # except EmailNotValidError as e:
        #     await message.answer(
        #         "This email does not exist, please send a valid email."
        #     )
        #     await state.set_state(Form.waiting_for_email)
        #     return

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
        await message.answer(
            "The code has been sent by e-mail, "
            "enter it in the reply message:",
            reply_markup=ReplyKeyboardRemove(),
        )
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
        user_resp = requests.get(f"{EXTERNAL_API_URL}users?telegram_id=eq.{message.from_user.id}", headers=headers)
        if len(user_resp.json()) != 0:
            db_id = user_resp.json()[0]["id"]
            data = {
                "email": str(user_email)
            }
            requests.patch(f"{EXTERNAL_API_URL}users?id=eq.{db_id}", json=data, headers=headers)
        answer = requests.get(f"{EXTERNAL_API_URL}supervisors?user_id=eq.{message.from_user.id}", headers=headers)
        if answer.status_code == 400:
            user_payload = {
                "telegram_id": str(chat_id),
                "username": str(message.from_user.username),
                "first_name": str(message.from_user.first_name) or " ",
                "last_name": str(message.from_user.last_name) or " ",
                "role": "student",
                "department": "educ",
                "email": str(user_email)
            }
            user_req = requests.post(
                f"{EXTERNAL_API_URL}users",
                json=user_payload,
                headers=headers
            )
            db_id = user_req.json()[0]["id"]
            student_payload = {
                "user_id": db_id
            }
            requests.post(
                f"{EXTERNAL_API_URL}students",
                json=student_payload,
                headers=headers
            )

        webapp_url = f"{BASE_WEBAPP_URL}?user_id={chat_id}"
        web_app = WebAppInfo(url=webapp_url)
        keyboard = ReplyKeyboardMarkup(
            keyboard=[
                [
                    KeyboardButton(
                        text="Open the student's portal", web_app=web_app
                    )
                ]
            ],
            resize_keyboard=True,
            one_time_keyboard=True,
        )
        await message.answer(
            "🔗 Open the student's mini-app:", reply_markup=keyboard
        )
    else:
        await message.answer(
            "Incorrect code, please try again.",
            reply_markup=ReplyKeyboardRemove()
        )
        await state.set_state(Form.waiting_for_verification)


async def notification_about_deadline():
    while True:
        resp = requests.get(f"{EXTERNAL_API_URL}milestones", headers=headers)
        milestones = resp.json()
        now = datetime.datetime.now(datetime.timezone.utc)

        for m in milestones:
            deadline = (
                datetime.datetime.fromisoformat(m["deadline"].rstrip("Z"))
                .replace(tzinfo=datetime.timezone.utc)
            )
            delta = deadline - now

            if m["status"] != "in process" or m["notified"] == "all_notified":
                continue

            schedule = [
                (datetime.timedelta(days=7),   "in_7_days",    "in_3_days",    "7 days"),
                (datetime.timedelta(days=3),   "in_3_days",    "in_1_day",     "3 days"),
                (datetime.timedelta(days=1),   "in_1_day",     "in_12_hours",  "1 day"),
                (datetime.timedelta(hours=12), "in_12_hours",  "in_1_hour",    "12 hours"),
                (datetime.timedelta(hours=1),  "in_1_hour",    "deadline",     "1 hour"),
            ]

            for threshold, need_state, next_state, label in schedule:
                if delta > datetime.timedelta(0) and delta <= threshold and m["notified"] == need_state:
                    theses = requests.get(
                        f"{EXTERNAL_API_URL}theses", headers=headers
                    ).json()
                    for thesis in theses:
                        try:
                            student = requests.get(
                                f"{EXTERNAL_API_URL}students?id=eq.{thesis['student_id']}",
                                headers=headers
                            ).json()[0]
                            user = requests.get(
                                f"{EXTERNAL_API_URL}users?id=eq.{student['user_id']}",
                                headers=headers
                            ).json()[0]
                            await bot.send_message(
                                chat_id=user["telegram_id"],
                                parse_mode="HTML",
                                text=(
                                    f"❗️<b>Notification about deadline</b>❗️\n\n"
                                    f"<b>Thesis title:</b> {thesis['title']}\n\n"
                                    f"<b>Step:</b> {m['title']}\n\n"
                                    f"<b>Description:</b> {m['description']}\n\n"
                                    f"<b>Time left:</b> {label}"
                                )
                            )
                        except Exception as e:
                            print(f"❌ error with thesis {thesis['id']}: {e}")

                    requests.patch(
                        f"{EXTERNAL_API_URL}milestones?id=eq.{m['id']}",
                        json={"notified": next_state},
                        headers=headers
                    )
                    break
            if delta <= datetime.timedelta(0) and m["notified"] == "deadline":
                theses = requests.get(
                    f"{EXTERNAL_API_URL}theses", headers=headers
                ).json()
                for thesis in theses:
                    try:
                        student = requests.get(
                            f"{EXTERNAL_API_URL}students?id=eq.{thesis['student_id']}",
                            headers=headers
                        ).json()[0]
                        user = requests.get(
                            f"{EXTERNAL_API_URL}users?id=eq.{student['user_id']}",
                            headers=headers
                        ).json()[0]
                        await bot.send_message(
                            chat_id=user["telegram_id"],
                            parse_mode="HTML",
                            text=(
                                f"❗️<b>Notification about deadline</b>❗️\n\n"
                                f"<b>Thesis title:</b> {thesis['title']}\n\n"
                                f"<b>Step:</b> {m['title']}\n\n"
                                f"<b>Description:</b> {m['description']}\n\n"
                                f"<b>Time left:</b> Time’s up!"
                            )
                        )
                    except Exception as e:
                        print(f"❌ error with thesis {thesis['id']}: {e}")
                requests.patch(
                    f"{EXTERNAL_API_URL}milestones?id=eq.{m['id']}",
                    json={"notified": "all_notified"},
                    headers=headers
                )

        respp = requests.get(f"{EXTERNAL_API_URL}meetings", headers=headers)
        meetings = respp.json()
        for m in meetings:
            deadline = (
                datetime.datetime.fromisoformat(m["date"].rstrip("Z"))
                .replace(tzinfo=datetime.timezone.utc)
            )
            delta = deadline - now

            if m["status"] != "in process" or m["notified"] == "all_notified":
                continue

            schedule = [
                (datetime.timedelta(days=3),   "in_3_days",    "in_12_hours",     "3 days"),
                (datetime.timedelta(hours=12), "in_12_hours",  "in_1_hour",    "12 hours"),
                (datetime.timedelta(hours=1),  "in_1_hour",    "deadline",     "1 hour"),
            ]

            for threshold, need_state, next_state, label in schedule:
                if delta > datetime.timedelta(0) and delta <= threshold and m["notified"] == need_state:
                    group_id = m["peer_group_id"]
                    students_from_group = requests.get(f"{EXTERNAL_API_URL}students?peer_group_id=eq.{group_id}", headers=headers)
                    users_ids_per_group = [student["user_id"] for student in students_from_group.json()]
                    supervisors_from_group_user_id = requests.get(
                        f"{EXTERNAL_API_URL}supervisors?id=eq.{m['supervisor_id']}",
                        headers=headers
                    ).json()[0]["user_id"]
                    name_supervisor = requests.get(
                        f"{EXTERNAL_API_URL}users?id=eq.{supervisors_from_group_user_id}",
                        headers=headers
                    ).json()[0]["first_name"]
                    surname_supervisor = requests.get(
                        f"{EXTERNAL_API_URL}users?id=eq.{supervisors_from_group_user_id}",
                        headers=headers
                    ).json()[0]["last_name"] or " "
                    for user in users_ids_per_group:
                        try:
                            await bot.send_message(
                                chat_id= requests.get(f"{EXTERNAL_API_URL}users?id=eq.{user}", headers=headers).json()[0]["telegram_id"],
                                parse_mode="HTML",
                                text=(
                                    f"❗️<b>Notification about meeting</b>❗️\n\n"
                                    f"<b>Supervisor:</b> {name_supervisor} {surname_supervisor}\n\n"
                                    f"<b>Goal:</b> {m['title']}\n\n"
                                    f"<b>Description:</b> {m['description']}\n\n"
                                    f"<b>Time left:</b> {label}"
                                )
                            )
                        except Exception as e:
                            print(f"❌ error with student {e}")

                    requests.patch(
                        f"{EXTERNAL_API_URL}meetings?id=eq.{m['id']}",
                        json={"notified": next_state},
                        headers=headers
                    )
                    break
            if delta <= datetime.timedelta(0) and m["notified"] == "deadline":
                group_id = m["peer_group_id"]
                students_from_group = requests.get(f"{EXTERNAL_API_URL}students?peer_group_id=eq.{group_id}",
                                                   headers=headers)
                users_ids_per_group = [student["user_id"] for student in students_from_group.json()]
                supervisors_from_group_user_id = requests.get(
                    f"{EXTERNAL_API_URL}supervisors?id=eq.{m['supervisor_id']}",
                    headers=headers
                ).json()[0]["user_id"]
                name_supervisor = requests.get(
                    f"{EXTERNAL_API_URL}users?id=eq.{supervisors_from_group_user_id}",
                    headers=headers
                ).json()[0]["first_name"]
                surname_supervisor = requests.get(
                    f"{EXTERNAL_API_URL}users?id=eq.{supervisors_from_group_user_id}",
                    headers=headers
                ).json()[0]["last_name"] or " "
                for user in users_ids_per_group:
                    try:
                        await bot.send_message(
                            chat_id= requests.get(f"{EXTERNAL_API_URL}users?id=eq.{user}", headers=headers).json()[0]["telegram_id"],
                            parse_mode="HTML",
                            text=(
                                f"❗️<b>Notification about meeting</b>❗️\n\n"
                                f"<b>Supervisor:</b> {name_supervisor} {surname_supervisor}\n\n"
                                f"<b>Goal:</b> {m['title']}\n\n"
                                f"<b>Description:</b> {m['description']}\n\n"
                                f"<b>Time left:</b> The meeting is start"
                            )
                        )
                    except Exception as e:
                        print(f"❌ error with student {e}")
                requests.patch(
                    f"{EXTERNAL_API_URL}milestones?id=eq.{m['id']}",
                    json={"notified": "all_notified"},
                    headers=headers
                )

        await asyncio.sleep(10)