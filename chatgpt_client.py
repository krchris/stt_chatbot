from dotenv import load_dotenv
import openai
import os

load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")


def get_chatgpt_response(prompt):
    try:
        response = openai.chat.completions.create(
            model="gpt-4o", messages=[{"role": "user", "content": prompt}]
        )
        result = response.choices[0].message.content.strip()
        return result

    except openai.error.OpenAIError as e:
        print(f"OpenAI API error: {e}")
        return "Sorry, I couldn't process your request."
    except Exception as e:
        print(f"Unexpected error: {e}")
        return "Sorry, something went wrong."
