"use client";

import { Speaker, useAudio } from "@/cartridge-react";
import { useMemo } from "react";
import { useGetSettings } from "./Settings";

type Play = () => unknown;
type TetrisSpeaker = {
  moveSound: Play;
  rotateSound: Play;
  landSound: Play;
  lineClearSound: Play;
  gameOverSound: Play;
  selectSound: Play;
  cursorSound: Play;
  startSound: Play;
};

const Noop = () => {};
const SilentSpeaker: TetrisSpeaker = {
  moveSound: Noop,
  rotateSound: Noop,
  landSound: Noop,
  lineClearSound: Noop,
  gameOverSound: Noop,
  selectSound: Noop,
  cursorSound: Noop,
  startSound: Noop,
};

function useTetrisSpeaker() {
  const audio = useAudio();
  const tetrisSpeaker = useMemo(() => {
    const playOscillator: Speaker["playOscillator"] = (
      type,
      frequency,
      duration,
    ) => audio?.playOscillator(type, frequency, duration);

    const sounds = {
      lineClearSound() {
        playOscillator("square", 800, 0.1);
        setTimeout(() => playOscillator("square", 1000, 0.1), 100);
        setTimeout(() => sounds.landSound(), 600);
      },
      gameOverSound() {
        playOscillator("square", 300, 0.3);
        setTimeout(() => playOscillator("square", 200, 0.3), 200);
        setTimeout(() => playOscillator("square", 100, 0.3), 600);
      },
      cursorSound() {
        playOscillator("square", 800, 0.05);
      },
      startSound() {
        playOscillator("triangle", 880, 0.3);
        setTimeout(() => playOscillator("triangle", 1760, 0.9), 100);
      },
      moveSound() {
        playOscillator("square", 400, 0.05);
      },
      rotateSound() {
        playOscillator("square", 600, 0.05);
      },
      landSound() {
        playOscillator("square", 40, 0.5);
        playOscillator("sawtooth", 30, 0.8);
        playOscillator("sawtooth", 50, 0.8);
      },
      selectSound() {
        playOscillator("square", 1000, 0.1);
      },
    };
    return sounds;
  }, [audio]);

  return tetrisSpeaker;
}

export function useSounds() {
  const silent = !useGetSettings().sound;
  const tetrisSpeaker = useTetrisSpeaker();
  return silent ? SilentSpeaker : tetrisSpeaker;
}
