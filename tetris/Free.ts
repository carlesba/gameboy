export class Free<T> {
  constructor(private getter: () => T) {}

  static create<T>(getter: () => T): Free<T> {
    return new Free<T>(getter);
  }

  static of<T>(value: T): Free<T> {
    return new Free<T>(() => value);
  }

  map<R>(fn: (value: T) => R): Free<R> {
    return Free.create<R>(() => fn(this.getter()));
  }
  get() {
    return this.getter();
  }
  run() {
    return this.getter();
  }
}
