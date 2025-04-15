from faster_whisper import WhisperModel
import ffmpeg
import os

model = WhisperModel("medium", compute_type="float32")  # , device="cpu"


def convert_webm_to_wav(input_path, output_path):
    ffmpeg.input(input_path).output(output_path, ar=16000, ac=1).run(
        overwrite_output=True
    )


def transcribe_audio(webm_filename):
    wav_filename = webm_filename.replace(".webm", ".wav")
    convert_webm_to_wav(webm_filename, wav_filename)

    segments, _ = model.transcribe(wav_filename)
    res = " ".join([segment.text for segment in segments]).strip()

    os.remove(wav_filename)

    return res
