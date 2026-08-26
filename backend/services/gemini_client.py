import os
import google.generativeai as genai
from typing import Optional
from dotenv import load_dotenv

load_dotenv()

# Reason: Initialize Google Generative AI client using env variable
def init_gemini() -> bool:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return False
    genai.configure(api_key=api_key)
    return True

# Reason: Get Gemini GenerativeModel configured for JSON or text responses
def get_model(model_name: str = "gemini-2.0-flash", json_mode: bool = True):
    init_gemini()
    generation_config = {
        "temperature": 0.1,
    }
    if json_mode:
        generation_config["response_mime_type"] = "application/json"
    return genai.GenerativeModel(model_name=model_name, generation_config=generation_config)
