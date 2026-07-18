# AI-Based Adaptive Examination Question Generator

This project combines a React + Vite frontend with a Flask backend that reuses the existing question generator in [main.py](main.py) without rewriting or replacing it.

## Features
- College-only authentication for @rajalakshmi.edu.in emails
- Demo login with password Rec@123
- File upload support for PDF, DOCX, and TXT
- Flask API endpoint /api/generate that calls the existing main() entry point
- History persistence via MongoDB with fallback to JSON
- PDF and DOCX download export

## Backend setup
1. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
2. Start the Flask server:
   ```bash
   python backend/app.py
   ```

## Frontend setup
1. Install Node dependencies:
   ```bash
   npm install
   ```
2. Start the Vite app:
   ```bash
   npm run dev
   ```

## Notes
- The backend uses [main.py](main.py) directly and never duplicates the AI logic.
- The current login flow uses the demo password Rec@123.
