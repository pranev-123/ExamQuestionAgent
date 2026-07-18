import importlib.util
import io
import sys
from datetime import datetime
from pathlib import Path

from flask import Blueprint, jsonify, request, send_file

from .config import UPLOAD_FOLDER
from .database import get_history_store
from .export_docx import build_docx
from .export_pdf import build_pdf
from .file_reader import extract_text

bp = Blueprint("main", __name__)


@bp.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


@bp.route("/api/generate", methods=["POST"])
def generate_question_paper():
    try:
        if "study_material" not in request.files:
            return jsonify({"error": "study_material is required"}), 400

        uploaded_file = request.files["study_material"]
        question_type = request.form.get("question_type", "MCQ")
        difficulty = request.form.get("difficulty", "Medium")
        number_of_questions = int(request.form.get("number_of_questions", 5))
        template = request.form.get("template", "Anna University")
        language = request.form.get("language", "English")
        version = request.form.get("version", "A")
        subject = request.form.get("subject", "Engineering Mathematics")
        estimated_time = request.form.get("estimated_time", "")
        auto_generate_answer_key = request.form.get("auto_generate_answer_key", "false").lower() in ("true", "1", "yes")

        if uploaded_file.filename == "":
            return jsonify({"error": "No file selected"}), 400

        upload_path = UPLOAD_FOLDER / uploaded_file.filename
        uploaded_file.save(upload_path)
        uploaded_file.stream.seek(0)
        extracted_text = extract_text(uploaded_file, uploaded_file.filename)

        root = Path(__file__).resolve().parent.parent
        main_file = root / "main.py"
        spec = importlib.util.spec_from_file_location("exam_main", main_file)
        exam_main = importlib.util.module_from_spec(spec)
        sys.modules[spec.name] = exam_main
        spec.loader.exec_module(exam_main)

        input_data = exam_main.ExamQuestionInput(
            study_material=extracted_text,
            question_type=question_type,
            difficulty=difficulty,
            number_of_questions=number_of_questions,
            template=template,
            language=language,
            version=version,
            subject=subject,
        )
        output_data = exam_main.main(input_data)
        answer_key = None
        if auto_generate_answer_key:
            answer_key = exam_main.generate_answer_key(output_data.question_paper, language)

        run_mode = "auto" if auto_generate_answer_key else "manual"
        record = {
            "student_name": request.form.get("student_name", "Student"),
            "department": request.form.get("department", "CSE"),
            "subject": subject,
            "template": template,
            "language": language,
            "version": version,
            "estimated_time": estimated_time,
            "date": datetime.utcnow().strftime("%Y-%m-%d"),
            "question_type": question_type,
            "difficulty": difficulty,
            "run_mode": run_mode,
            "generated_paper": output_data.question_paper,
            "answer_key": answer_key,
        }
        history_store = get_history_store()
        history_store.save(record)

        response_payload = {
            "success": True,
            "question_paper": output_data.question_paper,
            "history_id": record.get("_id"),
        }
        if answer_key is not None:
            response_payload["answer_key"] = answer_key

        return jsonify(response_payload)
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


@bp.route("/api/answer-key", methods=["POST"])
def generate_answer_key():
    try:
        payload = request.get_json(silent=True) or {}
        question_paper = payload.get("question_paper", "")
        language = payload.get("language", "English")

        if not question_paper:
            return jsonify({"error": "question_paper is required"}), 400

        root = Path(__file__).resolve().parent.parent
        main_file = root / "main.py"
        spec = importlib.util.spec_from_file_location("exam_main", main_file)
        exam_main = importlib.util.module_from_spec(spec)
        sys.modules[spec.name] = exam_main
        spec.loader.exec_module(exam_main)

        answer_key = exam_main.generate_answer_key(question_paper, language)
        return jsonify({"success": True, "answer_key": answer_key})
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


@bp.route("/api/history", methods=["GET"])
def history():
    items = get_history_store().list()
    return jsonify(items)


@bp.route("/api/download/pdf", methods=["POST"])
def download_pdf():
    payload = request.get_json(silent=True) or {}
    content = payload.get("content", "")
    title = payload.get("title", "Generated Question Paper")
    pdf_bytes = build_pdf(content, title)
    return send_file(
        io.BytesIO(pdf_bytes),
        mimetype="application/pdf",
        as_attachment=True,
        download_name="question_paper.pdf",
    )


@bp.route("/api/download/docx", methods=["POST"])
def download_docx():
    payload = request.get_json(silent=True) or {}
    content = payload.get("content", "")
    title = payload.get("title", "Generated Question Paper")
    docx_bytes = build_docx(content, title)
    return send_file(
        io.BytesIO(docx_bytes),
        mimetype="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        as_attachment=True,
        download_name="question_paper.docx",
    )
