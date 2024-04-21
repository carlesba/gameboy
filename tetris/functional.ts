export const Identity = <T>(a: T): T => a;

export const False = () => false;

export const True = () => true;

export const Always =
  <T>(v: T) =>
  () =>
    v;

export const Noop = () => {};

export const Call = <T>(fn: () => T) => fn();

export const Apply =
  <V>(v: V) =>
  <T>(fn: (v: V) => T) =>
    fn(v);

export const tap =
  <T>(fn: (a: T) => void) =>
  (a: T) => {
    fn(a);
    return a;
  };
