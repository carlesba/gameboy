"use client";

import { useState } from "react";
import { GameScreen } from "./GameScreen";
import { CartridgeComponent } from "@/cartridge-react";
import { StartScreen } from "./StartScreen";
import { LevelScreen } from "./LevelScreen";
import { useScoreStore } from "../Scores";
import { LeaderboardScreen } from "./LeaderboardScreen";
import { MenuScreen } from "./MenuScreen";
import { CreditsScreen } from "./CreditsScreen";
import { HowToPlayScreen } from "./HowToPlayScreen";
import { SettingsScreen } from "./SettingsScreen";

type ScreenState =
  | { type: "start" }
  | { type: "menu" }
  | { type: "level_selector" }
  | { type: "credits" }
  | { type: "howto" }
  | { type: "settings" }
  | { type: "leaderboard"; points: number }
  | { type: "game"; level: number };

const ScreenStateFactory = {
  start: (): ScreenState => ({ type: "start" }),
  menu: (): ScreenState => ({ type: "menu" }),
  levelSelector: (): ScreenState => ({ type: "level_selector" }),
  credits: (): ScreenState => ({ type: "credits" }),
  howToPlay: (): ScreenState => ({ type: "howto" }),
  settings: (): ScreenState => ({ type: "settings" }),
  leaderboard: (points: number): ScreenState => ({
    type: "leaderboard",
    points,
  }),
  game: (level: number): ScreenState => ({ type: "game", level }),
};

export const TetrisScreens: CartridgeComponent = () => {
  const [screen, setScreen] = useState<ScreenState>(() =>
    ScreenStateFactory.menu(),
  );
  const scoreStore = useScoreStore();

  switch (screen.type) {
    case "start":
      return (
        <StartScreen onStart={() => setScreen(ScreenStateFactory.menu())} />
      );
    case "menu":
      return (
        <MenuScreen
          onSelect={(event) => {
            switch (event.option) {
              case "quickPlay":
                setScreen(ScreenStateFactory.game(0));
                break;
              case "selectLevel":
                setScreen(ScreenStateFactory.levelSelector());
                break;
              case "credits":
                setScreen(ScreenStateFactory.credits());
                break;
              case "howToPlay":
                setScreen(ScreenStateFactory.howToPlay());
                break;
              case "leaderboard":
                setScreen(ScreenStateFactory.leaderboard(0));
                break;
              case "settings":
                setScreen(ScreenStateFactory.settings());
                break;
            }
          }}
        />
      );
    case "level_selector":
      return (
        <LevelScreen
          onSelect={(event) => setScreen(ScreenStateFactory.game(event.level))}
          onBack={() => setScreen(ScreenStateFactory.menu())}
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
          onFinish={() => setScreen(ScreenStateFactory.menu())}
        />
      );
    case "credits":
      return (
        <CreditsScreen onDone={() => setScreen(ScreenStateFactory.menu())} />
      );
    case "howto":
      return (
        <HowToPlayScreen onDone={() => setScreen(ScreenStateFactory.menu())} />
      );
    case "settings":
      return (
        <SettingsScreen onBack={() => setScreen(ScreenStateFactory.menu())} />
      );

    case "game":
      return (
        <GameScreen
          initialLevel={screen.level}
          onGameOver={(event) => {
            if (scoreStore.qualifyingScore(event.score)) {
              setScreen(ScreenStateFactory.leaderboard(event.score));
            } else {
              setScreen(ScreenStateFactory.menu());
            }
          }}
        />
      );
  }
};
