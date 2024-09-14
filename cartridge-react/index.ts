import { ControlEventsObservable } from "@/cartridge";

export type CartridgeComponent = React.ComponentType<{
  controlEvents: ControlEventsObservable;
  onClose: () => unknown;
}>;
