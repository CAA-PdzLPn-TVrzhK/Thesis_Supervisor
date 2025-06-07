from pathlib import Path

DB_FILE = Path(__file__).parent / "thesis_db.sqlite3"
DATABASE_URL = f"sqlite+aiosqlite:///{DB_FILE}"