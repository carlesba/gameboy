import {
  ControlEvents,
  ControlEventsObservable,
} from "@/cartridge/ControlEventsObservable";
import { createContext, useContext, useEffect } from "react";

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

export function useControlEvents(fn: (event: ControlEvents) => void) {
  const controlEvents = useControlContext();

  useEffect(() => controlEvents.subscribe(fn), [controlEvents, fn]);
}
