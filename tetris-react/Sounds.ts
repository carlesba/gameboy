import { useSpeaker } from "@/cartridge-react";
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
};

function useTetrisSpeaker() {
  const speaker = useSpeaker();
  const tetrisSpeaker = useMemo(() => {
    const { playSquare, playOscillator } = speaker;
    const sounds = {
      lineClearSound() {
        playSquare(800, 0.1);
        setTimeout(() => playSquare(1000, 0.1), 100);
        setTimeout(() => sounds.landSound(), 600);
      },
      gameOverSound() {
        playSquare(300, 0.3);
        setTimeout(() => playSquare(200, 0.3), 200);
        setTimeout(() => playSquare(100, 0.3), 600);
      },
      cursorSound() {
        playSquare(800, 0.05);
      },
      moveSound() {
        playSquare(400, 0.05);
      },
      rotateSound() {
        playSquare(600, 0.05);
      },
      landSound() {
        playOscillator("square", 40, 0.5);
        playOscillator("sawtooth", 30, 0.8);
        playOscillator("sawtooth", 50, 0.8);
      },
      selectSound() {
        playSquare(1000, 0.1);
      },
    };
    return sounds;
  }, [speaker]);

  return tetrisSpeaker;
}

export function useSounds() {
  const silent = !useGetSettings().sound;
  const tetrisSpeaker = useTetrisSpeaker();
  return silent ? SilentSpeaker : tetrisSpeaker;
}
