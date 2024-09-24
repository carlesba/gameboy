"use client";

import { Speaker } from "@/cartridge";
import { createContext, useContext } from "react";

const AudioContext = createContext<Speaker | null>(null);

export type { Speaker };

export function AudioProvider(props: {
  value: Speaker | null;
  children: React.ReactNode;
}) {
  return (
    <AudioContext.Provider value={props.value}>
      {props.children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  return useContext(AudioContext);
}
