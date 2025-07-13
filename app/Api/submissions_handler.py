import asyncio
import datetime
import requests
from typing import Dict, List, Optional

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
    
    Args:
        submitted_at: Время сабмишена (ISO format)
        deadline: Дедлайн milestone (ISO format)
        milestone_weight: Коэффициент milestone (weight)
    
    Returns:
        int: Рассчитанный балл (максимум 100)
    """
    # Парсим даты
    submitted_time = datetime.datetime.fromisoformat(submitted_at.rstrip("Z")).replace(
        tzinfo=datetime.timezone.utc
    )
    deadline_time = datetime.datetime.fromisoformat(deadline.rstrip("Z")).replace(
        tzinfo=datetime.timezone.utc
    )
    
    # Вычисляем разницу во времени в часах
    time_diff = deadline_time - submitted_time
    hours_early = time_diff.total_seconds() / 3600
    
    # Если сдано после дедлайна - 0 баллов
    if hours_early < 0:
        return 0
    
    # Умная формула с ограничением в 100 баллов
    # Базовый балл: 100 * weight, но не больше 100
    base_score = min(100 * milestone_weight, 100)
    
    # Коэффициент времени: чем раньше сдано, тем больше баллов
    if hours_early >= 168:  # За неделю или раньше
        time_multiplier = 1.0
    elif hours_early >= 72:  # За 3 дня
        time_multiplier = 0.95
    elif hours_early >= 48:  # За 2 дня
        time_multiplier = 0.9
    elif hours_early >= 24:  # За день
        time_multiplier = 0.85
    elif hours_early >= 12:  # За 12 часов
        time_multiplier = 0.8
    elif hours_early >= 6:  # За 6 часов
        time_multiplier = 0.75
    elif hours_early >= 1:  # За час
        time_multiplier = 0.7
    else:  # В последний час
        time_multiplier = 0.6
    
    # Итоговый балл с ограничением в 100
    final_score = int(base_score * time_multiplier)
    return min(final_score, 100)


def get_milestone_info(milestone_id: int) -> Optional[Dict]:
    """
    Получает информацию о milestone по ID
    
    Args:
        milestone_id: ID milestone
    
    Returns:
        Dict с информацией о milestone или None если не найден
    """
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
    """
    Получает информацию о студенте по ID
    
    Args:
        student_id: ID студента
    
    Returns:
        Dict с информацией о студенте или None если не найден
    """
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
    """
    Обновляет score студента, добавляя дополнительные баллы
    
    Args:
        student_id: ID студента
        additional_score: Дополнительные баллы для добавления
    
    Returns:
        bool: True если успешно обновлено, False иначе
    """
    try:
        # Получаем текущий score студента
        student = get_student_info(student_id)
        if not student:
            print(f"Студент {student_id} не найден")
            return False
        
        current_score = student.get('score', 0)
        new_score = current_score + additional_score
        
        # Обновляем score
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
    """
    Удаляет сабмишен по ID
    
    Args:
        submission_id: ID сабмишена
    
    Returns:
        bool: True если успешно удален, False иначе
    """
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
    """
    Обрабатывает один сабмишен согласно бизнес-логике.
    Проверяет только после окончания дедлайна milestone.
    
    Args:
        submission: Словарь с данными сабмишена
    
    Returns:
        bool: True если сабмишен обработан успешно, False иначе
    """
    submission_id = submission.get('id')
    status = submission.get('status')
    student_id = submission.get('student_id')
    milestone_id = submission.get('milestone_id')
    submitted_at = submission.get('submitted_at')
    
    # Проверяем наличие обязательных полей
    if submission_id is None or student_id is None or milestone_id is None or submitted_at is None:
        print(f"Отсутствуют обязательные поля в сабмишене: {submission}")
        return False
    
    # Получаем информацию о milestone для проверки дедлайна
    milestone = get_milestone_info(milestone_id)
    if not milestone:
        print(f"Milestone {milestone_id} не найден для сабмишена {submission_id}")
        return False
    
    # Проверяем, прошёл ли дедлайн milestone
    now = datetime.datetime.now(datetime.timezone.utc)
    deadline_time = datetime.datetime.fromisoformat(milestone['deadline'].rstrip("Z")).replace(
        tzinfo=datetime.timezone.utc
    )
    
    if now < deadline_time:
        print(f"Дедлайн milestone {milestone_id} еще не наступил, пропускаем сабмишен {submission_id}")
        return True
    
    print(f"Обрабатываю сабмишен {submission_id} (статус: {status}) после дедлайна")
    
    # Если статус "pending" - оставляем в проверке
    if status == "pending" or status == "in_review" or status == "in_process":
        print(f"Сабмишен {submission_id} в проверке, оставляем")
        return True
    
    # Для всех остальных статусов (approved, passed, failed, rejected) - удаляем
    # Но сначала начисляем баллы если статус "approved" или "passed"
    if status == "approved" or status == "passed":
        # Рассчитываем балл
        score = calculate_score(
            submitted_at=submitted_at,
            deadline=milestone['deadline'],
            milestone_weight=milestone.get('weight', 1.0)  # По умолчанию коэффициент 1.0
        )
        
        print(f"Рассчитан балл для сабмишена {submission_id}: {score}")
        
        # Обновляем score студента
        update_student_score(student_id, score)
    
    # Удаляем сабмишен (кроме pending)
    return delete_submission(submission_id)


async def process_submissions():
    """
    Основная функция обработки сабмишенов.
    Получает все сабмишены и обрабатывает их согласно бизнес-логике.
    """
    try:
        # Получаем все сабмишены
        response = requests.get(
            f"{EXTERNAL_API_URL}submissions",
            headers=headers
        )
        
        if response.status_code != 200:
            print(f"Ошибка при получении сабмишенов: {response.status_code}")
            return
        
        submissions = response.json()
        print(f"Найдено {len(submissions)} сабмишенов для обработки")
        
        # Обрабатываем каждый сабмишен
        for submission in submissions:
            process_submission(submission)
            
    except Exception as e:
        print(f"Ошибка при обработке сабмишенов: {e}")


async def submissions_handler():
    """
    Основной цикл обработчика сабмишенов.
    Запускается каждую минуту.
    """
    print("Запущен обработчик сабмишенов")
    
    while True:
        try:
            await process_submissions()
        except Exception as e:
            print(f"Ошибка в цикле обработки сабмишенов: {e}")
        
        # Ждем 1 минуту перед следующей проверкой
        await asyncio.sleep(60)


if __name__ == "__main__":
    print("Запуск только обработчика сабмишенов...")
    asyncio.run(submissions_handler())
