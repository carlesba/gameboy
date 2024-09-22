import { useControlEvents } from "@/cartridge-react";
import { useState } from "react";

const OPTIONS = [
  "quickPlay",
  "selectLevel",
  "howToPlay",
  // "settings",
  "credits",
] as const;

type Option = (typeof OPTIONS)[number];

const Labels = new Map<Option, string>([
  ["selectLevel", "Select Level"],
  ["credits", "Credits"],
  ["howToPlay", "How to Play"],
  ["quickPlay", "Quick Game"],
  // ["settings", "Settings"],
]);
const labelFromOption = (option: Option) => Labels.get(option) ?? option;

function ListItem(props: { label: string; selected: boolean }) {
  return (
    <div
      style={{
        border: "1px solid",
        borderRadius: "4px",
        padding: "4px 8px",
        animation: props.selected ? "blink 1s infinite" : "none",
      }}
    >
      <p style={{ margin: 0 }}>{props.label}</p>
    </div>
  );
}

export function MenuScreen(props: {
  onSelect: (event: { option: Option }) => unknown;
}) {
  const [index, setIndex] = useState(0);
  const option = OPTIONS[index] ?? "quickPlay";

  useControlEvents((key) => {
    switch (key) {
      case "down":
        setIndex((i) => (i + 1) % OPTIONS.length);
        break;
      case "up":
        setIndex((i) => (i - 1 + OPTIONS.length) % OPTIONS.length);
        break;
      case "A":
      case "B":
      case "start":
        props.onSelect({ option });
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
      <h2>Main Menu</h2>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          maxHeight: "40px",
        }}
      >
        {OPTIONS.map((value) => (
          <ListItem
            key={value}
            label={labelFromOption(value)}
            selected={option === value}
          />
        ))}
      </div>
    </div>
  );
}
