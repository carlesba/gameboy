import { ControlEventsObservable } from "@/cartridge";
import { useEffect, useState } from "react";

function Level(props: { value: number; selected?: boolean }) {
  return (
    <div
      style={{
        border: "1px solid",
        borderRadius: "4px",
        padding: "4px 8px",
        animation: props.selected ? "blink 1s infinite" : "none",
      }}
    >
      Level {props.value}
    </div>
  );
}

const LEVELS = Array.from({ length: 10 }, (_, i) => i);

export function LevelScreen(props: {
  controlEvents: ControlEventsObservable;
  onStart: (event: { level: number }) => unknown;
}) {
  const [level, setLevel] = useState(0);

  useEffect(
    () =>
      props.controlEvents.subscribe((key) => {
        console.log(key);
        switch (key) {
          case "down":
            setLevel((level) => (level + 1) % LEVELS.length);
            break;
          case "up":
            setLevel((level) => (level - 1 + LEVELS.length) % LEVELS.length);
            break;
          case "A":
          case "B":
          case "start":
            props.onStart({ level: level });
            break;
        }
      }),
    [props, level],
  );
  return (
    <div>
      <style>
        {`@keyframes blink {
  0%, 100% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
}`}
      </style>
      <p style={{ padding: "0 0 8px", margin: 0, fontWeight: "bold" }}>
        Select a level:
      </p>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          maxHeight: "40px",
        }}
      >
        {LEVELS.map((value) => (
          <Level key={value} value={value} selected={value === level} />
        ))}
      </div>
    </div>
  );
}
