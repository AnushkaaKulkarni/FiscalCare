# backend/scripts/cbic_rates.py
import os, re, json, sys
from io import BytesIO

import requests
from bs4 import BeautifulSoup

# Optional deps: only used if Excel/PDF format demands
try:
    import pandas as pd
except Exception:
    pd = None

try:
    import pdfplumber
except Exception:
    pdfplumber = None

CBIC_PAGE = "https://cbic-gst.gov.in/gst-goods-services-rates.html"
CACHE_PATH = os.path.join(os.path.dirname(__file__), "gst_rates_cache.json")

def _find_latest_rate_file_url() -> str:
    """Find the most recent GST rate file (xlsx/xls/pdf) from the CBIC page."""
    resp = requests.get(CBIC_PAGE, timeout=30)
    resp.raise_for_status()
    soup = BeautifulSoup(resp.text, "html.parser")

    # Collect candidates with "rates" in the link
    candidates = []
    for a in soup.find_all("a", href=True):
        href = a["href"].strip()
        h = href.lower()
        if "rate" in h or "rates" in h:
            if any(h.endswith(ext) for ext in (".xlsx", ".xls", ".pdf")):
                if href.startswith("http"):
                    candidates.append(href)
                else:
                    candidates.append("https://cbic-gst.gov.in/" + href.lstrip("/"))
    # Heuristic: pick the first one that looks good
    if not candidates:
        raise RuntimeError("No suitable GST rates file found on CBIC page.")
    return candidates[0]

def _parse_excel(content: bytes):
    if pd is None:
        raise RuntimeError("pandas is required to parse Excel (pip install pandas openpyxl).")
    from pandas import read_excel

    mapping = {}
    try:
        xls = read_excel(BytesIO(content), sheet_name=None)  # dict of sheets
    except Exception as e:
        raise RuntimeError(f"Failed to read Excel: {e}")

    # Common column name guesses
    col_aliases = {
        "hsn": ["hsn", "hsn code", "hsn/sac", "hsn/sac code", "chapter/head"],
        "desc": ["description", "goods", "service description", "item description", "description of goods"],
        "rate": ["rate", "gst rate", "tax rate", "rate (%)", "igst", "total gst"],
    }

    def pick_col(cols, guesses):
        cols_lower = [str(c).strip().lower() for c in cols]
        for g in guesses:
            if g in cols_lower:
                return cols[cols_lower.index(g)]
        return None

    for sheet_name, df in xls.items():
        if df is None or df.empty:
            continue
        # Normalize headers
        df.columns = [str(c).strip() for c in df.columns]
        hsn_col  = pick_col(df.columns, col_aliases["hsn"]) or None
        desc_col = pick_col(df.columns, col_aliases["desc"]) or None
        rate_col = pick_col(df.columns, col_aliases["rate"]) or None

        if not (hsn_col or desc_col) or not rate_col:
            # try next sheet
            continue

        for _, row in df.iterrows():
            hsn  = str(row.get(hsn_col, "")).strip() if hsn_col else ""
            desc = str(row.get(desc_col, "")).strip().lower() if desc_col else ""
            rate_raw = str(row.get(rate_col, "")).strip()

            # Normalize rate (extract first number 0–28)
            rate_match = re.search(r"(\d{1,2})(?:\.\d+)?\s*%", rate_raw) or re.search(r"\b(\d{1,2})(?:\.\d+)?\b", rate_raw)
            if not rate_match:
                continue
            rate = f"{rate_match.group(1)}%"

            key = hsn if hsn and hsn.isdigit() else desc
            if not key:
                continue
            mapping[key] = {"description": desc, "rate": rate}
    return mapping

def _parse_pdf(content: bytes):
    if pdfplumber is None:
        raise RuntimeError("pdfplumber is required to parse PDF (pip install pdfplumber).")
    mapping = {}
    with pdfplumber.open(BytesIO(content)) as pdf:
        for page in pdf.pages:
            text = page.extract_text() or ""
            for line in text.splitlines():
                # Examples:
                #  "8471  Automatic data processing machines ...   18%"
                #  "998314 IT consulting services              18%"
                m = re.search(r"\b(\d{4,8})\b\s+(.+?)\s+(\d{1,2})\s*%$", line.strip())
                if m:
                    hsn, desc, rate = m.group(1), m.group(2).strip().lower(), m.group(3)
                    mapping[hsn] = {"description": desc, "rate": f"{rate}%"}
                else:
                    # Sometimes description-first then rate:
                    m2 = re.search(r"(.+?)\s+(\d{1,2})\s*%$", line.strip())
                    if m2:
                        desc, rate = m2.group(1).strip().lower(), m2.group(2)
                        mapping[desc] = {"description": desc, "rate": f"{rate}%"}
    return mapping

def refresh_cache():
    url = _find_latest_rate_file_url()
    content = requests.get(url, timeout=60).content

    if url.lower().endswith((".xlsx", ".xls")):
        mapping = _parse_excel(content)
    elif url.lower().endswith(".pdf"):
        mapping = _parse_pdf(content)
    else:
        raise RuntimeError(f"Unsupported file type: {url}")

    if not mapping:
        raise RuntimeError("Parsed mapping is empty.")

    with open(CACHE_PATH, "w", encoding="utf-8") as f:
        json.dump(mapping, f, ensure_ascii=False, indent=2)

    return {"ok": True, "count": len(mapping), "source": url}

def load_cache():
    if not os.path.exists(CACHE_PATH):
        return None
    with open(CACHE_PATH, "r", encoding="utf-8") as f:
        return json.load(f)

if __name__ == "__main__":
    # Usage: python cbic_rates.py [--refresh]
    if len(sys.argv) > 1 and sys.argv[1] == "--refresh":
        out = refresh_cache()
        print(json.dumps(out, indent=2))
    else:
        cache = load_cache()
        print(json.dumps({"has_cache": cache is not None, "items": len(cache or {})}))
