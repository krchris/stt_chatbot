from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from whisper_stt import transcribe_audio
from chatgpt_client import get_chatgpt_response
import base64
import uuid
import os

app = FastAPI()

# CORS 설정
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

app.mount("/static", StaticFiles(directory="frontend"), name="static")


@app.get("/")
async def get():
    return FileResponse("./frontend/index.html", status_code=200)


@app.websocket("/ws/audio")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_json()
            audio_base64 = data.get("audio")
            if audio_base64:
                audio_bytes = base64.b64decode(audio_base64.split(",")[1])
                filename = f"temp_{uuid.uuid4()}.webm"
                with open(filename, "wb") as f:
                    f.write(audio_bytes)

                text = transcribe_audio(filename)
                # Prompting transcribed text
                print(f"Transcribed text: {text}")
                os.remove(filename)
                reply = get_chatgpt_response(text)
                # Prompting ChatGPT reply
                print(f"ChatGPT reply: {reply}")

                await websocket.send_json({"user": text, "gpt": reply})
    except Exception as e:
        print(f"Error: {type(e).__name__} - {e}")
