"use client";

import { useState } from "react";
import { GameScreen } from "./GameScreen";
import { CartridgeComponent } from "@/cartridge-react";
import { StartScreen } from "./StartScreen";
import { LevelScreen } from "./LevelScreen";

type ScreenState =
  | { type: "start" }
  | { type: "level_selector" }
  | { type: "game"; level: number };

const ScreenStateFactory = {
  start: (): ScreenState => ({ type: "start" }),
  levelSelector: (): ScreenState => ({ type: "level_selector" }),
  game: (level: number): ScreenState => ({ type: "game", level }),
};

export const TetrisCartridge: CartridgeComponent = (props) => {
  const [screen, setScreen] = useState<ScreenState>(() =>
    ScreenStateFactory.start(),
  );

  switch (screen.type) {
    case "start":
      return (
        <StartScreen
          onStart={() => setScreen(ScreenStateFactory.levelSelector())}
        />
      );
    case "level_selector":
      return (
        <LevelScreen
          controlEvents={props.controlEvents}
          onSelect={(event) => setScreen(ScreenStateFactory.game(event.level))}
        />
      );
    case "game":
      return (
        <GameScreen
          controlEvents={props.controlEvents}
          initialLevel={screen.level}
          onGameOver={() => {
            setScreen(ScreenStateFactory.levelSelector());
          }}
        />
      );
  }
};
