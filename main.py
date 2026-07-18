from dataclasses import dataclass
import os

from dotenv import load_dotenv
from groq import Groq

# Load environment variables
load_dotenv()

API_KEY = os.getenv("GROQ_API_KEY")

if not API_KEY:
    raise ValueError("GROQ_API_KEY not found in .env")

client = Groq(api_key=API_KEY)

MODEL_NAME = "llama-3.3-70b-versatile"


@dataclass
class ExamQuestionInput:
    study_material: str
    question_type: str
    difficulty: str
    number_of_questions: int
    template: str = "Anna University"
    language: str = "English"
    version: str = "A"
    subject: str = "Engineering Mathematics"


@dataclass
class ExamQuestionOutput:
    question_paper: str


def main(input: ExamQuestionInput) -> ExamQuestionOutput:

    language_instruction = (
        "Generate the questions in Tamil." if input.language.lower() == "tamil" else "Generate the questions in English."
    )
    template_instruction = f"Use the {input.template} question paper template style." if input.template else ""

    prompt = f"""
You are an expert university examination paper setter.

Generate exactly {input.number_of_questions} {input.question_type} questions.

Subject:
{input.subject}

Template:
{input.template}

Version:
{input.version}

Difficulty:
{input.difficulty}

{language_instruction}

Rules:
- Use ONLY the study material provided below.
- Do NOT use external knowledge.
- Return ONLY the questions.
- {template_instruction}

Study Material:
{input.study_material}
"""

    try:
        response = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert university question paper generator."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.7,
        )

        return ExamQuestionOutput(
            question_paper=response.choices[0].message.content
        )

    except Exception as e:
        return ExamQuestionOutput(
            question_paper=f"Error: {e}"
        )


def generate_answer_key(question_paper: str, language: str = "English") -> str:
    language_instruction = "Generate the answer key in Tamil." if language.lower() == "tamil" else "Generate the answer key in English."

    prompt = f"""
You are an expert exam answer key generator.

Given the question paper below, provide a numbered answer key that matches each question exactly.
Return ONLY the answer key with concise answers.
{language_instruction}

Question Paper:
{question_paper}
"""

    try:
        response = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert examination answer key generator."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.3,
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"Error generating answer key: {e}"
