import { useState } from "react";
import { Controls } from "./Controls";
import { Layout } from "./Layout";
import { useKeyboardControls } from "./useKeyboardControls";
import { CartridgeComponent, ControlEventsProvider } from "@/cartridge-react";
import { ControlEventsObservable, Speaker, createSpeaker } from "@/cartridge";
import { AudioProvider, BootCartridge } from "@/cartridge-react";

export function GameBoy(props: { Cartridge: CartridgeComponent }) {
  const [controlEvents] = useState(() => new ControlEventsObservable());
  const [speaker, setSpeaker] = useState<Speaker | null>(null);

  useKeyboardControls(controlEvents.dispatch);
  const [cartridge, setCartridge] = useState<"boot" | "tetris">("boot");

  const screen =
    cartridge === "boot" ? (
      <BootCartridge
        onClose={() => {
          setCartridge("tetris");
          setSpeaker(createSpeaker());
        }}
      />
    ) : (
      <props.Cartridge onClose={() => setCartridge("boot")} />
    );

  return (
    <AudioProvider value={speaker}>
      <ControlEventsProvider controlEvents={controlEvents}>
        <Layout
          controls={<Controls onAction={controlEvents.dispatch} />}
          screen={screen}
        />
      </ControlEventsProvider>
    </AudioProvider>
  );
}
