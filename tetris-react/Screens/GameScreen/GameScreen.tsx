import { Board } from "./Board";
import {
  CSSProperties,
  useEffect,
  useState,
  useSyncExternalStore,
} from "react";
import { Tetris as TetrisGame } from "@/tetris";
import { BLOCK_SIZE } from "./Block";
import { Layout } from "./Layout";
import { Piece } from "./Piece";
import { useOnAutoKeyPress, useOnKeyPress } from "@/cartridge-react";
import { useSounds } from "@/tetris-react/Sounds";

const styles = {
  nextPieceWrapper: (size: number): CSSProperties => ({
    position: "relative",
    width: `${size * BLOCK_SIZE}px`,
    height: `${size * BLOCK_SIZE}px`,
  }),
};

const StatLine = (props: { label: string; value: number }) => (
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    }}
  >
    <span>{props.label}</span>
    <span>{props.value}</span>
  </div>
);

export function GameScreen(props: {
  initialLevel: number;
  onGameOver: (event: { score: number }) => unknown;
}) {
  const [tetris] = useState(() =>
    TetrisGame({
      initialLevel: props.initialLevel,
    }),
  );
  const game = useSyncExternalStore(tetris.subscribeState, () => tetris.game);
  const gameOver = game.status === "gameover";
  const score = game.score;
  const sounds = useSounds();
  useEffect(
    () =>
      tetris.subscribeState((event) => {
        if (event.type === "tick") {
          switch (event.game.status) {
            case "gameover":
              sounds.gameOverSound();
              break;
            case "scoring":
              sounds.landSound();
              break;
            case "playing":
              sounds.moveSound();
              break;
          }
        }
      }),
    [tetris, sounds],
  );

  useOnKeyPress((button) => {
    if (gameOver) {
      return props.onGameOver({ score });
    }
    switch (button) {
      case "A":
        sounds.rotateSound();
        return tetris.action("rotateA");
      case "B":
        sounds.rotateSound();
        return tetris.action("rotateB");
      case "down":
        return tetris.action("down");
      case "start":
      case "up":
      default:
        return;
    }
  });
  useOnAutoKeyPress((button) => {
    switch (button) {
      case "left":
      case "right":
        return tetris.action(button);
      default:
        return;
    }
  });

  useEffect(() => {
    tetris.start();
  }, [tetris]);

  return (
    <Layout
      board={
        <Board
          gameOver={game.status === "gameover"}
          value={game.playfield.board}
          scoringLines={game.scoringLines}
        >
          <Piece key={game.playfield.piece.id} value={game.playfield.piece} />
        </Board>
      }
      nextPiece={
        <div style={styles.nextPieceWrapper(game.nextPiece.size)}>
          <Piece value={game.nextPiece} />
        </div>
      }
      stats={
        <div>
          <StatLine label="Level " value={game.level} />
          <StatLine label="Lines " value={game.lines} />
          <StatLine label="Score " value={game.score} />
        </div>
      }
    />
  );
}
