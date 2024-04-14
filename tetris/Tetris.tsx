"use client";
import { useEffect, useRef, useState } from "react";
import { Actions, Game } from "@/tetris/game";
import { Free } from "@/tetris/Free";
import { Maybe } from "@/tetris/Maybe";

const SIZE = { row: 20, col: 10 };
const createGame = () =>
  Free.of(Actions.createGame)
    .map((create) => create(SIZE))
    .map((create) => create(Actions.randomTetrimo()))
    .map((create) => create(Actions.randomTetrimo()))
    .run();

function useTicker() {
  const tick = useRef(new Date().getTime());

  return {
    next(gap: number) {
      tick.current = Free.of(new Date())
        .map((date) => date.getTime())
        .map((time) => time + gap)
        .run();
    },
    done() {
      const now = new Date().getTime();
      return now > tick.current;
    },
  };
}
function useInterval(tick: () => unknown) {
  const timer = useRef<ReturnType<typeof setInterval>>();
  const tickRef = useRef(tick);

  useEffect(() => {
    tickRef.current = tick;
  }, [tick]);

  useEffect(() => {
    timer.current = setInterval(() => {
      tickRef.current();
    }, 10);
    return () => {
      if (timer.current) {
        clearInterval(timer.current);
      }
    };
  }, []);
}

function useGame() {
  const [value, setValue] = useState(createGame);
  const pieceDownTicker = useTicker();
  const scoringTicker = useTicker();

  useInterval(() => {
    Maybe.of(value)
      .check(pieceDownTicker.done)
      .check((game) => game.status === "playing")
      .map(Actions.nextTick)
      .whenSome((game) =>
        Free.of(game).map(Actions.levelSpeed).map(pieceDownTicker.next).run()
      )
      .whenSome(setValue);

    Maybe.of(value)
      .check((game) => game.status === "scoring")
      .check(scoringTicker.done)
      .map(Actions.score)
      .whenSome(() => scoringTicker.next(100))
      .whenSome(setValue);

    Maybe.of(value)
      .check((game) => game.status === "scored")
      .check(scoringTicker.done)
      .map(Actions.applyNextPiece(Actions.randomTetrimo))
      .whenSome(setValue);
  });

  return {
    value,
    start() {
      const game = createGame();
      pieceDownTicker.next(Actions.levelSpeed(game));
      setValue(game);
    },
    right() {
      setValue(Actions.moveRight);
    },
    left() {
      setValue(Actions.moveLeft);
    },
    rotate() {
      setValue(Actions.rotate);
    },
    rotateReverse() {
      setValue(Actions.rotateReverse);
    },
    nextTick() {
      setValue(Actions.nextTick);
    },
    pause() {
      setValue(Actions.pause);
    },
    consolidate() {
      setValue(Actions.consolidatePiece);
    },
  };
}

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

export function Piece(props: { value: Game["nextPiece"] }) {
  return (
    <div>
      {Array.from(props.value.positions).map((p, i) => (
        <Block key={i} col={p.col} row={p.row} color={props.value.color} />
      ))}
    </div>
  );
}

export function Board(props: {
  value: Game["playfield"]["board"];
  children?: React.ReactNode;
}) {
  return (
    <div
      style={{
        position: "relative",
        width: `${BLOCK_SIZE * props.value.length}px`,
        height: `${BLOCK_SIZE * props.value[0].length}px`,
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

export function GameView() {
  const game = useGame();

  console.log("game", game.value);
  return (
    <div>
      <div>level: {game.value.level}</div>
      <div>score: {game.value.score}</div>
      <div>status: {game.value.status}</div>
      <hr />

      <div>
        <button onClick={game.left}>left</button>
      </div>
      <div>
        <button onClick={game.right}>right</button>
      </div>
      <div>
        <button onClick={game.rotate}>rotate</button>
      </div>
      <div>
        <button onClick={game.rotateReverse}>rotateReverse</button>
      </div>
      <div>
        <button onClick={game.nextTick}>nextTick</button>
      </div>
      <div>
        <button onClick={game.consolidate}>consolidate</button>
      </div>
      <div>
        <button onClick={game.pause}>pause</button>
      </div>

      <hr />
      <Board value={game.value.playfield.board}>
        <Piece value={game.value.playfield.piece} />
      </Board>
    </div>
  );
}
