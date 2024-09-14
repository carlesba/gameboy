import { Game } from "@/tetris";
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
import { ControlEventsObservable } from "@/cartridge";

const styles = {
  nextPieceWrapper: (size: number): CSSProperties => ({
    position: "relative",
    width: `${size * BLOCK_SIZE}px`,
    height: `${size * BLOCK_SIZE}px`,
  }),
};

export function GameScreen(props: {
  controlEvents: ControlEventsObservable;
  onGameOver: () => unknown;
}) {
  const [tetris] = useState(() => TetrisGame());
  const game = useSyncExternalStore(tetris.subscribeState, () => tetris.game);
  const gameOver = game.status === "gameover";

  useEffect(
    () =>
      props.controlEvents.subscribe((event) => {
        if (gameOver) {
          return props.onGameOver();
        }
        switch (event) {
          case "A":
            return tetris.action("rotateA");
          case "B":
            return tetris.action("rotateB");
          case "start":
          case "up":
            return;
          default:
            return tetris.action(event);
        }
      }),
    [props, gameOver, tetris],
  );

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
          <Piece
            key={game.playfield.piece.id}
            value={game.playfield.piece}
          />
        </Board>
      }
      nextPiece={
        <div style={styles.nextPieceWrapper(game.nextPiece.size)}>
          <Piece value={game.nextPiece} />
        </div>
      }
      stats={
        <div>
          <div>Level {game.level}</div>
          <div>Lines {game.lines}</div>
          <div>Score {game.score}</div>
        </div>
      }
    />
  );
}
