import sys
from pdf2image import convert_from_path
import pytesseract

# Point directly to your tesseract.exe
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

# Point to your Poppler bin folder
POPPLER_PATH = r"C:\Program_Files\poppler\poppler-25.11.0\Library\bin"


def extract_text_from_pdf(pdf_path: str) -> str:
    try:
        # Convert PDF pages to images
        pages = convert_from_path(pdf_path, dpi=300, poppler_path=POPPLER_PATH)

        chunks = []
        for page in pages:
            txt = pytesseract.image_to_string(page)
            if txt:
                chunks.append(txt)

        return "\n".join(chunks).strip()
    except Exception as e:
        # Send errors to stderr so Node can log them
        print(f"OCR_ERROR: {e}", file=sys.stderr)
        return ""


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("OCR_ERROR: No PDF path provided", file=sys.stderr)
        sys.exit(1)

    pdf_file = sys.argv[1]
    text = extract_text_from_pdf(pdf_file)

    if text:
        # Only the text on stdout
        print(text)
        sys.exit(0)
    else:
        sys.exit(1)
