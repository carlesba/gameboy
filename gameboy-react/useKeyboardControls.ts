import { ControlEvents } from "@/cartridge";
import { useEffect } from "react";

function useWindowKeydown(fn: (e: KeyboardEvent) => unknown) {
  useEffect(() => {
    window.addEventListener("keydown", fn);
    return () => {
      window.removeEventListener("keydown", fn);
    };
  }, [fn]);
}

export function useKeyboardControls(
  dispatch: (action: ControlEvents) => void,
) {
  useWindowKeydown((e) => {
    if (e.key === "ArrowLeft") {
      return dispatch("left");
    }
    if (e.key === "ArrowRight") {
      return dispatch("right");
    }
    if (e.key === "ArrowDown") {
      return dispatch("down");
    }
    if (e.key === "ArrowUp") {
      return dispatch("up");
    }
    if (e.key === " " || e.key === "Enter") {
      return dispatch("start");
    }
    const a = new Set(["i", "a", "d"]);
    if (a.has(e.key)) {
      return dispatch("A");
    }
    const b = new Set(["o", "s", "f"]);
    if (b.has(e.key)) {
      return dispatch("B");
    }
    // if (e.key === "q") {
    //   return dispatch("pause");
    // }
  });
}
