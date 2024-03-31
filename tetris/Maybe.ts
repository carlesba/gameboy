export type Some<T> = T;
export type None = undefined | null;

export class Maybe<T> {
    constructor(private value: Some<T> | None) {}

    static of<T>(value: Some<T> | None): Maybe<T> {
        return new Maybe<T>(value);
    }

    static none<T>(): Maybe<T> {
        return new Maybe<T>(null);
    }

    static some<T>(value: NonNullable<T>): Maybe<T> {
        return new Maybe<T>(value);
    }

    isNone(): boolean {
        return this.value === null || this.value === undefined;
    }

    map<R>(fn: (value: T) => R): Maybe<R> {
        if (this.isNone()) {
            return Maybe.of<R>(null);
        }
        return Maybe.of<R>(fn(this.value as T));
    }

    flatMap<R>(fn: (value: T) => Maybe<R>): Maybe<R> {
        return this.isNone() ? Maybe.of<R>(null) : fn(this.value as T);
    }
    fold<R>(config: { onNone: () => R; onSome: (value: T) => R }): R {
        if (this.isNone()) {
            return config.onNone();
        }
        return config.onSome(this.value as T);
    }
    getValue(defaultValue: T): T {
        return this.isNone() ? defaultValue : (this.value as T);
    }
    whenSome(fn: (value: T) => void): Maybe<T> {
        if (!this.isNone()) {
            fn(this.value as T);
        }
        return this;
    }
    whenNone(fn: () => void): Maybe<T> {
        if (this.isNone()) {
            fn();
        }
        return this;
    }
}
