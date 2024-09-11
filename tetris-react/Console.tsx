import { CSSProperties, ReactNode } from "react";

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

const LIGHT_SHADOW_COLOR = "rgba(248, 238, 247, 0.6)"; // #F8EEF7

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

function ActionButton(props: { label: string; onClick?: () => unknown }) {
  return (
    <button style={actionButton()} onClick={props.onClick}>
      {props.label}
    </button>
  );
}
type Side = "up" | "left" | "right" | "down";
type SideReader<T> = Record<Side, T>;
const readSide = <T,>(side: Side, reader: SideReader<T>): T => reader[side];

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

function PadButton(props: {
  label: "left" | "right" | "down" | "up";
  onClick?: () => unknown;
}) {
  return (
    <button style={padButton(props.label)} onClick={props.onClick}>
      {props.label}
    </button>
  );
}

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
const pad = (): CSSProperties => ({
  display: "grid",
  gridTemplateAreas: `
  ". up ."
  "left center right"
  ". down ."`,
  justifyContent: "center",
  alignItems: "center",
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

function Controls(props: {
  up: ReactNode;
  down: ReactNode;
  left: ReactNode;
  right: ReactNode;
  a: ReactNode;
  b: ReactNode;
}) {
  return (
    <div style={control()}>
      <div style={{ gridArea: "p" }}>
        <div style={pad()}>
          <div style={{ gridArea: "left" }}>{props.left}</div>
          <div style={{ gridArea: "right" }}>{props.right}</div>
          <div style={{ gridArea: "up" }}>{props.up}</div>
          <div style={{ gridArea: "down" }}>{props.down}</div>
          <div style={{ gridArea: "center" }}>
            <div style={padCenter()} />
          </div>
        </div>
      </div>

      <div style={{ gridArea: "a" }}>{props.a}</div>
      <div style={{ gridArea: "b" }}>{props.b}</div>
    </div>
  );
}

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

function Layout(props: { screen: React.ReactNode; controls: React.ReactNode }) {
  return (
    <div style={layout()}>
      <div style={screenFrame()}>{props.screen}</div>
      {props.controls}
    </div>
  );
}

const screen = (): CSSProperties => ({
  borderRadius: "10px",
  background: "var(--screen)",
  padding: "10px",
});

function Screen(props: { children: React.ReactNode }) {
  return <div style={screen()}>{props.children}</div>;
}

type Actions = "rotateA" | "rotateB" | "left" | "right" | "down";
export function Console(props: {
  children: ReactNode;
  onAction: (action: Actions) => void;
}) {
  const dispatch = (action: Actions) => () => props.onAction(action);
  return (
    <div>
      <style>{global}</style>
      <Layout
        controls={
          <Controls
            up={<PadButton label="up" />}
            down={<PadButton label="down" onClick={dispatch("down")} />}
            left={<PadButton label="left" onClick={dispatch("left")} />}
            right={<PadButton label="right" onClick={dispatch("right")} />}
            a={<ActionButton label="A" onClick={dispatch("rotateA")} />}
            b={<ActionButton label="B" onClick={dispatch("rotateB")} />}
          />
        }
        screen={<Screen>{props.children}</Screen>}
      />
    </div>
  );
}
