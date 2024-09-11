"use client";

import { useEffect, useState } from "react";
import { Game, Tetris as TetrisGame } from "@/tetris";
import { Maybe } from "@/data-structures";
import { Console } from "./Console";
import { GameScreen } from "./GameScreen";

function useWindowKeydown(fn: (e: KeyboardEvent) => unknown) {
  useEffect(() => {
    window.addEventListener("keydown", fn);
    return () => {
      window.removeEventListener("keydown", fn);
    };
  }, [fn]);
}

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

  useWindowKeydown((e) => {
    let action;
    if (e.key === "ArrowLeft") {
      action = "left" as const;
    }
    if (e.key === "ArrowRight") {
      action = "right" as const;
    }
    if (e.key === "ArrowDown") {
      action = "down" as const;
    }
    const a = new Set(["i", "a", "d"]);
    if (a.has(e.key)) {
      action = "rotateA" as const;
    }
    const b = new Set(["o", "s", "f"]);
    if (b.has(e.key)) {
      action = "rotateB" as const;
    }
    Maybe.of(game)
      .flatMap(
        (g): Maybe<typeof tetris.action> =>
          g.status !== "gameover" ? Maybe.some(tetris.action) : Maybe.none(),
      )
      .whenSome((dispatch) => {
        if (e.key === "ArrowLeft") {
          return dispatch("left");
        }
        if (e.key === "ArrowRight") {
          return dispatch("right");
        }
        if (e.key === "ArrowDown") {
          return dispatch("down");
        }
        const a = new Set(["i", "a", "d"]);
        if (a.has(e.key)) {
          return dispatch("rotateA");
        }
        const b = new Set(["o", "s", "f"]);
        if (b.has(e.key)) {
          return dispatch("rotateB");
        }
        if (e.key === "q") {
          return dispatch("pause");
        }
      });
  });

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
