type Listener<Event> = (event: Event) => unknown;

export class Observable<Event> {
  listeners: Set<Listener<Event>>;
  constructor() {
    this.listeners = new Set<Listener<Event>>();
  }
  static create<Event>() {
    return new Observable<Event>();
  }
  subscribe = (listener: Listener<Event>) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };
  dispatch = (event: Event) => {
    this.listeners.forEach((listener) => listener(event));
  };
}
