import { Game } from "@/tetris/game";
import { BLOCK_SIZE, Block } from "./Block";
import { CSSProperties } from "react";

const SIZE = { row: 20, col: 10 };
export const SCREEN_OUTLINE = "1px solid var(--black)";

const styles = (props: { blurred?: boolean }): CSSProperties => ({
  position: "relative",
  width: `${BLOCK_SIZE * SIZE.col}px`,
  height: `${BLOCK_SIZE * SIZE.row}px`,
  filter: props.blurred ? undefined : "blur(4px)",
  outline: SCREEN_OUTLINE,
});

export function Board(props: {
  value: Game["playfield"]["board"];
  scoringLines: number[];
  gameOver?: boolean;
  children?: React.ReactNode;
}) {
  const scoring = new Set(props.scoringLines);
  return (
    <div style={styles({ blurred: !props.gameOver })}>
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
