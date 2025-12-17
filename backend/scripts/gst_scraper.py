import requests
from bs4 import BeautifulSoup
import fitz  # PyMuPDF
import json

GST_URL = "https://cbic-gst.gov.in/gst-goods-services-rates.html"

def fetch_latest_gst_rates():
    response = requests.get(GST_URL)
    response.raise_for_status()
    soup = BeautifulSoup(response.text, "html.parser")

    pdf_links = [a["href"] for a in soup.find_all("a", href=True) if "rates" in a["href"].lower()]
    if not pdf_links:
        return {"error": "No GST rate PDFs found"}

    pdf_url = pdf_links[0]
    if not pdf_url.startswith("http"):
        pdf_url = f"https://cbic-gst.gov.in/{pdf_url}"

    pdf_data = requests.get(pdf_url)
    pdf_data.raise_for_status()

    pdf_text = ""
    with fitz.open(stream=pdf_data.content, filetype="pdf") as doc:
        for page in doc:
            pdf_text += page.get_text("text")

    gst_map = {}
    current_rate = None

    for line in pdf_text.splitlines():
        line = line.strip()
        if not line:
            continue
        if "%" in line:
            for rate in ["0%", "5%", "12%", "18%", "28%"]:
                if rate in line:
                    current_rate = rate
        elif current_rate and any(c.isalpha() for c in line):
            gst_map[line.lower()] = current_rate

    return gst_map


if __name__ == "__main__":
    data = fetch_latest_gst_rates()
    print(json.dumps(data, ensure_ascii=False, indent=2))
