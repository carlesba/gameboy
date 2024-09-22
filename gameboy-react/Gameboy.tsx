import { useState } from "react";
import { Controls } from "./Controls";
import { Layout } from "./Layout";
import { useKeyboardControls } from "./useKeyboardControls";
import { CartridgeComponent, ControlEventsProvider } from "@/cartridge-react";
import { ControlEventsObservable } from "@/cartridge";

export function GameBoy(props: { Cartridge: CartridgeComponent }) {
  const [controlEvents] = useState(() => new ControlEventsObservable());

  useKeyboardControls(controlEvents.dispatch);

  return (
    <ControlEventsProvider controlEvents={controlEvents}>
      <Layout
        controls={<Controls onAction={controlEvents.dispatch} />}
        screen={<props.Cartridge onClose={() => {}} />}
      />
    </ControlEventsProvider>
  );
}
