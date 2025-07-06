import pytest
from types import SimpleNamespace
from unittest.mock import AsyncMock

# ---------------- FakeMessage ----------------
class FakeMessage:
    """
    Фейковое сообщение для тестирования хендлеров.
    Имитирует основные атрибуты:
    .text, .chat.id, .from_user.{id,username,first_name,last_name}
    Метод .answer() — AsyncMock для проверки ответов бота.
    """
    def __init__(self, text: str = "/start", uid: int = 42):
        self.text = text
        self.chat = SimpleNamespace(id=uid, type="private")
        self.from_user = SimpleNamespace(
            id=uid,
            username="tester",
            first_name="Test",
            last_name="User",
            is_bot=False,
        )
        self.web_app_data = SimpleNamespace(data="{}")
        self.content_type = None
        self.answer = AsyncMock()

@pytest.fixture
def fake_msg():
    """Сообщение-заглушка для unit- и integration-тестов."""
    return FakeMessage()

# ---------------- DummyFSM ----------------
class DummyFSM:
    """
    Простая имитация FSMContext: хранит state и data.
    Методы set_state, clear, update_data, get_data асинхронные.
    """
    def __init__(self):
        self.state = None
        self.data = {}

    async def set_state(self, state):
        self.state = state

    async def clear(self):
        self.state = None
        self.data.clear()

    async def update_data(self, **kwargs):
        self.data.update(kwargs)

    async def get_data(self):
        return self.data

@pytest.fixture
def fsm():
    """FSM-заглушка для тестов."""
    return DummyFSM()
