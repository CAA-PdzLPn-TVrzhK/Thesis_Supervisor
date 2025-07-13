import pytest
from unittest.mock import MagicMock
import datetime
import asyncio
import app.Api.Telegram_Api.Bot as bot_module
from app.Api.Telegram_Api.Bot import (
    cmd_start, cmd_email, process_email, process_verification,
    Form, pending_codes, notification_about_events, EXTERNAL_API_URL
)

# ---------------- Unit tests for handlers -----------------


@pytest.mark.asyncio
async def test_cmd_start_existing_user(fake_msg, fsm, monkeypatch):
    monkeypatch.setattr(
        bot_module.requests, "get",
        lambda *args, **kwargs: MagicMock(json=lambda: [{'id': 1}])
    )
    await cmd_start(fake_msg, fsm)
    fake_msg.answer.assert_awaited_once()
    assert fsm.state is None


@pytest.mark.asyncio
async def test_cmd_start_new_user(fake_msg, fsm, monkeypatch):
    monkeypatch.setattr(bot_module.requests, "get",
                        lambda *args, **kwargs: MagicMock(json=lambda: []))
    await cmd_start(fake_msg, fsm)
    fake_msg.answer.assert_awaited_once()
    assert fsm.state == Form.waiting_for_email


@pytest.mark.asyncio
async def test_cmd_email_found(fake_msg, fsm, monkeypatch):
    fake_msg.text = "Change email"
    monkeypatch.setattr(
        bot_module.requests, "get",
        lambda *args, **kwargs: MagicMock(json=lambda: [{'id': 2}])
    )
    await cmd_email(fake_msg, fsm)
    fake_msg.answer.assert_awaited_once()
    assert fsm.state == Form.waiting_for_email


@pytest.mark.asyncio
async def test_cmd_email_not_found(fake_msg, fsm, monkeypatch):
    fake_msg.text = "Change email"
    monkeypatch.setattr(bot_module.requests, "get",
                        lambda *args, **kwargs: MagicMock(json=lambda: []))
    await cmd_email(fake_msg, fsm)
    fake_msg.answer.assert_awaited_once()
    assert fsm.state is None


@pytest.mark.asyncio
async def test_process_email_valid_domain(fake_msg, fsm, monkeypatch):
    fake_msg.text = "user@innopolis.university"
    monkeypatch.setattr(
        bot_module.random, "randint", lambda *args, **kwargs: 123456
    )
    monkeypatch.setattr(bot_module.smtplib, "SMTP", MagicMock())
    await process_email(fake_msg, fsm)
    assert pending_codes[fake_msg.chat.id] == "123456"
    assert fsm.state == Form.waiting_for_verification
    fake_msg.answer.assert_awaited_once()


@pytest.mark.asyncio
async def test_process_email_wrong_domain(fake_msg, fsm):
    fake_msg.text = "spam@example.com"
    await process_email(fake_msg, fsm)
    fake_msg.answer.assert_awaited_once()
    assert fsm.state == Form.waiting_for_email


@pytest.mark.asyncio
async def test_process_verification_correct_code_update_existing(
        fake_msg, fsm, monkeypatch):
    pending_codes[fake_msg.chat.id] = "555000"
    await fsm.update_data(user_email="user@innopolis.university")
    fake_msg.text = "555000"
    # first get existing user => update via patch
    fake_user_resp = MagicMock()
    fake_user_resp.json.return_value = [{'id': 3}]
    # supervisor exists -> no branch
    fake_sup_resp = MagicMock(status_code=200)

    def fake_get(url, **kw):
        if 'users?' in url:
            return fake_user_resp
        if 'supervisors?' in url:
            return fake_sup_resp
        return MagicMock()

    monkeypatch.setattr(bot_module.requests, "get", fake_get)
    monkeypatch.setattr(
        bot_module.requests, "patch", lambda *args, **kwargs: MagicMock()
    )
    await process_verification(fake_msg, fsm)
    assert fake_msg.chat.id not in pending_codes
    assert fsm.state is None
    fake_msg.answer.assert_awaited()


@pytest.mark.asyncio
async def test_process_verification_correct_code_new_supervisor_branch(
        fake_msg, fsm, monkeypatch):
    pending_codes[fake_msg.chat.id] = "222333"
    await fsm.update_data(user_email="user@innopolis.university")
    fake_msg.text = "222333"
    # no existing user -> create in branch
    fake_user_resp = MagicMock()
    fake_user_resp.json.return_value = []
    fake_sup_resp = MagicMock(status_code=400)
    # for post chain
    posts = []

    def fake_get(url, **kw):
        if 'users?' in url:
            return fake_user_resp
        if 'supervisors?' in url:
            return fake_sup_resp
        return MagicMock()

    def fake_post(url, **kw):
        posts.append(url)
        if 'users' in url and not url.endswith('students'):
            return MagicMock(json=lambda: [{'id': 4}])
        return MagicMock()

    monkeypatch.setattr(bot_module.requests, "get", fake_get)
    monkeypatch.setattr(bot_module.requests, "post", fake_post)
    await process_verification(fake_msg, fsm)
    assert any('/users' in p for p in posts)


@pytest.mark.asyncio
async def test_notification_about_deadline_single_iteration(monkeypatch):
    # Prepare one milestone reaching threshold
    now = datetime.datetime.now(datetime.timezone.utc)
    m = {
        'id': 1,
        'deadline': (now + datetime.timedelta(hours=1)).isoformat() + 'Z',
        'created_at': now.isoformat() + 'Z',
        'status': 'in process',
        'notified': 'in_1_hour',
        'title': 't',
        'description': 'd'
    }

    # responses sequence for get
    def fake_requests_get(url, **kw):
        if url.startswith(f"{EXTERNAL_API_URL}milestones"):
            return MagicMock(json=lambda: [m])
        if url.startswith(f"{EXTERNAL_API_URL}theses"):
            return MagicMock(json=lambda: [])
        return MagicMock(json=lambda: [])

    monkeypatch.setattr(bot_module.requests, 'get', fake_requests_get)
    patched = []

    def fake_patch(url, **kw):
        patched.append(url)

    monkeypatch.setattr(bot_module.requests, 'patch', fake_patch)

    # stub sleep to break loop
    async def fake_sleep(sec):
        raise asyncio.CancelledError

    monkeypatch.setattr(bot_module.asyncio, 'sleep', fake_sleep)
    # run and catch
    with pytest.raises(asyncio.CancelledError):
        await notification_about_events()
    assert f"{EXTERNAL_API_URL}milestones?id=eq.1" in patched
