"use client";

import { useState } from "react";
import { GameScreen } from "./GameScreen";
import { CartridgeComponent } from "@/cartridge-react";
import { StartScreen } from "./StartScreen";

type ScreenState = { type: "start" } | { type: "game"; level: number };

// class ScreenState {
//   value: { type: "start" } | { type: "game"; level: number };
//   constructor(value: { type: "start" } | { type: "game"; level: number }) {
//     this.value = value;
//   }
//   static start() {
//     return new ScreenState({ type: "start" });
//   }
//   static game(level: number) {
//     return new ScreenState({ type: "game", level });
//   }
// }

export const TetrisCartridge: CartridgeComponent = (props) => {
  const [screen, setScreen] = useState<ScreenState>({ type: "start" });

  switch (screen.type) {
    case "start":
      return (
        <StartScreen
          controlEvents={props.controlEvents}
          onStart={(event) => setScreen({ type: "game", level: event.level })}
        />
      );
    case "game":
      return (
        <GameScreen
          controlEvents={props.controlEvents}
          initialLevel={screen.level}
          onGameOver={() => {
            setScreen({ type: "start" });
          }}
        />
      );
  }
};
