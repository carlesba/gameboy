import { ControlEvents } from "@/cartridge";
import { useEffect } from "react";

type KeyboardEventType = "keydown" | "keyup" | "keypress";

function useWindowKeyEvents(
  types: KeyboardEventType[],
  fn: (e: KeyboardEvent, type: KeyboardEventType) => unknown,
) {
  useEffect(() => {
    // Create a wrapper to pass the event type
    const listeners = types.map((type) => {
      const handler = (e: KeyboardEvent) => fn(e, type);
      window.addEventListener(type, handler);
      return { type, handler };
    });

    return () => {
      listeners.forEach(({ type, handler }) => {
        window.removeEventListener(type, handler);
      });
    };
  }, [types, fn]);
}

function buttonFromKey(e: KeyboardEvent): ControlEvents["button"] | undefined {
  if (e.key === "ArrowLeft") {
    return "left";
  }
  if (e.key === "ArrowRight") {
    return "right";
  }
  if (e.key === "ArrowDown") {
    return "down";
  }
  if (e.key === "ArrowUp") {
    return "up";
  }
  if (e.key === " " || e.key === "Enter") {
    return "start";
  }
  const a = new Set(["i", "a", "d"]);
  if (a.has(e.key)) {
    return "A";
  }
  const b = new Set(["o", "s", "f"]);
  if (b.has(e.key)) {
    return "B";
  }
  return undefined;
}

const events: KeyboardEventType[] = ["keydown", "keyup", "keypress"];
export function useKeyboardControls(dispatch: (action: ControlEvents) => void) {
  useWindowKeyEvents(events, (e, eventType) => {
    const button = buttonFromKey(e);
    if (button) {
      dispatch({ button, action: eventType });
    }
  });
}
