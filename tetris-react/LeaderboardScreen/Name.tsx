import { useControlEvents } from "@/cartridge-react";
import { ReactNode, useState } from "react";

const CHARACTERS = "_ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export type Event = { action: "next" | "prev" | "done"; char: string };

export function ViewName(props: { children: ReactNode; blinking?: boolean }) {
  return (
    <span
      style={{
        fontFamily: "monospace",
        animation: props.blinking ? "blink 500ms infinite" : "none",
      }}
    >
      {props.children}
    </span>
  );
}

function InsertChar(props: { char: string; onSubmit: (event: Event) => void }) {
  const [charIndex, setCharIndex] = useState(() => {
    const index = CHARACTERS.indexOf(props.char);
    return index === -1 ? 0 : index;
  });

  const nextLetter = () =>
    setCharIndex((index) => (index + 1) % CHARACTERS.length);
  const previousLetter = () =>
    setCharIndex(
      (index) => (index - 1 + CHARACTERS.length) % CHARACTERS.length,
    );

  const char = CHARACTERS[charIndex];
  useControlEvents((key) => {
    switch (key) {
      case "up": {
        nextLetter();
        return;
      }
      case "down": {
        previousLetter();
        return;
      }
      case "right":
      case "B":
      case "A": {
        props.onSubmit({ action: "next", char });
        return;
      }
      case "left": {
        props.onSubmit({ action: "prev", char });
        return;
      }
      case "start": {
        props.onSubmit({ action: "done", char });
        return;
      }
    }
  });
  return <ViewName blinking>{char}</ViewName>;
}

function CharInput(props: {
  value: string;
  editing: boolean;
  onAction: (event: Event) => void;
}) {
  if (!props.editing) {
    return <ViewName>{props.value}</ViewName>;
  }
  return <InsertChar char={props.value} onSubmit={props.onAction} />;
}

export function InputName(props: { onSubmit: (name: string) => void }) {
  const [name, setName] = useState(() => "   ");
  const [editing, setEditing] = useState(0);

  const updateName = (value: string, pos: number, char: string) => {
    const newName = value.split("");
    newName[pos] = char;
    return newName.join("");
  };

  const actionHandler = (event: Event) => {
    const newName = updateName(name, editing, event.char);
    setName(newName);
    switch (event.action) {
      case "next": {
        if (editing === 2) {
          props.onSubmit(newName);
        } else {
          setEditing((editing + 1) % 3);
        }
        break;
      }
      case "prev":
        setEditing((editing - 1 + 3) % 3);
        break;
      case "done":
        props.onSubmit(newName);
        break;
    }
  };
  const chars = name.split("");

  return (
    <ViewName>
      {chars.map((char, index) => (
        <CharInput
          key={index}
          value={char}
          editing={editing === index}
          onAction={actionHandler}
        />
      ))}
    </ViewName>
  );
}
