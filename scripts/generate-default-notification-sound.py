"""Generate the default admin push notification sound (premium bell chime)."""
from __future__ import annotations

import math
import os
import struct
import wave
from pathlib import Path

SR = 48_000
ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "client" / "public" / "admin" / "sounds" / "notification-default.wav"


def bell_tone(freq: float, duration: float, amplitude: float = 1.0, attack: float = 0.004) -> list[float]:
    partials = [
        (0.5, 1.00),
        (1.0, 0.92),
        (1.5, 0.35),
        (2.0, 0.48),
        (2.5, 0.22),
        (3.0, 0.18),
        (3.5, 0.09),
        (4.2, 0.06),
    ]
    norm = sum(weight for _, weight in partials)
    count = int(SR * duration)
    samples: list[float] = []
    for i in range(count):
        t = i / SR
        attack_env = 1.0 - math.exp(-t / attack)
        decay_env = math.exp(-2.6 * t / duration)
        env = attack_env * decay_env
        value = 0.0
        for ratio, weight in partials:
            value += weight * math.sin(2 * math.pi * freq * ratio * t)
        samples.append(amplitude * env * value / norm)
    return samples


def soft_shimmer(freq: float, duration: float, amplitude: float = 0.25) -> list[float]:
    count = int(SR * duration)
    samples: list[float] = []
    for i in range(count):
        t = i / SR
        env = math.exp(-5.5 * t) * (1 - math.exp(-180 * t))
        mod = 1 + 0.004 * math.sin(2 * math.pi * 5.5 * t)
        samples.append(amplitude * env * math.sin(2 * math.pi * freq * mod * t))
    return samples


def mix_at(timeline: list[float], start: float, samples: list[float]) -> None:
    index = int(start * SR)
    for offset, sample in enumerate(samples):
        pos = index + offset
        if pos < len(timeline):
            timeline[pos] += sample


def soft_clip(value: float, threshold: float = 0.85) -> float:
    if abs(value) <= threshold:
        return value
    sign = 1.0 if value > 0 else -1.0
    excess = abs(value) - threshold
    return sign * (threshold + math.tanh(excess * 3) * (1 - threshold))


def generate() -> None:
    total_sec = 1.65
    timeline = [0.0] * int(SR * total_sec)

    mix_at(timeline, 0.00, bell_tone(392.00, 0.75, 0.58))
    mix_at(timeline, 0.10, bell_tone(523.25, 0.70, 0.52))
    mix_at(timeline, 0.22, bell_tone(659.25, 0.85, 0.56))
    mix_at(timeline, 0.38, bell_tone(783.99, 1.20, 0.62))
    mix_at(timeline, 0.42, soft_shimmer(1046.50, 0.90, 0.22))
    mix_at(timeline, 0.55, bell_tone(1046.50, 0.95, 0.38))

    for delay, gain in ((0.06, 0.12), (0.11, 0.07), (0.17, 0.04)):
        offset = int(delay * SR)
        for i in range(offset, len(timeline)):
            timeline[i] += timeline[i - offset] * gain * 0.5

    peak = max(max(abs(sample) for sample in timeline), 1e-9)
    timeline = [soft_clip(sample / peak * 0.95) for sample in timeline]

    fade_count = int(0.05 * SR)
    for i in range(fade_count):
        pos = len(timeline) - fade_count + i
        timeline[pos] *= (fade_count - i) / fade_count

    OUT.parent.mkdir(parents=True, exist_ok=True)
    with wave.open(str(OUT), "w") as handle:
        handle.setnchannels(1)
        handle.setsampwidth(2)
        handle.setframerate(SR)
        frames = b"".join(
            struct.pack("<h", max(-32767, min(32767, int(sample * 32767)))) for sample in timeline
        )
        handle.writeframes(frames)

    print(f"Wrote {OUT} ({len(frames)} bytes, {total_sec}s)")


if __name__ == "__main__":
    generate()
