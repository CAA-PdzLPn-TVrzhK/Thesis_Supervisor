# main.py

import asyncio

from Services.UserService import UserService

async def main():
    while True:
        print("Введите ID:")
        id = int(input())
        print("Введите Имя:")
        name = input()
        print("Введите email:")
        email = input()
        print("Введите Пароль:")
        password = input()
        new_user = await UserService.register_user(id=id, name=name, email=email, password=password)
        if new_user:
            print("Создали:", new_user)
        else:
            print("Пользователь с таким email уже есть")

if __name__ == "__main__":
    asyncio.run(main())
