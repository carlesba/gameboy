import { ControlEvents } from "@/cartridge";
import { CSSProperties, ReactNode } from "react";

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

function ControlLayout(props: {
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
export function Controls(props: { onAction: (action: ControlEvents) => void }) {
  const dispatch = props.onAction;
  return (
    <ControlLayout
      up={<PadButton label="up" onClick={() => dispatch("up")} />}
      down={<PadButton label="down" onClick={() => dispatch("down")} />}
      left={<PadButton label="left" onClick={() => dispatch("left")} />}
      right={<PadButton label="right" onClick={() => dispatch("right")} />}
      a={<ActionButton label="A" onClick={() => dispatch("A")} />}
      b={<ActionButton label="B" onClick={() => dispatch("B")} />}
    />
  );
}
