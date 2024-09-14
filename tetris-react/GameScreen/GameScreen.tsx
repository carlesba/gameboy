import { Game } from "@/tetris";
import { Board, SCREEN_OUTLINE } from "./Board";
import { CSSProperties } from "react";
import { BLOCK_SIZE, Block } from "./Block";

const global = `
:root{
  --tetris-red: #ef4444;
  --tetris-cyan: #06b6d4;
  --tetris-yellow: #eab308;
  --tetris-green: #22c55e;
  --tetris-blue: #3b82f6;
  --tetris-purple: #8b5cf6;
  --tetris-orange: #f97316;
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
`;
const styles = {
  screen: (): CSSProperties => ({
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
  }),
  nextPiece: (): CSSProperties => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: `${BLOCK_SIZE * 5}px`,
    height: `${BLOCK_SIZE * 5}px`,
    outline: SCREEN_OUTLINE,
  }),
  nextPieceWrapper: (size: number): CSSProperties => ({
    position: "relative",
    width: `${size * BLOCK_SIZE}px`,
    height: `${size * BLOCK_SIZE}px`,
  }),
  info: (): CSSProperties => ({
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  }),
  stats: (): CSSProperties => ({
    outline: SCREEN_OUTLINE,
    fontWeight: "bold",
    padding: "10px",
  }),
};

function Piece(props: { value: Game["nextPiece"] }) {
  return (
    <div>
      {Array.from(props.value.positions).map((p, i) => (
        <Block key={i} col={p.col} row={p.row} color={props.value.color} />
      ))}
    </div>
  );
}
export function GameScreen(props: { game: Game }) {
  return (
    <>
      <style>{global}</style>
      <div style={styles.screen()}>
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
        <div style={styles.info()}>
          <div data-testid="next-piece" style={styles.nextPiece()}>
            <div style={styles.nextPieceWrapper(props.game.nextPiece.size)}>
              <Piece value={props.game.nextPiece} />
            </div>
          </div>
          <div style={styles.stats()}>
            <div>Level {props.game.level}</div>
            <div>Lines {props.game.lines}</div>
            <div>Score {props.game.score}</div>
          </div>
        </div>
      </div>
    </>
  );
}
