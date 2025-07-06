import pytest
import responses
from unittest.mock import MagicMock
import datetime
import asyncio
import app.Api.Telegram_Api.Bot as bot_module
from app.Api.Telegram_Api.Bot import (
    cmd_start, cmd_email, process_email, process_verification,
    Form, pending_codes, notification_about_events, EXTERNAL_API_URL
)
from app.Tests.conftest import FakeMessage, DummyFSM

# ---------------- Integration tests -----------------


@pytest.mark.asyncio
async def test_full_onboarding_happy_path(monkeypatch):
    msg = FakeMessage("/start")
    fsm = DummyFSM()
    with responses.RequestsMock() as rsps:
        rsps.add(
            "GET",
            f"{EXTERNAL_API_URL}users?telegram_id=eq.42",
            json=[], status=200
        )
        rsps.add(
            "GET",
            f"{EXTERNAL_API_URL}users?telegram_id=eq.42",
            json=[{'id': 5}], status=200
        )
        rsps.add(
            "GET",
            f"{EXTERNAL_API_URL}supervisors?user_id=eq.42",
            status=400
        )
        rsps.add(
            "POST",
            f"{EXTERNAL_API_URL}users",
            json=[{'id': 6}], status=201
        )
        rsps.add("POST", f"{EXTERNAL_API_URL}students",
                 json=[{}], status=201)
        rsps.add("PATCH", f"{EXTERNAL_API_URL}users?id=eq.5", status=200)
        monkeypatch.setattr(
            bot_module.random, "randint", lambda *a, **k: 777888
        )
        monkeypatch.setattr(bot_module.smtplib, "SMTP", MagicMock())
        await cmd_start(msg, fsm)
        msg.text = "user@innopolis.university"
        await process_email(msg, fsm)
        msg.text = "777888"
        await process_verification(msg, fsm)
        urls = [c.request.url for c in rsps.calls]
        assert any(
            EXTERNAL_API_URL + "users?telegram_id=eq.42" in u for u in urls
        )
        assert any(
            EXTERNAL_API_URL + "supervisors?user_id=eq.42" in u for u in urls
        )
        assert any(
            EXTERNAL_API_URL + "users" == u.split('?')[0] for u in urls
        )
        assert any(EXTERNAL_API_URL + "students" == u for u in urls)
    assert fsm.state is None
    assert msg.chat.id not in pending_codes


@pytest.mark.asyncio
async def test_onboarding_wrong_code_loop(monkeypatch):
    msg = FakeMessage()
    fsm = DummyFSM()
    with responses.RequestsMock() as rsps:
        rsps.add(
            "GET",
            f"{EXTERNAL_API_URL}users?telegram_id=eq.42",
            json=[], status=200
        )
        monkeypatch.setattr(
            bot_module.random, "randint", lambda *a, **k: 111000
        )
        monkeypatch.setattr(bot_module.smtplib, "SMTP", MagicMock())
        await cmd_start(msg, fsm)
        msg.text = "user@innopolis.university"
        await process_email(msg, fsm)
        pending_codes[msg.chat.id] = "111000"
        msg.text = "000111"
        await process_verification(msg, fsm)
    assert fsm.state == Form.waiting_for_verification


@pytest.mark.asyncio
async def test_start_existing_user_integration(monkeypatch):
    msg = FakeMessage()
    fsm = DummyFSM()
    with responses.RequestsMock() as rsps:
        rsps.add(
            "GET",
            f"{EXTERNAL_API_URL}users?telegram_id=eq.42",
            json=[{'id': 1}], status=200
        )
        await cmd_start(msg, fsm)
    msg.answer.assert_awaited_once()
    assert fsm.state is None


@pytest.mark.asyncio
async def test_change_email_flow(monkeypatch):
    msg = FakeMessage()
    fsm = DummyFSM()
    with responses.RequestsMock() as rsps:
        rsps.add(
            "GET",
            f"{EXTERNAL_API_URL}users?telegram_id=eq.42",
            json=[{'id': 2}], status=200
        )
        await cmd_email(msg, fsm)
    assert fsm.state == Form.waiting_for_email


@pytest.mark.asyncio
async def test_change_email_not_found(monkeypatch):
    msg = FakeMessage()
    fsm = DummyFSM()
    with responses.RequestsMock() as rsps:
        rsps.add(
            "GET",
            f"{EXTERNAL_API_URL}users?telegram_id=eq.42",
            json=[], status=200
        )
        await cmd_email(msg, fsm)
    assert fsm.state is None


@pytest.mark.asyncio
async def test_process_email_integration(monkeypatch):
    pending_codes.clear()
    msg = FakeMessage()
    msg.text = "user@innopolis.university"
    fsm = DummyFSM()
    monkeypatch.setattr(
        bot_module.random, "randint", lambda *a, **k: 333444
    )
    monkeypatch.setattr(bot_module.smtplib, "SMTP", MagicMock())
    await process_email(msg, fsm)
    assert pending_codes[msg.chat.id] == "333444"
    assert fsm.state == Form.waiting_for_verification


@pytest.mark.asyncio
async def test_process_verification_update(monkeypatch):
    msg = FakeMessage()
    fsm = DummyFSM()
    pending_codes[msg.chat.id] = "444555"
    await fsm.update_data(user_email="x@innopolis.university")
    msg.text = "444555"
    with responses.RequestsMock(assert_all_requests_are_fired=False) as rsps:
        rsps.add(
            "GET",
            f"{EXTERNAL_API_URL}users?telegram_id=eq.42",
            json=[{'id': 3}], status=200
        )
        rsps.add(
            "GET",
            f"{EXTERNAL_API_URL}supervisors?user_id=eq.42",
            status=200
        )
        rsps.add("PATCH", f"{EXTERNAL_API_URL}users?id=eq.3", status=200)
        rsps.add(
            "GET",
            f"{EXTERNAL_API_URL}supervisors?user_id=eq.42",
            status=400
        )
        await process_verification(msg, fsm)
    assert fsm.state is None


@pytest.mark.asyncio
async def test_notification_about_deadline_cycle(monkeypatch):
    now = datetime.datetime.now(datetime.timezone.utc)
    m = {
        'id': 10,
        'deadline': (now + datetime.timedelta(days=1)).isoformat() + 'Z',
        'status': 'in process',
        'notified': 'in_7_days',
        'title': 't',
        'description': 'd'
    }
    monkeypatch.setattr(
        bot_module.requests, 'get',
        lambda url, **kw: MagicMock(json=lambda: [m])
        if 'milestones' in url else MagicMock(json=lambda: [])
    )
    patched = []
    monkeypatch.setattr(
        bot_module.requests, 'patch',
        lambda url, **kw: patched.append(url)
    )

    async def fake_sleep(sec):
        raise asyncio.CancelledError

    monkeypatch.setattr(bot_module.asyncio, 'sleep', fake_sleep)
    with pytest.raises(asyncio.CancelledError):
        await notification_about_events()
    assert any('milestones?id=eq.10' in u for u in patched)


@pytest.mark.asyncio
async def test_notification_meetings(monkeypatch):
    now = datetime.datetime.now(datetime.timezone.utc)
    m = {
        'id': 20,
        'date': (now + datetime.timedelta(hours=1)).isoformat() + 'Z',
        'status': 'in process',
        'notified': 'in_1_hour',
        'peer_group_id': 'g',
        'supervisor_id': 's',
        'title': 'mt',
        'description': 'md'
    }

    def fake_get(url, **kw):
        if 'meetings' in url:
            return MagicMock(json=lambda: [m])
        if 'students' in url:
            return MagicMock(json=lambda: [{'user_id': 7}])
        if 'supervisors' in url:
            return MagicMock(json=lambda: [{'user_id': 8}])
        if 'users?id=eq.8' in url:
            return MagicMock(json=lambda: [{
                'first_name': 'A',
                'last_name': 'B',
                'telegram_id': 99
            }])
        if 'users?id=eq.7' in url:
            return MagicMock(json=lambda: [{
                'first_name': 'C',
                'last_name': 'D',
                'telegram_id': 100
            }])
        return MagicMock(json=lambda: [])

    monkeypatch.setattr(bot_module.requests, 'get', fake_get)
    sent = []

    async def fake_send_message(**kw):
        sent.append(kw)

    monkeypatch.setattr(bot_module.bot, "send_message", fake_send_message)
    monkeypatch.setattr(
        bot_module.requests, 'patch', lambda url, **kw: None
    )

    async def fs(sec):
        raise asyncio.CancelledError

    monkeypatch.setattr(bot_module.asyncio, 'sleep', fs)
    with pytest.raises(asyncio.CancelledError):
        await notification_about_events()
    assert sent and sent[0]['chat_id'] == 100
