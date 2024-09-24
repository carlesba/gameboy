import { useControlEvents } from "@/cartridge-react";
import { useState } from "react";
import { useSounds } from "../Sounds";
import { useGetSettings, useSetSettings } from "../Settings";

function SettingView(props: { label: string; selected?: boolean }) {
  return (
    <div
      style={{
        border: "1px solid",
        borderRadius: "4px",
        padding: "4px 8px",
        animation: props.selected ? "blink 1s infinite" : "none",
      }}
    >
      {props.label}
    </div>
  );
}

type SettingsKey = "sound" | "back";

const SettingsList: SettingsKey[] = ["sound", "back"];

export function SettingsScreen(props: { onBack: () => unknown }) {
  const [cursor, setCursor] = useState(0);

  const settings = useGetSettings();
  const setSetting = useSetSettings();

  const soundLabel = settings.sound ? "Sound: On" : "Sound: Off";

  const sounds = useSounds();
  useControlEvents((key) => {
    const totalOptions = SettingsList.length + 1;
    switch (key) {
      case "down":
        sounds.cursorSound();
        setCursor((level) => (level + 1) % totalOptions);
        break;
      case "up":
        sounds.cursorSound();
        setCursor((level) => (level - 1 + totalOptions) % totalOptions);
        break;
      case "A":
      case "B":
      case "start":
        if (cursor === SettingsList.length) {
          sounds.selectSound();
          props.onBack();
          break;
        }
        const setting = SettingsList[cursor];
        if (setting === "sound") {
          const sound = !settings.sound;
          setSetting({ ...settings, sound });
        } else {
          props.onBack();
        }
        sounds.selectSound();
        break;
    }
  });
  return (
    <div>
      <style>
        {`@keyframes blink {
  0%, 100% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
}`}
      </style>
      <h3 style={{ padding: "0 0 8px", margin: 0, fontWeight: "bold" }}>
        Settings
      </h3>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          maxHeight: "40px",
        }}
      >
        <SettingView label={soundLabel} selected={cursor === 0} />
        <SettingView label="Back" selected={cursor === 1} />
      </div>
    </div>
  );
}
