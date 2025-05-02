import { useState } from "react";
import { Controls } from "./Controls";
import { Layout } from "./Layout";
import { useKeyboardControls } from "./useKeyboardControls";
import { CartridgeComponent, ControlEventsProvider } from "@/cartridge-react";
import { ControlEventsObservable, Speaker, createSpeaker } from "@/cartridge";
import { AudioProvider, BootCartridge } from "@/cartridge-react";

export function GameBoy(props: {
  games: Array<{ name: string; Cartridge: CartridgeComponent }>;
}) {
  const [controlEvents] = useState(() => new ControlEventsObservable());
  const [speaker, setSpeaker] = useState<Speaker | null>(null);

  useKeyboardControls(controlEvents.dispatch);
  const [index, setIndex] = useState(-1);
  const Game = props.games[index]?.Cartridge;

  return (
    <AudioProvider value={speaker}>
      <ControlEventsProvider controlEvents={controlEvents}>
        <Layout
          controls={<Controls onAction={controlEvents.dispatch} />}
          screen={
            !Game ? (
              <BootCartridge
                onClose={() => {
                  setIndex(0);
                  setSpeaker(createSpeaker());
                }}
              />
            ) : (
              <Game onClose={() => setIndex(-1)} />
            )
          }
        />
      </ControlEventsProvider>
    </AudioProvider>
  );
}
