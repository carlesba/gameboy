import {
  ControlEventsObservable,
  readStorage,
  writeStorage,
} from "@/cartridge";

export type CartridgeComponent = React.ComponentType<{
  controlEvents: ControlEventsObservable;
  onClose: () => unknown;
}>;

export function useStorage(key: string) {
  return {
    get: () => readStorage(key),
    set: (value: string) => writeStorage(key, value),
  };
}
