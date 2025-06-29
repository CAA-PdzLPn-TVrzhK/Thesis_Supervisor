import pytest
from unittest.mock import MagicMock
import app.Api.Telegram_Api.Bot as bot_module
from app.Api.Telegram_Api.Bot import (
    cmd_start,
    cmd_email,
    process_email,
    process_verification,
    Form,
    pending_codes,
)


@pytest.mark.asyncio
async def test_cmd_start_user_exists(fake_msg, fsm, monkeypatch):
    fake_msg.text = "/start"

    monkeypatch.setattr(
        bot_module.requests, "get", lambda *_args, **_kw: MagicMock(status_code=200)
    )

    await cmd_start(fake_msg, fsm)

    fake_msg.answer.assert_awaited_once()
    assert "already have an account" in fake_msg.answer.call_args.args[0]


@pytest.mark.asyncio
async def test_cmd_start_user_not_found(fake_msg, fsm, monkeypatch):
    fake_msg.text = "/start"

    monkeypatch.setattr(
        bot_module.requests, "get", lambda *_args, **_kw: MagicMock(status_code=404)
    )

    await cmd_start(fake_msg, fsm)

    fake_msg.answer.assert_awaited_once()
    assert fsm.state == Form.waiting_for_email


@pytest.mark.asyncio
async def test_cmd_email_success(fake_msg, fsm, monkeypatch):
    fake_msg.text = "Change email"

    monkeypatch.setattr(
        bot_module.requests,
        "get",
        lambda url: MagicMock(status_code=200, json=lambda: {"_id": 999}),
    )
    monkeypatch.setattr(
        bot_module.requests, "delete", lambda url: MagicMock(status_code=204)
    )

    await cmd_email(fake_msg, fsm)

    fake_msg.answer.assert_awaited_once()
    assert fsm.state == Form.waiting_for_email


@pytest.mark.asyncio
async def test_email_valid_domain(fake_msg, fsm, monkeypatch):
    fake_msg.text = "stud@innopolis.university"

    monkeypatch.setattr(bot_module.random, "randint", lambda *_: 123456)
    monkeypatch.setattr(bot_module.smtplib, "SMTP", MagicMock())

    await process_email(fake_msg, fsm)

    fake_msg.answer.assert_awaited_once()
    assert pending_codes[fake_msg.chat.id] == "123456"
    assert fsm.state == Form.waiting_for_verification


@pytest.mark.asyncio
async def test_email_wrong_domain(fake_msg, fsm):
    fake_msg.text = "spam@gmail.com"
    await process_email(fake_msg, fsm)
    fake_msg.answer.assert_awaited_once()
    assert fsm.state == Form.waiting_for_email


@pytest.mark.asyncio
async def test_verification_correct_code(fake_msg, fsm, monkeypatch):
    pending_codes[fake_msg.chat.id] = "111222"
    await fsm.update_data(user_email="stud@innopolis.university")
    fake_msg.text = "111222"

    import responses

    with responses.RequestsMock() as rsps:
        rsps.add(
            "GET",
            f"{bot_module.EXTERNAL_API_URL}supervisors/{fake_msg.chat.id}",
            status=404,
        )
        rsps.add("POST", f"{bot_module.EXTERNAL_API_URL}users/", status=201)
        rsps.add("POST", f"{bot_module.EXTERNAL_API_URL}students/", status=201)

        await process_verification(fake_msg, fsm)

    fake_msg.answer.assert_awaited()
    assert fake_msg.chat.id not in pending_codes
    assert fsm.state is None


@pytest.mark.asyncio
async def test_verification_wrong_code(fake_msg, fsm):
    pending_codes[fake_msg.chat.id] = "000000"
    fake_msg.text = "999999"

    await process_verification(fake_msg, fsm)

    fake_msg.answer.assert_awaited_once()
    assert fsm.state == Form.waiting_for_verification
