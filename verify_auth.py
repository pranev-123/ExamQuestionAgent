import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
from backend.auth import validate_login, validate_registration

print('student@rajalakshmi.edu.in / Rec@123 ->', validate_login('student@rajalakshmi.edu.in', 'Rec@123'))
print('student@gmail.com / Rec@123 ->', validate_registration('student@gmail.com', 'Rec@123'))
print('student@rajalakshmi.edu.in / WrongPass ->', validate_login('student@rajalakshmi.edu.in', 'WrongPass'))
