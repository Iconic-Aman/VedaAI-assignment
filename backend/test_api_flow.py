import os
import requests
import json
import time

BASE_URL = os.getenv("API_BASE_URL", "http://localhost:8000")
TOKEN = os.getenv("API_BEARER_TOKEN", "aman-secret")
HEADERS = {"Authorization": f"Bearer {TOKEN}"}

# Reason: Test all API endpoints in exact sequence and print comprehensive logs
def run_api_flow_test():
    print("=" * 60)
    print("STARTING END-TO-END API TEST FLOW")
    print(f"Base URL: {BASE_URL}")
    print(f"Auth Token: {TOKEN}")
    print("=" * 60)

    # 1. Health Check
    print("\n--- 1. Testing GET /health ---")
    try:
        t0 = time.time()
        res = requests.get(f"{BASE_URL}/health")
        print(f"Status: {res.status_code} (took {time.time()-t0:.2f}s)")
        print(f"Response: {res.json()}")
    except Exception as e:
        print(f"FAILED to connect to backend at {BASE_URL}: {e}")
        return

    # 2. Auth Check
    print("\n--- 2. Testing GET /api/test-auth ---")
    t0 = time.time()
    res = requests.get(f"{BASE_URL}/api/test-auth", headers=HEADERS)
    print(f"Status: {res.status_code} (took {time.time()-t0:.2f}s)")
    print(f"Response: {res.text}")

    # 3. Upload Question Paper
    print("\n--- 3. Testing POST /upload ---")
    pdf_path = "question.pdf"
    if not os.path.exists(pdf_path):
        print(f"Error: {pdf_path} not found in backend directory!")
        return

    t0 = time.time()
    with open(pdf_path, "rb") as f:
        files = {"question_paper": (pdf_path, f, "application/pdf")}
        res = requests.post(f"{BASE_URL}/upload", headers=HEADERS, files=files)

    print(f"Status: {res.status_code} (took {time.time()-t0:.2f}s)")
    print(f"Response: {res.text}")
    if res.status_code != 200:
        print("Upload failed, stopping flow.")
        return

    upload_data = res.json()
    session_id = upload_data.get("session_id")
    print(f"Created Session ID: {session_id}")

    # 4. Process Session
    print(f"\n--- 4. Testing POST /process/{session_id} ---")
    t0 = time.time()
    res = requests.post(f"{BASE_URL}/process/{session_id}", headers=HEADERS)
    print(f"Status: {res.status_code} (took {time.time()-t0:.2f}s)")
    print(f"Response: {res.text}")
    if res.status_code != 200:
        print("Process failed, stopping flow.")
        return

    # 5. Fetch Session Data
    print(f"\n--- 5. Testing GET /session/{session_id} ---")
    t0 = time.time()
    res = requests.get(f"{BASE_URL}/session/{session_id}", headers=HEADERS)
    print(f"Status: {res.status_code} (took {time.time()-t0:.2f}s)")
    session_data = res.json()

    questions = session_data.get("questions", [])
    print(f"\nExtracted Questions Count: {len(questions)}")
    for idx, q in enumerate(questions[:5]): # show first 5
        print(f"\n  [Q{idx+1}] ID: {q.get('id')}")
        print(f"  Label: {q.get('full_label')}")
        print(f"  Marks: {q.get('max_score')}")
        print(f"  Text: {q.get('text')[:100]}...")

    print("\n" + "=" * 60)
    print("ALL API FLOW TESTS COMPLETED SUCCESSFULLY!")
    print("=" * 60)

if __name__ == "__main__":
    run_api_flow_test()
