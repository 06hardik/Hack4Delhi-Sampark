import requests
import sys
import time
from pathlib import Path

CV_URL = "http://127.0.0.1:7000/count"
LOT_ID = "LOT_1"

def test(image_path: str):
    image_path = Path(image_path)

    if not image_path.exists():
        print("❌ File not found:", image_path)
        return

    with open(image_path, "rb") as f:
        files = {"file": (image_path.name, f, "image/jpeg")}
        data = {"lotId": LOT_ID}

        start = time.time()
        r = requests.post(CV_URL, files=files, data=data, timeout=10)
        elapsed = round(time.time() - start, 2)

    print("\nStatus:", r.status_code)
    print("Latency:", elapsed, "sec")

    try:
        print("Response:", r.json())
    except Exception:
        print("Raw response:", r.text)


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python test_count.py path/to/image.jpg")
        sys.exit(1)

    test(sys.argv[1])
