"use client";

import { useEffect, useState } from "react";
import { Game, Tetris as TetrisGame } from "@/tetris";
import { Console } from "./Console";
import { GameScreen } from "./GameScreen";

function useGame() {
  const [game, setGame] = useState<Game | null>(null);
  const [fps, setFps] = useState(0);

  const [tetris] = useState(() =>
    TetrisGame((event) => {
      if (event.type === "fps") {
        setFps(event.fps);
      } else {
        setGame(event.game);
      }
    }),
  );

  useEffect(() => {
    tetris.start();
  }, [tetris]);

  return [game, tetris.action, fps] as const;
}

export function GameView() {
  const [game, dispatch, fps] = useGame();

  if (!game) {
    return <div>loading...</div>;
  }
  return (
    <Console
      onAction={(action) => {
        dispatch(action);
      }}
    >
      <GameScreen game={game} />
    </Console>
  );
}
