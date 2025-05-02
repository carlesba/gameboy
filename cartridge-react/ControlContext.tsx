import {
  ControlEvents,
  ControlEventsObservable,
} from "@/cartridge/ControlEventsObservable";
import { createContext, useContext, useEffect, useRef } from "react";

const ControlEventsContext = createContext<ControlEventsObservable | null>(
  null,
);

export function ControlEventsProvider(props: {
  controlEvents: ControlEventsObservable;
  children: React.ReactNode;
}) {
  return (
    <ControlEventsContext.Provider value={props.controlEvents}>
      {props.children}
    </ControlEventsContext.Provider>
  );
}

function useControlContext() {
  const context = useContext(ControlEventsContext);
  if (!context) {
    throw new Error("useControlContext must be used within a ControlProvider");
  }
  return context;
}

export function useOnControlEvent(fn: (button: ControlEvents) => void) {
  const controlEvents = useControlContext();

  useEffect(() => controlEvents.subscribe(fn), [controlEvents, fn]);
}

export function useOnKeyPress(fn: (button: ControlEvents["button"]) => void) {
  const controlEvents = useControlContext();

  useEffect(
    () =>
      controlEvents.subscribe((e) => {
        switch (e.action) {
          case "mousedown":
          case "keydown": {
            fn(e.button);
          }
          default:
        }
      }),
    [controlEvents, fn],
  );
}

const DELAY_TIME = 250;
const REPEAT_TIME = 67;
export function useOnAutoKeyPress(
  fn: (button: ControlEvents["button"]) => void,
) {
  const controlEvents = useControlContext();

  const delay = useRef<number | null>(null);
  const interval = useRef<number | null>(null);

  useEffect(() => {
    function setTimers(fn: () => unknown) {
      fn();
      clearTimers();
      setTimeout(() => {
        fn();
        setInterval(fn, REPEAT_TIME);
      }, DELAY_TIME);
    }
    const clearTimers = () => {
      if (delay.current) {
        clearTimeout(delay.current);
        delay.current = null;
      }
      if (interval.current) {
        clearInterval(interval.current);
        interval.current = null;
      }
    };
    return controlEvents.subscribe((e) => {
      switch (e.action) {
        case "mousedown":
        case "keydown": {
          const eventButton = e.button;
          setTimers(() => fn(eventButton));
        }
        case "mouseup":
        case "keyup": {
          clearTimers();
        }
        default: {
        }
      }
    });
  }, [controlEvents, fn]);
}
