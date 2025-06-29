from app.Tests.conftest import FakeMessage
import pytest
import responses
from unittest.mock import MagicMock
import app.Api.Telegram_Api.Bot as bot_module
from app.Api.Telegram_Api.Bot import (
    cmd_start,
    process_email,
    process_verification,
    Form,
    pending_codes,
    EXTERNAL_API_URL,
)


@pytest.fixture
def msg():
    return FakeMessage("/start")


def http_stub(rsps: responses.RequestsMock, method: str, url_suffix: str, **kw):
    rsps.add(method, f"{EXTERNAL_API_URL}{url_suffix}", **kw)


@pytest.mark.asyncio
async def test_onboarding_happy_path(msg, fsm, monkeypatch):
    with responses.RequestsMock() as rsps:
        http_stub(rsps, "GET", "users/telegram/42", status=404)
        http_stub(rsps, "GET", "supervisors/42", status=404)
        http_stub(rsps, "POST", "users/", status=201)
        http_stub(rsps, "POST", "students/", status=201)

        monkeypatch.setattr(
            bot_module.smtplib, "SMTP", lambda *_a, **_k: MagicMock()
        )
        monkeypatch.setattr(bot_module.random, "randint", lambda *_: 111222)

        # шаг 1: /start
        await cmd_start(msg, fsm)
        assert fsm.state == Form.waiting_for_email

        # шаг 2: email
        msg.text = "stud@innopolis.university"
        await process_email(msg, fsm)
        assert fsm.state == Form.waiting_for_verification
        assert pending_codes[msg.chat.id] == "111222"

        # шаг 3: ввод кода
        msg.text = "111222"
        await process_verification(msg, fsm)

        # Проверки результата — ДОЛЖНЫ быть ВНУТРИ with!
        assert any(
            (
                c.request.method == "POST"
                and c.request.url.endswith("/users/")
            )
            for c in rsps.calls
        ), "POST /users/ не был вызван"
        assert any(
            (
                c.request.method == "POST"
                and c.request.url.endswith("/students/")
            )
            for c in rsps.calls
        ), "POST /students/ не был вызван"

    # FSM очищен, код убран
    assert fsm.state is None
    assert msg.chat.id not in pending_codes


@pytest.mark.asyncio
async def test_onboarding_wrong_code(msg, fsm, monkeypatch):
    with responses.RequestsMock() as rsps:
        http_stub(rsps, "GET", "users/telegram/42", status=404)

        monkeypatch.setattr(
            bot_module.smtplib, "SMTP", lambda *_a, **_k: MagicMock()
        )
        monkeypatch.setattr(bot_module.random, "randint", lambda *_: 333444)

        await cmd_start(msg, fsm)

        msg.text = "stud@innopolis.university"
        await process_email(msg, fsm)

        pending_codes[msg.chat.id] = "333444"
        msg.text = "999000"
        await process_verification(msg, fsm)

    assert fsm.state == Form.waiting_for_verification
    assert pending_codes[msg.chat.id] == "333444"
    msg.answer.assert_awaited()
    assert "Incorrect" in msg.answer.call_args.args[0]


@pytest.mark.asyncio
async def test_start_existing_user(msg, fsm, monkeypatch):
    monkeypatch.setattr(
        bot_module.requests,
        "get",
        lambda *_a, **_k: MagicMock(status_code=200),
    )

    await cmd_start(msg, fsm)

    assert fsm.state is None
    msg.answer.assert_awaited_once()
    assert "already have an account" in msg.answer.call_args.args[0]
