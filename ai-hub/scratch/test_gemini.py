import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
print(f"API Key found: {'Yes' if api_key else 'No'}")

genai.configure(api_key=api_key)
model = genai.GenerativeModel("gemini-flash-latest")

try:
    print("Testing Gemini...")
    response = model.generate_content("Merhaba, SQL uzmanı mısın? Sadece 'Evet' veya 'Hayır' de.")
    print(f"Gemini Response: {response.text}")
except Exception as e:
    print(f"Error: {str(e)}")
