import os
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import List
import aiofiles

from app.Services.UserService import UserService


mini_app = FastAPI()
# Статика (фронтенд)
mini_app.mount("/static", StaticFiles(directory="C://Users//pc//PycharmProjects//Thesis_Supervisor//app//Api//Telegram_Api//webapp//static"), name="static")

@mini_app.get("/", response_class=HTMLResponse)
async def index():
    with open("./static/index.html", encoding="utf-8") as f:
        return f.read()

class LeaderboardItem(BaseModel):
    user_id: int
    name: str
    submissions: int

@mini_app.get("/api/profile/{user_id}")
async def get_profile(user_id: int):
    user = await UserService.get_profile(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "user_id": user.id,
        "name": user.name,
        "email": user.email,
        "status": user.status
    }

@mini_app.get("/api/leaderboard", response_model=List[LeaderboardItem])
async def leaderboard():
    data = []
    return data

@mini_app.post("/api/upload")
async def upload_work(
    user_id: int = Form(...),
    file: UploadFile = File(...)
):
    user = await UserService.get_profile(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    upload_dir = os.path.join("C://Users//pc//Desktop//TS_store", str(user_id))
    os.makedirs(upload_dir, exist_ok=True)

    file_path = os.path.join(upload_dir, file.filename)
    async with aiofiles.open(file_path, "wb") as out_file:
        content = await file.read()
        await out_file.write(content)
    #
    # await SubmissionService.record_submission(user_id, file.filename, file_path)
    return {"success": True, "path": file_path}
