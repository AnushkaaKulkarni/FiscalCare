import sys, json, re

text = " ".join(sys.argv[1:]).lower()

def find(pattern, default=None):
    m = re.search(pattern, text, re.I)
    return m.group(1) if m else default

response = {
    "vendor": find(r"vendor\s+([a-z0-9\s\.&]+)"),
    "invoiceNo": find(r"invoice\s+(number\s*)?([a-z0-9\-\/]+)", "Unknown"),
    "date": find(r"(\d{1,2}\s*(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s*\d{4}|\d{1,2}[-/]\d{1,2}[-/]\d{2,4})", "Unknown"),
    "gstin": find(r"(?:gstin)?\s*([0-9]{2}[A-Z]{5}[0-9]{4}[A-Z0-9]{3})", None),
    "hsn": find(r"hsn\s*(code)?\s*([0-9]{4,8})", "Unknown"),
    "total": float(find(r"(?:total|amount)\s*(?:is)?\s*(\d+[,\d]*)", "0").replace(",", "")),
    "gstRate": int(find(r"(\d{1,2})\s*percent", "18"))
}

print(json.dumps(response))
