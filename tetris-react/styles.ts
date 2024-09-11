import { CSSProperties } from "react";
import { Color } from "@/tetris";
import { Free } from "@/data-structures";

const SIZE = { row: 20, col: 10 };
const BLOCK_SIZE = 20;

const global = `
:root{
  --red: #ef4444;
  --cyan: #06b6d4;
  --yellow: #eab308;
  --green: #22c55e;
  --blue: #3b82f6;
  --purple: #8b5cf6;
  --orange: #f97316;
  --screen: #ACB1A4;
  --device: #DFD6DA;
  --button-red: #B3214B;
  --button-light-shadow: rgba(248, 238, 247, 0.6);
  --black: #282828;
  --pad-color: #282828
}
body {
  background-color: var(--device);
  margin: 0;
  overflow: hidden;
  width: 100vw;
  height: 100vh;
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

const SCREEN_OUTLINE = "1px solid var(--black)";
const LIGHT_SHADOW_COLOR = "rgba(248, 238, 247, 0.6)"; // #F8EEF7

const board = (props: { blurred?: boolean }): CSSProperties => ({
  position: "relative",
  width: `${BLOCK_SIZE * SIZE.col}px`,
  height: `${BLOCK_SIZE * SIZE.row}px`,
  filter: props.blurred ? undefined : "blur(4px)",
  outline: SCREEN_OUTLINE,
});

const layout = (): CSSProperties => ({
  display: "flex",
  flexDirection: "column",
  paddingTop: "10vmin",
  gap: "5vh",
});

const screenFrame = (): CSSProperties => ({
  background: "var(--black)",
  margin: "1vmin",
  borderRadius: "25px",
  padding: "20px 20px 50px",
  width: "330px",
  alignSelf: "center",
});

const screen = (): CSSProperties => ({
  borderRadius: "10px",
  background: "var(--screen)",
  padding: "10px",
});

const block = (props: {
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
      return `var(--${color})`;
    })
    .run(),
});
const gameScreen = (): CSSProperties => ({
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "10px",
});

const infoBlock = (): CSSProperties => ({
  display: "flex",
})
const nextPiece = (): CSSProperties => ({
  position: "relative",
  width: `${BLOCK_SIZE * 5}px`,
  height: `${BLOCK_SIZE * 5}px`,
  outline: SCREEN_OUTLINE,
});

const BUTTON_UNIT = 40;
const BUTTON_SIZE = BUTTON_UNIT * 1.4;

const actionButton = (): CSSProperties => ({
  border: "1px solid #353636",
  width: `${BUTTON_SIZE}px`,
  height: `${BUTTON_SIZE}px`,
  borderRadius: "50%",
  background: "var(--button-red)",
  color: LIGHT_SHADOW_COLOR,
  fontWeight: "bold",
  fontSize: "1.2rem",
  boxShadow: `-1px 1px 2px 0 #5C5758, inset -2px 3px 2px 0 var(--button-light-shadow)`,
});

type Side = "up" | "left" | "right" | "down";
type SideReader<T> = Record<Side, T>;
const readSide = <T>(side: Side, reader: SideReader<T>): T => reader[side];

const PAD_WIDTH = BUTTON_UNIT;
const PAD_LENGTH = BUTTON_UNIT * 1.3;
const PAD_RADIUS = "10px";

const padButton = (side: "up" | "left" | "right" | "down"): CSSProperties => ({
  fontSize: "0",
  borderStyle: "solid",
  borderWidth: "1px",
  borderColor: "#5E554F",
  background: "var(--pad-color)",
  fontWeight: "bold",
  ...readSide<CSSProperties>(side, {
    left: {
      width: `${PAD_LENGTH}px`,
      height: `${PAD_WIDTH}px`,
      borderTopLeftRadius: PAD_RADIUS,
      borderBottomLeftRadius: PAD_RADIUS,
      borderRight: "none",
      paddingLeft: "10px",
      boxShadow: `-1px 1px 2px 0 #5C5758, inset 0 3px 2px 0 ${LIGHT_SHADOW_COLOR}`,
    },
    right: {
      width: `${PAD_LENGTH}px`,
      height: `${PAD_WIDTH}px`,
      borderTopRightRadius: PAD_RADIUS,
      borderBottomRightRadius: PAD_RADIUS,
      borderLeft: "none",
      paddingRight: "10px",
      boxShadow: `-1px 1px 2px 0 #5C5758, inset -2px 3px 2px 0 ${LIGHT_SHADOW_COLOR}`,
    },
    down: {
      width: `${PAD_WIDTH}px`,
      height: `${PAD_LENGTH}px`,
      borderBottomLeftRadius: PAD_RADIUS,
      borderBottomRightRadius: PAD_RADIUS,
      borderTop: "none",
      paddingBottom: "10px",
      boxShadow: `-1px 1px 2px 0 #5C5758, inset -2px 0 2px 0 ${LIGHT_SHADOW_COLOR}`,
    },
    up: {
      width: `${PAD_WIDTH}px`,
      height: `${PAD_LENGTH}px`,
      borderTopLeftRadius: PAD_RADIUS,
      borderTopRightRadius: PAD_RADIUS,
      paddingTop: "10px",
      borderBottom: "none",
      boxShadow: `-1px 1px 2px 0 #5C5758, inset -2px 3px 2px 0 ${LIGHT_SHADOW_COLOR}`,
    },
  }),
});

const padCenter = (): CSSProperties => ({
  color: "var(--pad-color)",
  background: "currentColor",
  boxShadow: [
    "2px 0 1px 0 currentColor",
    "-2px 0 1px 1px currentColor",
    "0 -2px 1px 0 currentColor",
    "0 2px 1px 1px currentColor",
  ].join(","),
  zIndex: 1,
  transform: "scale(0.95)",
  position: "relative",
  width: `${PAD_WIDTH}px`,
  height: `${PAD_WIDTH}px`,
});
const pad = (): CSSProperties => ({
  display: "grid",
  gridTemplateAreas: `
  ". up ."
  "left center right"
  ". down ."`,
  justifyContent: "center",
  alignItems: "center",
});

const control = (): CSSProperties => ({
  display: "grid",
  width: "100%",
  gap: "10px",
  gridTemplateAreas: `
  ". . . . . . . . . ."
  "p p p p . . . . . ."
  "p p p p . . . . a ."
  "p p p p . . b . a ."
  "p p p p . . b . a ."
  "p p p p . . b . . ."
  "p p p p . . . . . ."
  ". . . . . . . . . ."`,
  justifyContent: "center",
  alignItems: "center",
});

export const styles = {
  global,
  game: {
    screen: gameScreen,
    board,
    nextPiece,
  },
  layout,
  screenFrame,
  screen,
  block,
  actionButton,
  control,
  pad,
  padCenter,
  padButton,
};
