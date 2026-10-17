"""Synthesize the upbeat electronic track for the Grace promo (no third-party audio).

Usage: python tools/make_music.py
Writes assets/promo-music.m4a: 120 bpm, as long as the video (cues.json), kick, clap, hats, bass, chord stabs,
plus a whoosh at the swoosh transition and soft clicks where the cursor taps.
The beat grid (0.5 s per beat) is the same grid tools/build.mjs cuts on.
"""

import json
import subprocess
import wave
from pathlib import Path

import numpy as np

SR = 44100
BPM = 120
BEAT = 60 / BPM
ROOT = Path(__file__).resolve().parent.parent
# Length, clicks and whooshes come from tools/build.mjs.
CUES = json.loads((ROOT / "cues.json").read_text())
TOTAL = CUES["total"]
BARS = int(np.ceil(TOTAL / (4 * BEAT)))
CLICKS = CUES["clicks"]
WHOOSHES = CUES["whooshes"]
rng = np.random.default_rng(3)


def add(buf, at, sig, gain=1.0):
    a = int(at * SR)
    if a >= len(buf):
        return
    sig = sig[: len(buf) - a]
    buf[a:a + len(sig)] += sig * gain


def kick():
    t = np.arange(int(0.35 * SR)) / SR
    f = 50 + 90 * np.exp(-t * 30)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9)


def noise_burst(length, decay, hp):
    n = rng.standard_normal(int(length * SR))
    if hp:
        n = np.diff(n, prepend=0)
    t = np.arange(len(n)) / SR
    return n * np.exp(-t * decay)


def lowpass(x, a):
    y = np.empty_like(x)
    acc = 0.0
    for i in range(len(x)):
        acc += a * (x[i] - acc)
        y[i] = acc
    return y


def tone(freq, length, decay, harmonics=4):
    t = np.arange(int(length * SR)) / SR
    s = sum(np.sin(2 * np.pi * freq * k * t) / k for k in range(1, harmonics + 1))
    return s * np.exp(-t * decay)


def main():
    buf = np.zeros(int((TOTAL + 1) * SR))
    # C - G - Am - F, bright and simple.
    roots = [130.81, 98.00, 110.00, 87.31]
    chords = [[261.63, 329.63, 392.0], [246.94, 293.66, 392.0], [220.0, 261.63, 329.63], [220.0, 261.63, 349.23]]
    k, clap, hat = kick(), noise_burst(0.2, 18, False), noise_burst(0.06, 60, True)
    for bar in range(BARS):
        b0 = bar * 4 * BEAT
        intro = bar < 1
        outro = bar >= BARS - 2
        ci = bar % 4
        for beat in range(4):
            t = b0 + beat * BEAT
            if not intro and not outro:
                add(buf, t, k, 0.9)
                if beat in (1, 3):
                    add(buf, t, clap, 0.25)
            add(buf, t + BEAT / 2, hat, 0.12 if not intro else 0.06)
            # Bass: root on eighths, octave bounce.
            for e in range(2):
                f = roots[ci] * (2 if e else 1)
                if not intro:
                    add(buf, t + e * BEAT / 2, tone(f / 2, 0.22, 14, 3), 0.18)
        # Chord stabs on the off-beats of beats 1 and 3, plus a long pad.
        for off in (0.5, 2.5):
            for f in chords[ci]:
                add(buf, b0 + off * BEAT, tone(f, 0.3, 9, 3), 0.045)
        pad_t = np.arange(int(4 * BEAT * SR)) / SR
        pad = sum(np.sin(2 * np.pi * f * pad_t) + 0.5 * np.sin(2 * np.pi * f * 2.003 * pad_t) for f in chords[ci])
        env = np.minimum(1, pad_t / 0.3) * np.minimum(1, (4 * BEAT - pad_t) / 0.3)
        add(buf, b0, pad * env, 0.02)
    # Final hit and ring-out.
    end = (BARS - 2) * 4 * BEAT
    add(buf, end, k, 1.0)
    for f in chords[0]:
        add(buf, end, tone(f, 3.5, 1.2, 3), 0.06)
    # Whooshes and clicks.
    for w in WHOOSHES:
        n = rng.standard_normal(int(0.9 * SR))
        x = np.linspace(0, 1, len(n))
        y = lowpass(n, 0.06) * np.sin(np.pi * x) ** 2
        add(buf, w - 0.45, y, 0.9)
    for c in CLICKS:
        add(buf, c, tone(1800, 0.05, 90, 1), 0.25)
        add(buf, c, noise_burst(0.02, 200, True), 0.15)
    buf = buf[: int(TOTAL * SR)]
    fade = np.minimum(1, np.arange(len(buf)) / (0.05 * SR))
    buf = buf * fade
    buf = buf / np.abs(buf).max() * 0.9
    tmp = ROOT / "assets" / "_music.wav"
    with wave.open(str(tmp), "w") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(SR)
        wf.writeframes((buf * 32767).astype(np.int16).tobytes())
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(tmp), "-c:a", "aac", "-b:a", "160k", str(ROOT / "assets" / "promo-music.m4a")], check=True)
    tmp.unlink()
    print(f"{TOTAL:.1f}s")


if __name__ == "__main__":
    main()
