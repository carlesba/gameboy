import { ControlEventsObservable } from "@/cartridge";
import { useEffect } from "react";

export function StartScreen(props: {
  controlEvents: ControlEventsObservable;
  onStart: () => unknown;
}) {
  useEffect(
    () =>
      props.controlEvents.subscribe(() => {
        props.onStart();
      }),
    [props],
  );
  return <div>Press any key to start</div>;
}
