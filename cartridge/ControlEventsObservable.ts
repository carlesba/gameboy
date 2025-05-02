import { Observable } from "@/data-structures/Observable";

type ControlButton =
  | "A"
  | "B"
  | "left"
  | "right"
  | "up"
  | "down"
  | "pause"
  | "start";

export type ControlEvents = {
  button: ControlButton;
  action: "mousedown" | "mouseup" | "click" | "keydown" | "keyup" | "keypress";
};

export class ControlEventsObservable extends Observable<ControlEvents> {}
