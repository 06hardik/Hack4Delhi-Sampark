from fastapi import FastAPI, UploadFile, File, Form
from ultralytics import YOLO
import cv2
import numpy as np
import time
import uuid
import requests
import datetime
import os
import threading
import queue
from collections import deque

# ---------------- CONFIG ----------------

BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000/api/events/count")
SOURCE_NAME = os.getenv("SOURCE_NAME", "cv-yolo-v8")
MAX_BUFFER = int(os.getenv("MAX_BUFFER", "100"))
SMOOTHING_WINDOW = int(os.getenv("SMOOTHING_WINDOW", "5"))
MAX_TIMESTAMP_DRIFT_SEC = 5 * 60  # 5 minutes

# ----------------------------------------

app = FastAPI(title="CV Service", version="1.0")

model = YOLO("yolov8n.pt")

event_buffer = queue.Queue(maxsize=MAX_BUFFER)
smoothing_window = deque(maxlen=SMOOTHING_WINDOW)

startup_time = datetime.datetime.now(datetime.timezone.utc)
last_backend_ok = None


# ----------- BACKGROUND SENDER -------------

def sender_loop():
    global last_backend_ok

    while True:
        payload = event_buffer.get()
        backoff = [1, 2, 4, 10]

        for delay in backoff:
            try:
                r = requests.post(BACKEND_URL, json=payload, timeout=3)
                if r.status_code == 200:
                    last_backend_ok = datetime.datetime.now(datetime.timezone.utc)
                    break
                elif r.status_code == 400:
                    print("Dropped invalid payload:", payload)
                    break
            except Exception:
                time.sleep(delay)

        event_buffer.task_done()


# -------------------------------------------

@app.on_event("startup")
def startup():
    # Warmup model
    dummy = np.zeros((640, 640, 3), dtype=np.uint8)
    model(dummy)

    threading.Thread(target=sender_loop, daemon=True).start()
    print("CV service started.")


@app.on_event("shutdown")
def shutdown():
    print("CV service shutting down.")


# ---------------- HEALTH -------------------

@app.get("/health/live")
def live():
    return {"status": "alive"}


@app.get("/health/ready")
def ready():
    if last_backend_ok is None:
        return {"status": "starting", "backend": "unknown"}
    return {"status": "ready", "backend": "ok", "last_backend_ok": last_backend_ok.isoformat()}


@app.get("/health")
def health():
    return {
        "status": "ok",
        "uptime_sec": (datetime.datetime.now(datetime.timezone.utc) - startup_time).total_seconds(),
        "buffer_size": event_buffer.qsize(),
        "backend_url": BACKEND_URL,
    }


# ---------------- API ----------------------

@app.post("/count")
async def count(
    file: UploadFile = File(...),
    lotId: str = Form(...)
):
    img_bytes = await file.read()
    img = cv2.imdecode(np.frombuffer(img_bytes, np.uint8), cv2.IMREAD_COLOR)

    if img is None:
        return {"error": "Invalid image"}

    results = model(img)[0]

    raw_count = int(len(results.boxes)) if results.boxes is not None else 0
    conf = float(results.boxes.conf.mean()) if raw_count else 1.0

    smoothing_window.append(raw_count)
    count = int(sorted(smoothing_window)[len(smoothing_window) // 2])

    now = datetime.datetime.now(datetime.timezone.utc)
    timestamp = now.isoformat()

    frame_id = f"cam-{lotId}-{now.strftime('%Y%m%d-%H%M%S')}-{uuid.uuid4().hex[:6]}"

    payload = {
        "lotId": lotId,
        "timestamp": timestamp,
        "count": count,
        "source": SOURCE_NAME,
        "frameId": frame_id,
        "confidence": round(conf, 3),
    }

    # -------- Validation --------

    if not isinstance(count, int) or count < 0 or count > 10000:
        return {"error": "Count out of allowed range"}

    if not (0.0 <= payload["confidence"] <= 1.0):
        return {"error": "Confidence out of allowed range"}

    ts = datetime.datetime.fromisoformat(timestamp)
    if abs((ts - now).total_seconds()) > MAX_TIMESTAMP_DRIFT_SEC:
        return {"error": "Timestamp drift too large"}

    if len(str(payload).encode("utf-8")) > 10_000:
        return {"error": "Payload too large"}

    # -------- Buffer handling --------

    if event_buffer.full():
        try:
            event_buffer.get_nowait()
        except queue.Empty:
            pass

    event_buffer.put(payload)

    return payload
