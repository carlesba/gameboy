import { readStorage, writeStorage } from "@/cartridge";

export type CartridgeComponent = React.ComponentType<{
  onClose: () => unknown;
}>;

export * from "./ControlContext";

export function useStorage(key: string) {
  return {
    get: () => readStorage(key),
    set: (value: string) => writeStorage(key, value),
  };
}
