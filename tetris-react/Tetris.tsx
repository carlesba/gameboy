"use client";

import { ReactNode, useEffect, useState } from "react";
import { Game, Maybe, Tetris as TetrisGame, Color } from "@/tetris-react/game";
import { styles } from "../tetris/styles";

function Block(props: {
  row: number;
  col: number;
  color: Color;
  blinking?: boolean;
}) {
  return (
    <div
      style={styles.block({
        row: props.row,
        col: props.col,
        color: props.color,
        blinking: props.blinking,
      })}
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
    <div style={styles.game.board({ blurred: !props.gameOver })}>
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

function Screen(props: { children: React.ReactNode }) {
  return <div style={styles.screen()}>{props.children}</div>;
}

function Layout(props: { screen: React.ReactNode; controls: React.ReactNode }) {
  return (
    <div style={styles.layout()}>
      <div style={styles.screenFrame()}>{props.screen}</div>
      {props.controls}
    </div>
  );
}

function ActionButton(props: { label: string; onClick?: () => unknown }) {
  return (
    <button style={styles.actionButton()} onClick={props.onClick}>
      {props.label}
    </button>
  );
}
function PadButton(props: {
  label: "left" | "right" | "down" | "up";
  onClick?: () => unknown;
}) {
  return (
    <button style={styles.padButton(props.label)} onClick={props.onClick}>
      {props.label}
    </button>
  );
}

function Controls(props: {
  up: ReactNode;
  down: ReactNode;
  left: ReactNode;
  right: ReactNode;
  a: ReactNode;
  b: ReactNode;
}) {
  return (
    <div style={styles.control()}>
      <div style={{ gridArea: "p" }}>
        <div style={styles.pad()}>
          <div style={{ gridArea: "left" }}>{props.left}</div>
          <div style={{ gridArea: "right" }}>{props.right}</div>
          <div style={{ gridArea: "up" }}>{props.up}</div>
          <div style={{ gridArea: "down" }}>{props.down}</div>
          <div style={{ gridArea: "center" }}>
            <div style={styles.padCenter()} />
          </div>
        </div>
      </div>

      <div style={{ gridArea: "a" }}>{props.a}</div>
      <div style={{ gridArea: "b" }}>{props.b}</div>
    </div>
  );
}

function TetrisGameScreen(props: { game: Game }) {
  return (
    <div style={styles.game.screen()}>
      <Board
        gameOver={props.game.status === "gameover"}
        value={props.game.playfield.board}
        scoringLines={props.game.scoringLines}
      >
        <Piece
          key={props.game.playfield.piece.id}
          value={props.game.playfield.piece}
        />
      </Board>
      <div>
        <div style={styles.game.nextPiece()}>
          <Piece value={props.game.nextPiece} />
        </div>
        <div style={styles.game.nextPiece()}>
          <div>Level {props.game.level}</div>
          <div>Lines {props.game.lines}</div>
          <div>Score {props.game.score}</div>
        </div>
      </div>
    </div>
  );
}

export function GameView() {
  const [game, dispatch, fps] = useGame();

  if (!game) {
    return <div>loading...</div>;
  }
  return (
    <div>
      <style>{styles.global}</style>
      {/*
      <div style={{ display: "none" }}>
        <div>fps: {fps} FPS</div>
        <div>level: {game.level}</div>
        <div>lines: {game.lines}</div>
        <div>score: {game.score}</div>
        <div>status: {game.status}</div>
      </div>
      <hr />
      <div style={{ position: "relative", height: 100, marginBottom: 20 }}>
        next piece: <Piece key={game.nextPiece.id} value={game.nextPiece} />
      </div>
      <hr />

      */}
      <Layout
        controls={
          <Controls
            up={<PadButton label="up" />}
            down={<PadButton label="down" onClick={() => dispatch("down")} />}
            left={<PadButton label="left" onClick={() => dispatch("left")} />}
            right={
              <PadButton label="right" onClick={() => dispatch("right")} />
            }
            a={<ActionButton label="A" onClick={() => dispatch("rotateA")} />}
            b={<ActionButton label="B" onClick={() => dispatch("rotateB")} />}
          />
        }
        screen={
          <Screen>
            <TetrisGameScreen game={game} />
          </Screen>
        }
      />
    </div>
  );
}
