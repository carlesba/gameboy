import { useControlEvents } from "@/cartridge-react";
import { useState } from "react";
import { useSounds } from "../Sounds";

function Level(props: { label: string; selected?: boolean }) {
  return (
    <div
      style={{
        border: "1px solid",
        borderRadius: "4px",
        padding: "4px 8px",
        animation: props.selected ? "blink 1s infinite" : "none",
      }}
    >
      {props.label}
    </div>
  );
}

const LEVELS = Array.from({ length: 10 }, (_, i) => i);

export function LevelScreen(props: {
  onSelect: (event: { level: number }) => unknown;
  onBack: () => unknown;
}) {
  const [level, setLevel] = useState(0);

  const sounds = useSounds();
  useControlEvents((key) => {
    const totalOptions = LEVELS.length + 1;
    switch (key) {
      case "down":
        sounds.cursorSound();
        setLevel((level) => (level + 1) % totalOptions);
        break;
      case "up":
        sounds.cursorSound();
        setLevel((level) => (level - 1 + totalOptions) % totalOptions);
        break;
      case "A":
      case "B":
      case "start":
        if (level === LEVELS.length) {
          sounds.selectSound();
          props.onBack();
          break;
        }
        sounds.selectSound();
        props.onSelect({ level: level });
        break;
    }
  });
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
          <Level
            key={value}
            label={`Level ${value}`}
            selected={value === level}
          />
        ))}
        <Level label="Back" selected={level === LEVELS.length} />
      </div>
    </div>
  );
}
