import os
import threading
import warnings
from dotenv import load_dotenv

warnings.filterwarnings("ignore", category=FutureWarning)
import google.generativeai as genai

load_dotenv()

_key_lock = threading.Lock()
_key_index = 0

# Reason: Discover all configured Gemini API keys with their exact variable names from .env
def get_all_api_keys():
    load_dotenv()
    key_list = []
    # Check indexed variables
    for name in ["GEMINI_API_KEY1", "GEMINI_API_KEY2", "GEMINI_API_KEY3",
                 "GEMINI_API_KEY", "GEMINI_API_KEY_1", "GEMINI_API_KEY_2", "GEMINI_API_KEY_3"]:
        val = os.getenv(name)
        if val and val.strip():
            # Store tuple of (var_name, key_value)
            if not any(k[1] == val.strip() for k in key_list):
                key_list.append((name, val.strip()))
    return key_list

# Reason: Thread-safe round-robin API key rotation logging exact key variable name
def get_next_api_key():
    global _key_index
    keys = get_all_api_keys()
    if not keys:
        print("[GEMINI KEY ERROR] No GEMINI_API_KEY found in .env!")
        return None, None
    with _key_lock:
        name, key = keys[_key_index % len(keys)]
        _key_index = (_key_index + 1) % len(keys)
        masked = key[:6] + "..." + key[-4:] if len(key) > 10 else "***"
        return name, key, masked, len(keys)

# Reason: Get Gemini GenerativeModel configured with rotated API key and explicit log
def get_model(model_name: str = None, json_mode: bool = True, api_key: str = None):
    chosen_model = model_name or os.getenv("GEMINI_MODEL", "gemini-3.5-flash")
    if api_key:
        genai.configure(api_key=api_key)
        print(f"[GEMINI KEY] Using explicit key with Model: {chosen_model}")
    else:
        name, key, masked, total = get_next_api_key()
        if key:
            genai.configure(api_key=key)
            print(f"[GEMINI KEY] Active: {name} ({masked}) | Pool: {total} keys | Model: {chosen_model}")

    generation_config = {"temperature": 0.1}
    if json_mode:
        generation_config["response_mime_type"] = "application/json"
    return genai.GenerativeModel(model_name=chosen_model, generation_config=generation_config)
