import { readStorage, writeStorage } from "@/cartridge";
import { createSpeaker } from "@/cartridge";
import { useState } from "react";

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

export function useSpeaker() {
  const [speaker] = useState(() => createSpeaker());
  return speaker;
}
