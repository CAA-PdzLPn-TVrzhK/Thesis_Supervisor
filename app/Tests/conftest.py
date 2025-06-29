# tests/conftest.py
import pytest
from types import SimpleNamespace
from unittest.mock import AsyncMock


class FakeMessage:
    """Маленькая подделка telegram Message."""

    def __init__(self, text="/start", uid=42):
        self.text = text
        self.chat = SimpleNamespace(id=uid, type="private")
        self.from_user = SimpleNamespace(
            id=uid,
            username="tester",
            first_name="Test",
            last_name="User",
            is_bot=False,
        )
        # aiogram хендлеры зовут .answer(...) — перехватываем:
        self.answer = AsyncMock()


@pytest.fixture
def fake_msg():
    """фикс­тура для юнит‑тестов"""
    return FakeMessage()


# ---------- FSM та же, что была ----------
class DummyFSM:
    def __init__(self):
        self.state, self.data = None, {}

    async def set_state(self, s):
        self.state = s

    async def clear(self):
        self.state, self.data = None, {}

    async def update_data(self, **kw):
        self.data.update(kw)

    async def get_data(self):
        return self.data


@pytest.fixture
def fsm():
    return DummyFSM()
