import os
import google.generativeai as genai

genai.configure(api_key=os.getenv("AIzaSyDObtDMuIEH9qmOXErZgSSjJZMXbINtYME"))

print("Available Gemini models:")
for model in genai.list_models():
    print(model.name)
