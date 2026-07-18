from io import BytesIO

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle


def build_pdf(content: str, title: str = "Generated Question Paper") -> bytes:
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    styles = getSampleStyleSheet()
    story = [Paragraph(title, styles["Title"]), Spacer(1, 12)]
    paragraphs = [Paragraph(line, styles["BodyText"]) for line in content.splitlines() if line.strip()]
    story.extend(paragraphs)
    doc.build(story)
    return buffer.getvalue()
