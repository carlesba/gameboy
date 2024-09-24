import { Free } from "@/data-structures";
import { Color } from "@/tetris/tetrimino";
import { CSSProperties } from "react";

export const BLOCK_SIZE = 20;

const styles = (props: {
  row: number;
  col: number;
  color: Color;
  blinking?: boolean;
}): CSSProperties => ({
  position: "absolute",
  transition: "transform 100ms ease-in-out",
  transform: `translate(${props.col * BLOCK_SIZE}px, ${
    -props.row * BLOCK_SIZE
  }px)`,
  bottom: 0,
  left: 0,
  width: `${BLOCK_SIZE - 2}px`,
  height: `${BLOCK_SIZE - 2}px`,
  // border: "1px solid transparent",
  animation: props.blinking ? "blink 300ms infinite" : "none",
  boxShadow: props.color === "none" ? "" : "1px 1px 2px 0 #5C5758",
  background: Free.of(props.color)
    .map((color) => {
      if (color === "none") return "transparent";
      return `var(--tetris-${color})`;
    })
    .run(),
});

export function Block(props: {
  row: number;
  col: number;
  color: Color;
  blinking?: boolean;
}) {
  return (
    <div
      style={styles({
        row: props.row,
        col: props.col,
        color: props.color,
        blinking: props.blinking,
      })}
    ></div>
  );
}
