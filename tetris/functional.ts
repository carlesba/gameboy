export const Identity = <T>(a: T): T => a;

export const False = () => false;

export const True = () => true;

export const tap =
  <T>(fn: (a: T) => void) =>
  (a: T) => {
    fn(a);
    return a;
  };
