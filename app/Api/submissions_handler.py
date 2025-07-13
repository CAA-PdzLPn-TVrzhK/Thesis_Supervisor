import asyncio
import datetime
import requests
from typing import Dict, Optional

# API конфигурация (такая же как в Bot.py)
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

def calculate_score(submitted_at: str, deadline: str, milestone_weight: float) -> int:
    """
    Рассчитывает балл за сабмишен на основе времени сдачи относительно дедлайна.
    Умная формула с ограничением в 100 баллов и учетом коэффициента weight.
    """
    submitted_time = datetime.datetime.fromisoformat(submitted_at.rstrip("Z")).replace(
        tzinfo=datetime.timezone.utc
    )
    deadline_time = datetime.datetime.fromisoformat(deadline.rstrip("Z")).replace(
        tzinfo=datetime.timezone.utc
    )
    time_diff = deadline_time - submitted_time
    hours_early = time_diff.total_seconds() / 3600
    if hours_early < 0:
        return 0
    base_score = min(100 * milestone_weight, 100)
    if hours_early >= 168:
        time_multiplier = 1.0
    elif hours_early >= 72:
        time_multiplier = 0.95
    elif hours_early >= 48:
        time_multiplier = 0.9
    elif hours_early >= 24:
        time_multiplier = 0.85
    elif hours_early >= 12:
        time_multiplier = 0.8
    elif hours_early >= 6:
        time_multiplier = 0.75
    elif hours_early >= 1:
        time_multiplier = 0.7
    else:
        time_multiplier = 0.6
    final_score = int(base_score * time_multiplier)
    return min(final_score, 100)

def get_milestone_info(milestone_id: int) -> Optional[Dict]:
    try:
        response = requests.get(
            f"{EXTERNAL_API_URL}milestones?id=eq.{milestone_id}",
            headers=headers
        )
        if response.status_code == 200:
            milestones = response.json()
            return milestones[0] if milestones else None
        return None
    except Exception as e:
        print(f"Ошибка при получении milestone {milestone_id}: {e}")
        return None

def get_student_info(student_id: int) -> Optional[Dict]:
    try:
        response = requests.get(
            f"{EXTERNAL_API_URL}students?id=eq.{student_id}",
            headers=headers
        )
        if response.status_code == 200:
            students = response.json()
            return students[0] if students else None
        return None
    except Exception as e:
        print(f"Ошибка при получении студента {student_id}: {e}")
        return None

def update_student_score(student_id: int, additional_score: int) -> bool:
    try:
        student = get_student_info(student_id)
        if not student:
            print(f"Студент {student_id} не найден")
            return False
        current_score = student.get('score', 0)
        new_score = current_score + additional_score
        response = requests.patch(
            f"{EXTERNAL_API_URL}students?id=eq.{student_id}",
            json={"score": new_score},
            headers=headers
        )
        if response.status_code == 200:
            print(f"Обновлен score студента {student_id}: {current_score} -> {new_score}")
            return True
        else:
            print(f"Ошибка при обновлении score студента {student_id}: {response.status_code}")
            return False
    except Exception as e:
        print(f"Ошибка при обновлении score студента {student_id}: {e}")
        return False

def delete_submission(submission_id: int) -> bool:
    try:
        response = requests.delete(
            f"{EXTERNAL_API_URL}submissions?id=eq.{submission_id}",
            headers=headers
        )
        if response.status_code == 200:
            print(f"Удален сабмишен {submission_id}")
            return True
        else:
            print(f"Ошибка при удалении сабмишена {submission_id}: {response.status_code}")
            return False
    except Exception as e:
        print(f"Ошибка при удалении сабмишена {submission_id}: {e}")
        return False

def process_submission(submission: Dict) -> bool:
    submission_id = submission.get('id')
    status = submission.get('status')
    student_id = submission.get('student_id')
    milestone_id = submission.get('milestone_id')
    submitted_at = submission.get('submitted_at')
    if submission_id is None or student_id is None or milestone_id is None or submitted_at is None:
        print(f"Отсутствуют обязательные поля в сабмишене: {submission}")
        return False
    milestone = get_milestone_info(milestone_id)
    if not milestone:
        print(f"Milestone {milestone_id} не найден для сабмишена {submission_id}")
        return False
    now = datetime.datetime.now(datetime.timezone.utc)
    deadline_time = datetime.datetime.fromisoformat(
        milestone['deadline'].rstrip("Z")
    ).replace(tzinfo=datetime.timezone.utc)
    if now < deadline_time:
        print(f"Дедлайн milestone {milestone_id} еще не наступил, пропускаем сабмишен {submission_id}")
        return True
    print(f"Обрабатываю сабмишен {submission_id} (статус: {status}) после дедлайна")
    if status == "pending" or status == "in_review" or status == "in_process":
        print(f"Сабмишен {submission_id} в проверке, оставляем")
        return True
    if status == "approved" or status == "passed":
        score = calculate_score(
            submitted_at=submitted_at,
            deadline=milestone['deadline'],
            milestone_weight=milestone.get('weight', 1.0)
        )
        print(f"Рассчитан балл для сабмишена {submission_id}: {score}")
        update_student_score(student_id, score)
    return delete_submission(submission_id)

async def process_submissions():
    try:
        response = requests.get(
            f"{EXTERNAL_API_URL}submissions",
            headers=headers
        )
        if response.status_code != 200:
            print(f"Ошибка при получении сабмишенов: {response.status_code}")
            return
        submissions = response.json()
        print(f"Найдено {len(submissions)} сабмишенов для обработки")
        for submission in submissions:
            process_submission(submission)
    except Exception as e:
        print(f"Ошибка при обработке сабмишенов: {e}")

async def submissions_handler():
    print("Запущен обработчик сабмишенов")
    while True:
        try:
            await process_submissions()
        except Exception as e:
            print(f"Ошибка в цикле обработки сабмишенов: {e}")
        await asyncio.sleep(60)

if __name__ == "__main__":
    print("Запуск только обработчика сабмишенов...")
    asyncio.run(submissions_handler())
