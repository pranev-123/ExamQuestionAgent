import re
from typing import Optional

COLLEGE_EMAIL_PATTERN = re.compile(r"^[A-Za-z0-9._%+-]+@rajalakshmi\.edu\.in$")
DEMO_PASSWORD = "Rec@123"


def validate_registration(email: str, password: str) -> Optional[str]:
    if not COLLEGE_EMAIL_PATTERN.match(email):
        return "Only Rajalakshmi Engineering College email is allowed."
    if password != DEMO_PASSWORD:
        return "Invalid password. Use the demo password Rec@123."
    return None


def validate_login(email: str, password: str) -> bool | str:
    if not COLLEGE_EMAIL_PATTERN.match(email):
        return "Only Rajalakshmi Engineering College email is allowed."
    if password != DEMO_PASSWORD:
        return "Invalid password. Use the demo password Rec@123."
    return True
