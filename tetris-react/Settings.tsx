"use client";

import { useStorage } from "@/cartridge-react";
import { createContext, useCallback, useContext, useState } from "react";

type Settings = {
  sound: boolean;
};

const SettingsContext = createContext<Settings>({
  sound: false,
});
const DEFAULT_SETTINGS: Settings = { sound: false };

const SettingsDispatchContext = createContext<React.Dispatch<Settings>>(
  (_v: Settings) => {},
);

const settingsFromStorage = (storageValue: string | null): Settings => {
  try {
    if (!storageValue) {
      throw new Error("No storage value");
    }
    const parsed = JSON.parse(storageValue);
    if (!("sound" in parsed) || !("music" in parsed)) {
      throw new Error("Invalid storage value");
    }
    return parsed;
  } catch {
    return DEFAULT_SETTINGS;
  }
};

function useSettingsState() {
  const storage = useStorage("tetris.settings");

  const [settings, setSettings] = useState(() =>
    settingsFromStorage(storage.get()),
  );

  const storeSettings = useCallback(
    (newSettings: Settings) => {
      storage.set(JSON.stringify(newSettings));
      setSettings(newSettings);
    },
    [storage],
  );

  return {
    value: settings,
    set: storeSettings,
  };
}

export function SettingsProvider(props: { children: React.ReactNode }) {
  const settings = useSettingsState();
  return (
    <SettingsContext.Provider value={settings.value}>
      <SettingsDispatchContext.Provider value={settings.set}>
        {props.children}
      </SettingsDispatchContext.Provider>
    </SettingsContext.Provider>
  );
}

export const useGetSettings = () => useContext(SettingsContext);
export const useSetSettings = () => useContext(SettingsDispatchContext);
