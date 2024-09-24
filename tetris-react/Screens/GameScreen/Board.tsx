import { Game } from "@/tetris/game";
import { BLOCK_SIZE, Block } from "./Block";
import { CSSProperties } from "react";

const SIZE = { row: 20, col: 10 };
export const SCREEN_OUTLINE = "1px solid var(--black)";

const containerStyles: CSSProperties = {
  position: "relative",
  width: `${BLOCK_SIZE * SIZE.col}px`,
  height: `${BLOCK_SIZE * SIZE.row}px`,
  // filter: props.blurred ? undefined : "blur(4px)",
  outline: SCREEN_OUTLINE,
};

const contentStyles = (props: { blurred?: boolean }): CSSProperties => ({
  position: "absolute",
  inset: 0,
  filter: props.blurred ? "blur(8px)" : undefined,
});

const gameOverStyles = {
  container: (visible: boolean): CSSProperties => ({
    position: "absolute",
    inset: 0,
    display: visible ? "flex" : "none",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    padding: "20px",
  }),
  content: (): CSSProperties => ({
    outline: SCREEN_OUTLINE,
    outlineWidth: "2px",
    padding: "10px",
    borderRadius: "10px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  }),
};

const GameOverScreen = (props: { visible: boolean }) => (
  <div style={gameOverStyles.container(props.visible)}>
    <div style={gameOverStyles.content()}>
      <h3>Game Over</h3>
      <p>Press any key to continue</p>
    </div>
  </div>
);

export function Board(props: {
  value: Game["playfield"]["board"];
  scoringLines: number[];
  gameOver?: boolean;
  children?: React.ReactNode;
}) {
  const scoring = new Set(props.scoringLines);
  return (
    <div style={containerStyles}>
      <div style={contentStyles({ blurred: !!props.gameOver })}>
        {props.value.map((columns, col) =>
          columns.map((block, row) =>
            block.fold({
              onNone: () => (
                <Block col={col} row={row} color="none" key={row} />
              ),
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
      <GameOverScreen visible={!!props.gameOver} />
    </div>
  );
}
