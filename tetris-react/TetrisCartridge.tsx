"use client";

import { useState } from "react";
import { GameScreen } from "./GameScreen";
import { CartridgeComponent } from "@/cartridge-react";
import { StartScreen } from "./StartScreen";
import { LevelScreen } from "./LevelScreen";

type ScreenState =
  | { type: "start" | "level selector" }
  | { type: "game"; level: number };

export const TetrisCartridge: CartridgeComponent = (props) => {
  const [screen, setScreen] = useState<ScreenState>({ type: "start" });

  switch (screen.type) {
    case "start":
      return (
        <StartScreen onStart={() => setScreen({ type: "level selector" })} />
      );
    case "level selector":
      return (
        <LevelScreen
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
            setScreen({ type: "level selector" });
          }}
        />
      );
  }
};
