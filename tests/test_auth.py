import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from backend.auth import validate_login, validate_registration


def test_accepts_college_email_and_demo_password():
    assert validate_login("student@rajalakshmi.edu.in", "Rec@123") is True


def test_rejects_non_college_email():
    assert validate_registration("student@gmail.com", "Rec@123") == "Only Rajalakshmi Engineering College email is allowed."


def test_rejects_wrong_demo_password():
    assert validate_login("student@rajalakshmi.edu.in", "WrongPass") == "Invalid password. Use the demo password Rec@123."
