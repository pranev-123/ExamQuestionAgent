import json
import os
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List

from pymongo import MongoClient

from .config import MONGO_COLLECTION, MONGO_DB, MONGO_URI


class HistoryStore:
    def save(self, record: Dict[str, Any]) -> Dict[str, Any]:
        raise NotImplementedError

    def list(self) -> List[Dict[str, Any]]:
        raise NotImplementedError


class MongoHistoryStore(HistoryStore):
    def __init__(self) -> None:
        self.client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=3000)
        self.db = self.client[MONGO_DB]
        self.collection = self.db[MONGO_COLLECTION]

    def save(self, record: Dict[str, Any]) -> Dict[str, Any]:
        record.setdefault("created_at", datetime.utcnow().isoformat())
        result = self.collection.insert_one(record)
        record["_id"] = str(result.inserted_id)
        return record

    def list(self) -> List[Dict[str, Any]]:
        docs = list(self.collection.find({}, {"_id": 1, "student_name": 1, "department": 1, "subject": 1, "date": 1, "question_type": 1, "difficulty": 1, "generated_paper": 1, "created_at": 1}))
        for doc in docs:
            doc["_id"] = str(doc["_id"])
        return sorted(docs, key=lambda x: x.get("created_at", ""), reverse=True)


class JsonHistoryStore(HistoryStore):
    def __init__(self) -> None:
        self.path = Path(__file__).resolve().parent / "generated" / "history.json"
        self.path.parent.mkdir(parents=True, exist_ok=True)
        if not self.path.exists():
            self.path.write_text("[]", encoding="utf-8")

    def _load(self) -> List[Dict[str, Any]]:
        return json.loads(self.path.read_text(encoding="utf-8"))

    def _dump(self, records: List[Dict[str, Any]]) -> None:
        self.path.write_text(json.dumps(records, indent=2), encoding="utf-8")

    def save(self, record: Dict[str, Any]) -> Dict[str, Any]:
        record.setdefault("created_at", datetime.utcnow().isoformat())
        records = self._load()
        record["_id"] = str(len(records) + 1)
        records.append(record)
        self._dump(records)
        return record

    def list(self) -> List[Dict[str, Any]]:
        records = self._load()
        return sorted(records, key=lambda x: x.get("created_at", ""), reverse=True)


def get_history_store() -> HistoryStore:
    try:
        store = MongoHistoryStore()
        store.client.admin.command("ping")
        return store
    except Exception:
        return JsonHistoryStore()
