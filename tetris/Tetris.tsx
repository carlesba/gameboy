"use client";
import { ReactNode, useEffect, useState } from "react";
import { Game, Maybe, Tetris as TetrisGame, Color, Free } from "@/tetris";
import { styles } from "./styles";

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
    <div style={styles.board({ blurred: !props.gameOver })}>
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

  return [game, fps] as const;
}

function Layout(props: { board: React.ReactNode; controls: React.ReactNode }) {
  return (
    <div style={styles.layout()}>
      <div style={styles.screenFrame()}>
        <div style={styles.screen()}>{props.board}</div>
      </div>
      {props.controls}
    </div>
  );
}

function ActionButton(props: { label: string }) {
  return <button style={styles.actionButton()}>{props.label}</button>;
}
function PadButton(props: { label: "left" | "right" | "down" | "up" }) {
  return <button style={styles.padButton(props.label)}>{props.label}</button>;
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

      <div style={{ gridArea: "a" }}>
        <ActionButton label="A" />
      </div>
      <div style={{ gridArea: "b" }}>
        <ActionButton label="B" />
      </div>
    </div>
  );
}

export function GameView() {
  // return (
  //   <div>
  //     <style>{styles.global}</style>
  //     <Controls
  //       up={<PadButton label="up" />}
  //       down={<PadButton label="down" />}
  //       left={<PadButton label="left" />}
  //       right={<PadButton label="right" />}
  //       a={<ActionButton label="A" />}
  //       b={<ActionButton label="B" />}
  //     />
  //   </div>
  // );
  const [game, fps] = useGame();

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
            down={<PadButton label="down" />}
            left={<PadButton label="left" />}
            right={<PadButton label="right" />}
            a={<ActionButton label="A" />}
            b={<ActionButton label="B" />}
          />
        }
        board={
          <Board
            gameOver={game.status === "gameover"}
            value={game.playfield.board}
            scoringLines={game.scoringLines}
          >
            <Piece key={game.playfield.piece.id} value={game.playfield.piece} />
          </Board>
        }
      />
    </div>
  );
}
