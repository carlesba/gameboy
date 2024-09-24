import { useControlEvents } from "./ControlContext";
import { CartridgeComponent } from "./types";

export const BootCartridge: CartridgeComponent = (props) => {
  useControlEvents(() => {
    props.onClose();
  });
  return <p>Press any key to start</p>;
};
