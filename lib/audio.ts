export function playChime(type: "start" | "complete" | "warning" = "complete") {
  if (typeof window === "undefined") return;
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    const startTime = ctx.currentTime;

    if (type === "complete") {
      osc.type = "triangle";
      osc.frequency.setValueAtTime(523.25, startTime); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, startTime + 0.15); // E5
      osc.frequency.exponentialRampToValueAtTime(783.99, startTime + 0.3); // G5
      osc.frequency.exponentialRampToValueAtTime(1046.5, startTime + 0.45); // C6
      gain.gain.setValueAtTime(0.25, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.7);
      osc.start(startTime);
      osc.stop(startTime + 0.7);
    } else if (type === "start") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(440, startTime); // A4
      osc.frequency.exponentialRampToValueAtTime(880, startTime + 0.2); // A5
      gain.gain.setValueAtTime(0.2, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);
      osc.start(startTime);
      osc.stop(startTime + 0.35);
    } else {
      osc.type = "square";
      osc.frequency.setValueAtTime(400, startTime);
      osc.frequency.setValueAtTime(300, startTime + 0.1);
      gain.gain.setValueAtTime(0.15, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4);
      osc.start(startTime);
      osc.stop(startTime + 0.4);
    }

    osc.connect(gain);
    gain.connect(ctx.destination);
  } catch (e) {
    console.warn("Audio chime playback not supported or user interacted yet", e);
  }
}
