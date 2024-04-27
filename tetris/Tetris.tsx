"use client";
import { useEffect, useRef, useState } from "react";
import { Game, Maybe, Tetris as TetrisGame } from "@/tetris";

const BLOCK_SIZE = 20;
function Block(props: { row: number; col: number; color: string }) {
  return (
    <div
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
  gameOver?: boolean;
  children?: React.ReactNode;
}) {
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
            onSome: (b) => <Block col={col} row={row} color={b} key={row} />,
          })
        )
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
  const tetris = useRef(
    TetrisGame((event) => {
      setGame(event.game);
    })
  );

  useEffect(() => {
    tetris.current.start();
  }, []);

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
    if (e.key === "i") {
      action = "rotateA" as const;
    }
    if (e.key === "o") {
      action = "rotateB" as const;
    }
    Maybe.of(action).whenSome(tetris.current.action);
  });

  return {
    value: game,
    dispatch: tetris.current.action,
  };
}

export function GameView() {
  const game = useGame();

  console.log("game", game);
  if (!game.value) {
    return <div>loading...</div>;
  }
  return (
    <div>
      <div>level: {game.value.level}</div>
      <div>score: {game.value.score}</div>
      <div>status: {game.value.status}</div>
      <hr />

      <div>
        <button onClick={() => game.dispatch("left")}>left</button>
      </div>
      <div>
        <button onClick={() => game.dispatch("right")}>right</button>
      </div>
      <div>
        <button onClick={() => game.dispatch("down")}>down</button>
      </div>
      <div>
        <button onClick={() => game.dispatch("rotateA")}>rotate A</button>
      </div>
      <div>
        <button onClick={() => game.dispatch("rotateB")}>rotate B</button>
      </div>

      <hr />
      <Board
        gameOver={game.value.status === "gameover"}
        value={game.value.playfield.board}
      >
        <Piece value={game.value.playfield.piece} />
      </Board>
    </div>
  );
}
