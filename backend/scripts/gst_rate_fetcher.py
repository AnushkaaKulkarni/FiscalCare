import os
import re
import json
import requests
import pandas as pd
import pdfplumber
from bs4 import BeautifulSoup
from io import BytesIO
import sys

CBIC_URL = "https://cbic-gst.gov.in/gst-goods-services-rates.html"
CACHE_FILE = os.path.join(os.path.dirname(__file__), "../gst_rates_2025.json")

def fetch_latest_cbic_link():
    """Scrape CBIC page for latest GST rate Excel/PDF link."""
    response = requests.get(CBIC_URL)
    response.raise_for_status()
    soup = BeautifulSoup(response.text, "html.parser")

    for link in soup.find_all("a", href=True):
        href = link["href"]
        if any(ext in href.lower() for ext in [".xlsx", ".xls", ".pdf"]) and "rates" in href.lower():
            full_url = href if href.startswith("http") else "https://cbic-gst.gov.in/" + href.lstrip("/")
            return full_url
    raise RuntimeError("Could not find GST rate file link on CBIC site.")

def parse_excel(content):
    dfs = pd.read_excel(BytesIO(content), sheet_name=None)
    mapping = {}
    for sheet, df in dfs.items():
        for _, row in df.iterrows():
            desc = str(row.get("Description", "")).strip().lower()
            hsn = str(row.get("HSN", "")).strip()
            rate = str(row.get("Rate", "")).strip()
            if desc and rate:
                mapping[hsn or desc] = {"description": desc, "rate": rate}
    return mapping

def parse_pdf(content):
    mapping = {}
    with pdfplumber.open(BytesIO(content)) as pdf:
        for page in pdf.pages:
            text = page.extract_text()
            if not text:
                continue
            for line in text.split("\n"):
                match = re.match(r"(\d+)\s+(.*?)\s+(\d+)%", line)
                if match:
                    hsn, desc, rate = match.groups()
                    mapping[hsn] = {"description": desc.lower(), "rate": rate}
    return mapping

def fetch_and_cache_cbic_rates():
    if os.path.exists(CACHE_FILE):
        with open(CACHE_FILE, "r") as f:
            return json.load(f)

    link = fetch_latest_cbic_link()
    print(f"Downloading GST data from: {link}")
    content = requests.get(link).content
    mapping = parse_excel(content) if link.endswith(("xlsx", "xls")) else parse_pdf(content)

    with open(CACHE_FILE, "w") as f:
        json.dump(mapping, f, indent=2)
    return mapping

GST_DATA = fetch_and_cache_cbic_rates()

def get_gst_rate_by_keyword(keyword):
    keyword = keyword.lower()
    for item in GST_DATA.values():
        if keyword in item["description"]:
            return item["rate"]
    return "18% (default)"

# When called from Node.js
if __name__ == "__main__":
    if len(sys.argv) > 1:
        keyword = sys.argv[1]
        rate = get_gst_rate_by_keyword(keyword)
        print(json.dumps({"keyword": keyword, "rate": rate}))
    else:
        print(json.dumps({"error": "No keyword provided"}))
