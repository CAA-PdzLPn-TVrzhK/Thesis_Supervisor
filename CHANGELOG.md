# Changelog

All notable changes to this project will be documented in this file.  
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),  
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Added
- Add the ability to analyze submitted works using artificial intelligence 

---

## [MVP v0] - 2025-06-16
### Added
- Created initial Telegram bot using BotFather.
- Deployed bot on the server.
- Implemented basic email authentication flow for users.

---

## [MVP v1] - 2025-06-28
### Added
- Email authorization for users via Telegram bot.
- Mini app with ability to open and view user information.
- Automatic role detection (student/supervisor).
- Back office with ability to receive and list students and supervisors.
- Student profile page with thesis title and description.
- Student calendar view in the mini app.

---

## [MVP v2] - 2025-07-16
### Added
- Notes in the calendar about upcoming meetings or task deadlines.
- Detailed view of time and content of tasks in the calendar.
- Execution steps with deadlines and descriptions in dashboard.
- Additional window for detailed task information.
- Ability to send solution submissions to the server.
- Change, add, and remove user information in the back office.
- Filter and sort users in the back office.
- Search for students by name in the back office.
- Notifications about upcoming deadlines/meetings via Telegram bot.
- Remember user's email for mini app login without re-authentication.

---

## [MVP v2.5] - 2025-07-14
### Added
- Notifications about new user registration requests to the back office.
- Ability for students to send registration requests for new students/supervisors when no data is available in the mini app.
- Personal score calculation based on solution submission time.

---

## [MVP v3] - 2025-07-21
### Added
- Ability in the supervisor's mini app to receive submitted solutions, review them, and send feedback to the server.
