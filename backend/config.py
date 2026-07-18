import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
UPLOAD_FOLDER = BASE_DIR / "uploads"
GENERATED_FOLDER = BASE_DIR / "generated"
UPLOAD_FOLDER.mkdir(parents=True, exist_ok=True)
GENERATED_FOLDER.mkdir(parents=True, exist_ok=True)

SECRET_KEY = os.getenv("SECRET_KEY", "rec-ai-secret")
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
MONGO_DB = os.getenv("MONGO_DB", "exam_question_agent")
MONGO_COLLECTION = os.getenv("MONGO_COLLECTION", "history")
