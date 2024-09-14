"use client";

import { useState } from "react";
import { GameScreen } from "./GameScreen";
import { CartridgeComponent } from "@/cartridge-react";
import { StartScreen } from "./StartScreen";

export const TetrisCartridge: CartridgeComponent = (props) => {
  const [screen, setScreen] = useState<"start" | "game">("start");

  switch (screen) {
    case "start":
      return (
        <StartScreen
          controlEvents={props.controlEvents}
          onStart={() => setScreen("game")}
        />
      );
    case "game":
      return (
        <GameScreen
          controlEvents={props.controlEvents}
          onGameOver={() => {
            setScreen("start");
          }}
        />
      );
  }
};
