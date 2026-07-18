from pathlib import Path

from docx import Document


def extract_text(file_storage, filename: str) -> str:
    path = Path(file_storage.filename or filename)
    suffix = path.suffix.lower()

    if suffix == ".pdf":
        return extract_from_pdf(file_storage)
    if suffix == ".docx":
        return extract_from_docx(file_storage)
    return extract_from_txt(file_storage)


def extract_from_pdf(file_storage) -> str:
    file_storage.stream.seek(0)
    data = file_storage.read()
    if not data:
        return ""
    try:
        import fitz
    except Exception:
        return "PDF text extraction is unavailable in this environment. Please upload a text-based file or install a compatible PDF package."
    document = fitz.open(stream=data, filetype="pdf")
    texts = [page.get_text() for page in document]
    return "\n".join(text for text in texts if text)


def extract_from_docx(file_storage) -> str:
    file_storage.stream.seek(0)
    document = Document(file_storage.stream)
    return "\n".join(paragraph.text for paragraph in document.paragraphs if paragraph.text)


def extract_from_txt(file_storage) -> str:
    file_storage.stream.seek(0)
    return file_storage.read().decode("utf-8", errors="ignore")
