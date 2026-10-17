"""Build the soundtrack and scene timing for the Grace demo video.

Usage: python tools/make_audio.py <dir with one <id>.wav per line of voiceover.txt>

Writes:
  assets/soundtrack.m4a  voiceover + a soft music bed + whooshes, music ducked under the voice
  timing.js              scene start times and durations, read by index.html and landscape.html

The music bed and whooshes are synthesized here from sine waves and noise,
so the soundtrack has no third-party licence.
"""

import json
import subprocess
import sys
import wave
from pathlib import Path

import numpy as np

SR = 44100
LEAD = 0.25  # silence before each voice line
TAIL = 0.35  # silence after each voice line
END_HOLD = 1.8  # extra time on the closing card
ROOT = Path(__file__).resolve().parent.parent


def read_wav(path):
    with wave.open(str(path)) as w:
        sr, n, ch = w.getframerate(), w.getnframes(), w.getnchannels()
        data = np.frombuffer(w.readframes(n), dtype=np.int16).astype(np.float32) / 32768
    if ch > 1:
        data = data.reshape(-1, ch).mean(axis=1)
    # Resample to SR with linear interpolation (good enough for speech).
    t_old = np.arange(len(data)) / sr
    t_new = np.arange(int(len(data) * SR / sr)) / SR
    data = np.interp(t_new, t_old, data).astype(np.float32)
    # Trim the silence the TTS leaves at both ends, so the gaps between scenes stay short.
    loud = np.nonzero(np.abs(data) > 0.01)[0]
    if len(loud):
        data = data[max(0, loud[0] - int(0.03 * SR)) : loud[-1] + int(0.08 * SR)]
    return data


def music_bed(seconds):
    """A calm I-V-vi-IV pad in C major with a soft plucked arpeggio, 84 bpm."""
    t = np.arange(int(seconds * SR)) / SR
    beat = 60 / 84
    bar = beat * 4
    chords = [
        [261.63, 329.63, 392.00, 493.88],  # Cmaj7
        [196.00, 293.66, 392.00, 493.88],  # G
        [220.00, 261.63, 329.63, 392.00],  # Am7
        [174.61, 261.63, 349.23, 440.00],  # Fmaj7
    ]
    out = np.zeros_like(t)
    n_bars = int(np.ceil(seconds / bar))
    for b in range(n_bars):
        freqs = chords[b % 4]
        start = int(b * bar * SR)
        end = min(len(t), int((b + 1) * bar * SR) + int(0.6 * SR))
        seg = t[start:end] - b * bar
        env = np.minimum(1, seg / 0.8) * np.minimum(1, np.maximum(0, (bar + 0.6 - seg) / 0.9))
        pad = sum(np.sin(2 * np.pi * f / 2 * seg) * 0.5 + np.sin(2 * np.pi * f * 1.003 * seg) * 0.25 for f in freqs)
        out[start:end] += pad * env * 0.05
        # Arpeggio: one soft pluck per beat, an octave up.
        for k in range(4):
            ps = int((b * bar + k * beat) * SR)
            if ps >= len(t):
                break
            pe = min(len(t), ps + int(1.2 * SR))
            pt = t[ps:pe] - (b * bar + k * beat)
            f = freqs[k] * 2
            out[ps:pe] += np.sin(2 * np.pi * f * pt) * np.exp(-pt * 4) * 0.06
    # Fade in and out.
    fade = np.minimum(1, t / 2.0) * np.minimum(1, (seconds - t) / 3.0)
    return (out * fade).astype(np.float32)


def whoosh(length=0.7):
    rng = np.random.default_rng(7)
    n = int(length * SR)
    noise = rng.standard_normal(n).astype(np.float32)
    # Sweep a one-pole low-pass from dark to bright and back.
    x = np.linspace(0, 1, n)
    cutoff = 0.02 + 0.25 * np.sin(np.pi * x) ** 2
    y = np.zeros(n, dtype=np.float32)
    acc = 0.0
    for i in range(n):
        acc += cutoff[i] * (noise[i] - acc)
        y[i] = acc
    env = np.sin(np.pi * x) ** 2
    return y * env * 0.5


def main():
    vo_dir = Path(sys.argv[1])
    ids = [ln.split("|", 1)[0] for ln in (ROOT / "voiceover.txt").read_text().splitlines() if ln.strip()]
    lines = [read_wav(vo_dir / f"{i}.wav") for i in ids]
    scenes, cursor = [], 0.0
    for i, (sid, line) in enumerate(zip(ids, lines)):
        dur = LEAD + len(line) / SR + TAIL + (END_HOLD if i == len(lines) - 1 else 0)
        scenes.append({"id": sid, "start": round(cursor, 3), "duration": round(dur, 3), "voice": round(len(line) / SR, 3)})
        cursor += dur
    total = cursor

    voice = np.zeros(int(total * SR) + SR, dtype=np.float32)
    for s, line in zip(scenes, lines):
        a = int((s["start"] + LEAD) * SR)
        voice[a:a + len(line)] += line

    # Duck the music under the voice: follow the voice envelope, smoothed.
    env = np.abs(voice)
    win = int(0.25 * SR)
    csum = np.concatenate([[0.0], np.cumsum(env, dtype=np.float64)])
    idx = np.arange(len(env))
    lo, hi = np.clip(idx - win // 2, 0, len(env)), np.clip(idx + win // 2, 0, len(env))
    env = ((csum[hi] - csum[lo]) / win).astype(np.float32)
    duck = 1 - 0.65 * np.clip(env / 0.03, 0, 1)
    music = music_bed(len(voice) / SR) * duck

    fx = np.zeros_like(voice)
    w = whoosh()
    for s in scenes[1:]:
        a = max(0, int((s["start"] - 0.35) * SR))
        fx[a:a + len(w)] += w[: len(fx) - a]

    mix = voice * 1.0 + music * 1.0 + fx * 0.35
    mix = mix / max(1.0, np.abs(mix).max() / 0.95)
    tmp = ROOT / "assets" / "_mix.wav"
    with wave.open(str(tmp), "w") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(SR)
        wf.writeframes((mix * 32767).astype(np.int16).tobytes())
    subprocess.run(
        ["ffmpeg", "-v", "error", "-y", "-i", str(tmp), "-c:a", "aac", "-b:a", "160k", str(ROOT / "assets" / "soundtrack.m4a")],
        check=True,
    )
    tmp.unlink()
    (ROOT / "timing.js").write_text(
        "// Generated by tools/make_audio.py from the voiceover lengths. Do not edit by hand.\n"
        f"window.TIMING = {json.dumps({'total': round(total, 3), 'scenes': scenes})};\n"
    )
    print(f"total {total:.2f}s")


if __name__ == "__main__":
    main()
