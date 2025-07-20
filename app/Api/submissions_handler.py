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

def get_feedback_rating(submission_id: int) -> Optional[int]:
    try:
        response = requests.get(
            f"{EXTERNAL_API_URL}feedback?submission_id=eq.{submission_id}",
            headers=headers
        )
        if response.status_code == 200:
            feedbacks = response.json()
            if feedbacks and 'rating' in feedbacks[0]:
                return feedbacks[0]['rating']
            elif feedbacks:
                return feedbacks[0].get('rating')
        return None
    except Exception as e:
        print(f"Ошибка при получении рейтинга feedback для submission {submission_id}: {e}")
        return None

def calculate_score(submitted_at: str, deadline: str) -> float:
    """
    Возвращает time_multiplier в зависимости от времени сдачи относительно дедлайна.
    """
    submitted_time = datetime.datetime.fromisoformat(submitted_at.rstrip("Z")).replace(
        tzinfo=datetime.timezone.utc
    )
    deadline_time = datetime.datetime.fromisoformat(deadline.rstrip("Z")).replace(
        tzinfo=datetime.timezone.utc
    )
    time_diff = deadline_time - submitted_time
    hours_early = time_diff.total_seconds() / 3600
    if hours_early >= 48:
        return 1.0
    elif hours_early >= 24:
        return 0.95
    elif hours_early >= 12:
        return 0.9
    elif hours_early >= 6:
        return 0.85
    elif hours_early >= 4:
        return 0.8
    elif hours_early >= 2:
        return 0.75
    elif hours_early >= 1:
        return 0.7
    elif hours_early >= 0:
        return 0.6
    else:
        return 0.2

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



def update_submission_status(submission_id: int, status: str) -> bool:
    try:
        response = requests.patch(
            f"{EXTERNAL_API_URL}submissions?id=eq.{submission_id}",
            json={"status": status},
            headers=headers
        )
        if response.status_code == 200:
            print(f"Обновлен статус сабмишена {submission_id} на '{status}'")
            return True
        else:
            print(f"Ошибка при обновлении статуса сабмишена {submission_id}: {response.status_code}")
            return False
    except Exception as e:
        print(f"Ошибка при обновлении статуса сабмишена {submission_id}: {e}")
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
    
    # Обрабатываем только сабмишены со статусом "passed"
    if status != "passed":
        print(f"Сабмишен {submission_id} имеет статус '{status}', пропускаем")
        return True
    
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
    
    print(f"Обрабатываю сабмишен {submission_id} со статусом 'passed' после дедлайна")
    
    # Рассчитываем time_multiplier
    time_multiplier = calculate_score(
        submitted_at=submitted_at,
        deadline=milestone['deadline']
    )
    print(f"Множитель времени для сабмишена {submission_id}: {time_multiplier}")
    
    # Получаем рейтинг из feedback
    rating = get_feedback_rating(submission_id)
    if rating is None:
        print(f"Не найден рейтинг для submission {submission_id}, пропускаем начисление баллов")
        return False
    print(f"Рейтинг из feedback для submission {submission_id}: {rating}")
    
    # Итоговый балл
    final_score = rating * time_multiplier
    print(f"Итоговый балл для сабмишена {submission_id}: {final_score}")
    
    # Обновляем балл студента
    update_student_score(student_id, int(final_score))
    
    # Переводим статус в "done"
    return update_submission_status(submission_id, "done")

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
