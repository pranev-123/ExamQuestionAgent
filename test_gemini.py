import os
from dotenv import load_dotenv
from google import genai

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

models = [
    "gemini-2.0-flash-001",
    "gemini-2.0-flash",
    "gemini-flash-latest",
    "gemini-3.5-flash",
]

for model in models:
    print(f"\nTesting {model}")

    try:
        response = client.models.generate_content(
            model=model,
            contents="Reply with ONLY the word OK"
        )

        print("SUCCESS")
        print(response.text)
        break

    except Exception as e:
        print("FAILED")
        print(e)