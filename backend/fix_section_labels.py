"""
Fix "Unknown" section labels in existing legal_embeddings rows.
Run once from the backend directory:
  python fix_section_labels.py
"""
import os, re, httpx
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
KEY = os.getenv("SUPABASE_SERVICE_KEY") or os.getenv("SUPABASE_KEY")
HEADERS = {
    "apikey": KEY,
    "Authorization": f"Bearer {KEY}",
    "Content-Type": "application/json",
}

PATTERNS = [
    (r'[Ss]ection\s+(\d+[A-Z]?)', lambda m: f"Section {m.group(1)}"),
    (r'Sec\.\s*(\d+[A-Z]?)',       lambda m: f"Section {m.group(1)}"),
    (r'§\s*(\d+[A-Z]?)',           lambda m: f"Section {m.group(1)}"),
    (r'Chapter\s+(\d+)',           lambda m: f"Chapter {m.group(1)}"),
    # number-first: "308. Criminal..." at start of chunk
    (r'^(\d{1,3}[A-Z]?)\.\s+[A-Z]', lambda m: f"Section {m.group(1)}"),
]


def extract_section(text: str) -> str:
    head = text[:300]
    for pattern, fmt in PATTERNS:
        m = re.search(pattern, head, re.IGNORECASE | re.MULTILINE)
        if m:
            return fmt(m)
    return None  # None means "leave as-is"


def main():
    print("Fetching rows with Unknown sections...")
    # Fetch all rows where metadata->section == 'Unknown'
    # We have to page through since there could be many
    page_size = 1000
    offset = 0
    total_fixed = 0

    while True:
        resp = httpx.get(
            f"{SUPABASE_URL}/rest/v1/legal_embeddings",
            params={
                "select": "id,content,metadata",
                "metadata->>section": "eq.Unknown",
                "limit": page_size,
                "offset": offset,
            },
            headers=HEADERS,
            timeout=30,
        )
        rows = resp.json()
        if not rows:
            print("No more rows.")
            break

        print(f"  Processing batch of {len(rows)} rows (offset={offset})...")

        for row in rows:
            content = row.get("content", "")
            meta = row.get("metadata", {}) or {}
            new_section = extract_section(content)

            if new_section:
                meta["section"] = new_section
                patch_resp = httpx.patch(
                    f"{SUPABASE_URL}/rest/v1/legal_embeddings",
                    params={"id": f"eq.{row['id']}"},
                    json={"metadata": meta},
                    headers=HEADERS,
                    timeout=10,
                )
                if patch_resp.status_code < 300:
                    total_fixed += 1
                else:
                    print(f"  WARN: patch failed for {row['id']}: {patch_resp.text[:100]}")

        if len(rows) < page_size:
            break
        offset += page_size

    print(f"\nDone! Fixed {total_fixed} rows.")


if __name__ == "__main__":
    main()
