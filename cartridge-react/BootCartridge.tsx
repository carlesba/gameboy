import { useOnControlEvent } from "./ControlContext";
import { CartridgeComponent } from "./types";

export const BootCartridge: CartridgeComponent = (props) => {
  useOnControlEvent(props.onClose);
  return <p>Press any key to start</p>;
};
