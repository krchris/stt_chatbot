
const protocol = location.protocol === "https:" ? "wss" : "ws";
const host = location.hostname.includes("ngrok") ? location.host : "localhost:8000";
let ws = new WebSocket(`${protocol}://${host}/ws/audio`);

let mediaRecorder = null;
let audioChunks = [];
let stream = null;
let isRecording = false;
const recordBtn = document.getElementById("record-btn");

ws.onmessage = (event) => {
    console.log(`Server response: ${event.data}`); // debugging
    const data = JSON.parse(event.data);
    console.log(data); // debugging
    removeTypingIndicator();
    appendMessage('user', data.user);
    appendMessage('gpt', data.gpt);
};

ws.onclose = (event) => {
    console.log("WebSocket closed: ", event.code, event.reason);
    showError(`WebSocket closed: ${event.reason}`);
};

ws.onerror = (error) => {
    console.error("WebSocket error: ", error);
    showError("WebSocket error. Try refreshing.");
};

function toggleRecording() {
    if (isRecording) {
        stopRecording();
        isRecording = false;

    } else {
        startRecording();
        isRecording = true;
    }
}

function startRecording() {
    navigator.mediaDevices.getUserMedia({ audio: true }).then(s => {
        recordBtn.textContent = "Recording... Press to Stop";
        stream = s;

        const options = MediaRecorder.isTypeSupported("audio/webm")
            ? { mimeType: "audio/webm" }
            : {};

        mediaRecorder = new MediaRecorder(stream, options);
        audioChunks = [];

        mediaRecorder.ondataavailable = (e) => {
            audioChunks.push(e.data);
        };

        mediaRecorder.onstop = () => {
            const blob = new Blob(audioChunks, { type: 'audio/webm' });
            const reader = new FileReader();
            reader.onloadend = () => {
                try {
                    ws.send(JSON.stringify({ audio: reader.result }));
                    showTypingIndicator();
                } catch (err) {
                    showError("❌ Audio send failed.");
                }
            };
            reader.readAsDataURL(blob);

            stream.getTracks().forEach(track => track.stop());
            stream = null;
            isRecording = false;
            recordBtn.textContent = "Start Speaking";
        };

        mediaRecorder.start();
    }).catch(err => {
        showError("🎤 Mic access error.");
        console.error("getUserMedia error:", err);
        isRecording = false;
        recordBtn.textContent = "Start Speaking";
    });
}

function stopRecording() {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
        mediaRecorder.stop();
    }
    recordBtn.textContent = "Start Speaking";
}

function appendMessage(sender, text) {
    console.log(`Appending message: ${sender} - ${text}`); // debugging
    const log = document.getElementById("log");

    const wrapper = document.createElement("div");
    wrapper.className = `${sender}-wrapper message-wrapper`;

    const container = document.createElement("div");
    const containerClass = sender === "gpt" ? "gpt-message-container" : `${sender}-container`;
    container.className = `message-container ${containerClass}`;

    const label = document.createElement("div");
    label.className = "message-label";
    label.textContent = sender === "user" ? "You" : "GPT";

    const message = document.createElement("div");
    message.className = `message ${sender}`;
    message.textContent = text;

    container.appendChild(label);
    container.appendChild(message);
    wrapper.appendChild(container);
    log.appendChild(wrapper);
    log.scrollTop = log.scrollHeight;
}

function showTypingIndicator() {
    // const log = document.getElementById("log");
    // const messages = log.getElementsByClassName("message gpt");
    // const lastMessage = messages[messages.length - 1];
    // if (lastMessage?.textContent === "GPT is typing...") return;

    appendMessage('gpt', 'GPT is typing...');
}

function removeTypingIndicator() {
    const log = document.getElementById("log");
    const messages = log.getElementsByClassName("gpt");

    if (messages.length === 0) return;

    const lastMessage = messages[messages.length - 1];

    if (lastMessage.textContent.trim() === "GPT is typing...") {
        const wrapper = lastMessage.closest(".message-wrapper");
        if (wrapper) wrapper.remove();
    }
}

function showError(text) {
    appendMessage("gpt", `⚠️ ${text}`);
}
