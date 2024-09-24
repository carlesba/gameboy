import { readStorage, writeStorage } from "@/cartridge";

export * from "./types";
export * from "./ControlContext";
export * from "./AudioContext";
export * from "./BootCartridge";

export function useStorage(key: string) {
  return {
    get: () => readStorage(key),
    set: (value: string) => writeStorage(key, value),
  };
}
