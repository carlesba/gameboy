import { Observable } from "@/data-structures/Observable";

export type ControlEvents =
  | "A"
  | "B"
  | "left"
  | "right"
  | "up"
  | "down"
  | "pause"
  | "start";

export class ControlEventsObservable extends Observable<ControlEvents> {}
