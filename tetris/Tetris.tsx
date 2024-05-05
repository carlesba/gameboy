"use client";
import { useEffect, useRef, useState } from "react";
import { Game, Maybe, Tetris as TetrisGame } from "@/tetris";

const BLOCK_SIZE = 20;
function Block(props: {
  row: number;
  col: number;
  color: string;
  blinking?: boolean;
}) {
  return (
    <div
      className={props.blinking ? "blinking" : ""}
      style={{
        position: "absolute",
        transition: "transform 100ms ease-in-out",
        transform: `translate(${props.col * BLOCK_SIZE}px, ${
          -props.row * BLOCK_SIZE
        }px)`,
        bottom: 0,
        left: 0,
        width: `${BLOCK_SIZE}px`,
        height: `${BLOCK_SIZE}px`,
        outline: "1px solid gray",
        background: props.color === "none" ? "" : props.color,
      }}
    ></div>
  );
}

function Piece(props: { value: Game["nextPiece"] }) {
  return (
    <div>
      {Array.from(props.value.positions).map((p, i) => (
        <Block key={i} col={p.col} row={p.row} color={props.value.color} />
      ))}
    </div>
  );
}

function Board(props: {
  value: Game["playfield"]["board"];
  scoringLines: number[];
  gameOver?: boolean;
  children?: React.ReactNode;
}) {
  const scoring = new Set(props.scoringLines);
  return (
    <div
      style={{
        position: "relative",
        width: `${BLOCK_SIZE * props.value.length}px`,
        height: `${BLOCK_SIZE * props.value[0].length}px`,
        filter: !props.gameOver ? undefined : "blur(4px)",
      }}
    >
      {props.value.map((columns, col) =>
        columns.map((block, row) =>
          block.fold({
            onNone: () => <Block col={col} row={row} color="none" key={row} />,
            onSome: (b) => (
              <Block
                col={col}
                row={row}
                color={b}
                key={row}
                blinking={scoring.has(row)}
              />
            ),
          }),
        ),
      )}
      {props.children}
    </div>
  );
}

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

  // const tetrisAction = useRef<Maybe<TetrisAction>>(Maybe.none());
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
    Maybe.some(tetris.action).whenSome((dispatch) => {
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
    });
  });

  return [game, fps] as const;
}
export function GameView() {
  const [game, fps] = useGame();

  if (!game) {
    return <div>loading...</div>;
  }
  return (
    <div>
      <style>
        {`
          .blinking {
            animation: blink 300ms infinite;
          }
          @keyframes blink {
            0% {
              opacity: 1;
            }
            50% {
              opacity: 0;
            }
            100% {
              opacity: 1;
            }
          }
        `}
      </style>
      <div>fps: {fps} FPS</div>
      <div>level: {game.level}</div>
      <div>score: {game.score}</div>
      <div>status: {game.status}</div>
      <hr />
      <div style={{ position: "relative", height: 100, marginBottom: 20 }}>
        next piece: <Piece key={game.nextPiece.id} value={game.nextPiece} />
      </div>
      <hr />
      <Board
        gameOver={game.status === "gameover"}
        value={game.playfield.board}
        scoringLines={game.scoringLines}
      >
        <Piece key={game.playfield.piece.id} value={game.playfield.piece} />
      </Board>
    </div>
  );
}
