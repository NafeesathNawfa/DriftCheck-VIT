import io

from pypdf import PdfReader
import pytesseract
from PIL import Image


def extract_text_from_pdf(file_bytes: bytes) -> str:

    reader = PdfReader(
        io.BytesIO(file_bytes)
    )

    text = ""

    for page in reader.pages:

        page_text = page.extract_text()

        if page_text:
            text += page_text + "\n"

    return text.strip()


def ocr_image(image_bytes: bytes) -> str:

    image = Image.open(
        io.BytesIO(image_bytes)
    )

    return pytesseract.image_to_string(image)


def extract_pdf(file_bytes: bytes) -> str:

    text = extract_text_from_pdf(file_bytes)

    if len(text.strip()) > 50:
        return text

    # OCR fallback will be added here
    return text