# stt_chatbot

**server.py**
- serves server-sided API using FastAPI that handles receiving user's recorded audio input using Websockets.
- serves GET method from user and display index.html to the client side using static function

**whisper_stt.py**
- handles converting raw audio data into .wav file to transcribe audio.
  - to be inputed into ChatGPT for prompting an answer.

**chatgpt_client.py**
- handles getting response from ChatGPT using transcribed audio from whisper_stt.py and returning the result to the client side.

**index.html**
- handles showing necessary website details including chat container, record button for toggleRecording.

**style.css**
- handles style of the index.html to implement chatbot-like UI.

**script.js**
- handles getting user's audio input using mediaDevice and record the audio to send over to the sever side, integrating with server.py's Websockets simultaneously.
