type Result<S, F> =
  | { type: "success"; value: S }
  | { type: "failure"; value: F };

export function createOperation<S, F>() {
  return class Operation {
    content: Result<S, F>;
    constructor(content: Result<S, F>) {
      this.content = content;
    }
    static success(value: S) {
      return new Operation({ type: "success", value });
    }
    static failure(value: F) {
      return new Operation({ type: "failure", value });
    }
    static eval(fn: () => Operation) {
      return fn();
    }
    map<R>(fn: (value: S) => R) {
      switch (this.content.type) {
        case "success":
          const newValue = fn(this.content.value);
          return createOperation<R, F>().success(newValue);
        case "failure":
          return Operation.failure(this.content.value);
        default: {
          throw new Error("[Operation] idle");
        }
      }
    }
    flatMap(fn: (v: S) => Operation) {
      switch (this.content.type) {
        case "success":
          return fn(this.content.value);
        case "failure":
          return this;
      }
    }
    fold<SS, FF>(map: {
      success: (v: S) => SS;
      failure: (f: F) => FF;
    }): SS | FF {
      switch (this.content.type) {
        case "success":
          return map.success(this.content.value);
        case "failure":
          return map.failure(this.content.value);
      }
    }
  };
}
