export function createSpeaker() {
  const audioCtx = new AudioContext();

  const playOscillator = (
    type: OscillatorType,
    frequency: number,
    duration: number,
  ) => {
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    oscillator.type = type;
    oscillator.frequency.value = frequency;

    oscillator.start();
    gainNode.gain.setValueAtTime(1, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.0001,
      audioCtx.currentTime + duration,
    );

    oscillator.stop(audioCtx.currentTime + duration);
  };

  return {
    playOscillator,
  };
}

export type Speaker = ReturnType<typeof createSpeaker>;
