"use client";

import { useState } from "react";
import { GameScreen } from "./GameScreen";
import { CartridgeComponent } from "@/cartridge-react";
import { StartScreen } from "./StartScreen";
import { LevelScreen } from "./LevelScreen";
import { useScoreStore } from "./ScoreStore";
import { LeaderboardScreen } from "./LeaderboardScreen";

type ScreenState =
  | { type: "start" }
  | { type: "level_selector" }
  | { type: "leaderboard"; points: number }
  | { type: "game"; level: number };

const ScreenStateFactory = {
  start: (): ScreenState => ({ type: "start" }),
  levelSelector: (): ScreenState => ({ type: "level_selector" }),
  leaderboard: (points: number): ScreenState => ({
    type: "leaderboard",
    points,
  }),
  game: (level: number): ScreenState => ({ type: "game", level }),
};

export const TetrisCartridge: CartridgeComponent = () => {
  const [screen, setScreen] = useState<ScreenState>(() =>
    ScreenStateFactory.start(),
  );
  const scoreStore = useScoreStore();

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
          onSelect={(event) => setScreen(ScreenStateFactory.game(event.level))}
        />
      );
    case "leaderboard":
      return (
        <LeaderboardScreen
          points={screen.points}
          scores={scoreStore.rankings()}
          onSubmitScore={(event) => {
            scoreStore.submit(event.name, event.points);
          }}
          onFinish={() => setScreen(ScreenStateFactory.levelSelector())}
        />
      );
    case "game":
      return (
        <GameScreen
          initialLevel={screen.level}
          onGameOver={(event) => {
            if (scoreStore.qualifyingScore(event.score)) {
              setScreen(ScreenStateFactory.leaderboard(event.score));
            }
            setScreen(ScreenStateFactory.levelSelector());
          }}
        />
      );
  }
};
