import { SCREEN_OUTLINE } from "./Board";
import { CSSProperties } from "react";
import { BLOCK_SIZE } from "./Block";

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
  box: (): CSSProperties => ({
    outline: SCREEN_OUTLINE,
  }),
  nextPiece: (): CSSProperties => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: `${BLOCK_SIZE * 4}px`,
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

export function Layout(props: {
  board: React.ReactNode;
  nextPiece: React.ReactNode;
  stats: React.ReactNode;
}) {
  return (
    <>
      <style>{global}</style>
      <div style={styles.screen()}>
        {props.board}
        <div style={styles.info()}>
          <div style={styles.box()}>
            <h5 style={{ padding: "8px 8px 0" }}>Next</h5>
            <div data-testid="next-piece" style={styles.nextPiece()}>
              {props.nextPiece}
            </div>
          </div>
          <div style={styles.box()}>
            <div style={styles.stats()}>{props.stats}</div>
          </div>
        </div>
      </div>
    </>
  );
}
