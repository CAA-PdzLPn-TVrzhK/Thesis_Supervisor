import os
from fastapi import FastAPI, UploadFile, File, Form, HTTPException

from app.Services.UserService import UserService

mini_app = FastAPI()


@mini_app.get("/profile/{user_id}")
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
