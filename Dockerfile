# Используем официальный Python-образ
FROM python:3.11-slim

# Рабочая директория в контейнере
WORKDIR /app

# Скопировать зависимости
COPY requirements.txt .

# Установить зависимости
RUN pip install --no-cache-dir -r requirements.txt

# Скопировать весь проект
COPY . .

# Порт, на котором будет слушать Uvicorn
ENV PORT 8000

# Команда запуска
CMD ["uvicorn", "mini_app:mini_app", "--host", "0.0.0.0", "--port", "8000"]
