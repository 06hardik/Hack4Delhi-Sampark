import cv2
import time
import requests
import uuid
import threading
import os
from datetime import datetime, timezone

API_URL = os.getenv("CV_API_URL", "http://127.0.0.1:3000/count")
TICK = 10
RUN_FOR = 10 * 60

TMP_DIR = "cv_service/tmp"
os.makedirs(TMP_DIR, exist_ok=True)

LOTS = [
    {"lotId": "LOT_1", "video": "cv_service/parking1.mp4"},
    {"lotId": "LOT_2", "video": "cv_service/parking2.mp4"},
    {"lotId": "LOT_3", "video": "cv_service/parking3.mp4"},
    {"lotId": "LOT_4", "video": "cv_service/parking4.mp4"},
    {"lotId": "LOT_5", "video": "cv_service/parking5.mp4"},
]

start_time = time.time()
session = requests.Session()


def run_lot(lot):
    lot_id = lot["lotId"]
    cap = cv2.VideoCapture(lot["video"])
    if not cap.isOpened():
        print(f"[{lot_id}] Cannot open video")
        return

    fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
    total_frames = cap.get(cv2.CAP_PROP_FRAME_COUNT)
    duration = total_frames / fps if total_frames > 0 else 0

    print(f"[{lot_id}] Opened {lot['video']} fps={fps} duration={duration:.1f}s")

    tick_index = 1

    while True:
        now = time.time()
        elapsed = now - start_time
        if elapsed > RUN_FOR:
            print(f"[{lot_id}] Finished.")
            break

        next_tick = tick_index * TICK
        sleep_for = next_tick - elapsed
        if sleep_for > 0:
            time.sleep(sleep_for)

        desired_video_time = (tick_index * TICK) % duration
        frame_number = int(desired_video_time * fps)

        cap.set(cv2.CAP_PROP_POS_FRAMES, frame_number)
        ret, frame = cap.read()
        if not ret:
            print(f"[{lot_id}] Frame read failed at {desired_video_time:.1f}s")
            tick_index += 1
            continue

        ts = datetime.now(timezone.utc).isoformat()
        frame_id = f"cam-{lot_id}-{datetime.now().strftime('%Y%m%d-%H%M%S')}-{uuid.uuid4().hex[:6]}"
        tmp_path = os.path.join(TMP_DIR, f"{frame_id}.jpg")
        cv2.imwrite(tmp_path, frame)

        try:
            with open(tmp_path, "rb") as f:
                r = session.post(
                    API_URL,
                    files={"file": f},
                    data={"lotId": lot_id},
                    timeout=3,
                )

            if r.status_code == 200:
                print(f"[{lot_id} | tick {tick_index} | video {desired_video_time:.1f}s] OK")
            else:
                print(f"[{lot_id}] Rejected {r.status_code}: {r.text}")

        except Exception as e:
            print(f"[{lot_id}] Post failed:", e)

        tick_index += 1


def main():
    threads = []
    for lot in LOTS:
        t = threading.Thread(target=run_lot, args=(lot,), daemon=True)
        t.start()
        threads.append(t)

    for t in threads:
        t.join()


if __name__ == "__main__":
    main()
