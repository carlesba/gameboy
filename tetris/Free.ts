export class Free<T> {
  constructor(private value: T) {}

  static of<T>(value: T): Free<T> {
    return new Free<T>(value);
  }

  map<R>(fn: (value: T) => R): Free<R> {
    return Free.of<R>(fn(this.value as T));
  }

  flatMap<R>(fn: (value: T) => Free<R>): Free<R> {
    return fn(this.value as T);
  }

  run() {
    return this.value;
  }
}
