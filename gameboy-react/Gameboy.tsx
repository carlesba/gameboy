import { ReactNode, useEffect } from "react";
import { Actions } from "./types";
import { Controls } from "./Controls";
import { Layout } from "./Layout";

function useWindowKeydown(fn: (e: KeyboardEvent) => unknown) {
  useEffect(() => {
    window.addEventListener("keydown", fn);
    return () => {
      window.removeEventListener("keydown", fn);
    };
  }, [fn]);
}

export function GameBoy(props: {
  children: ReactNode;
  onAction: (action: Actions) => void;
}) {
  const dispatch = props.onAction;
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
    const a = new Set(["i", "a", "d"]);
    if (a.has(e.key)) {
      return dispatch("rotateA");
    }
    const b = new Set(["o", "s", "f"]);
    if (b.has(e.key)) {
      return dispatch("rotateB");
    }
    // if (e.key === "q") {
    //   return dispatch("pause");
    // }
  });
  return (
    <Layout
      controls={<Controls onAction={(action) => dispatch(action)} />}
      screen={props.children}
    />
  );
}
