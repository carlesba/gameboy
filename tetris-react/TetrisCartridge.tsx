"use client";

import { CartridgeComponent } from "@/cartridge-react";
import { SettingsProvider } from "./Settings";
import { TetrisScreens } from "./Screens";

export const TetrisCartridge: CartridgeComponent = (props) => {
  return (
    <SettingsProvider>
      <TetrisScreens onClose={props.onClose} />
    </SettingsProvider>
  );
};
