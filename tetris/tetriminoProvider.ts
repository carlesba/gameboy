import { Maybe } from "@/data-structures";
import { Tetrimino, TetriminoFactory } from "./tetrimino";

const randomNum = (max: number) => Math.floor(Math.random() * max);
const randomLengthList = (max: number) =>
  Array.from({ length: randomNum(max) }, (_, i) => i);

class RandomBag<T> {
  bag: Array<T>;
  constructor(bag: Array<T>) {
    this.bag = bag;
  }
  static of<T>(bag: Array<T>) {
    return new RandomBag(bag);
  }
  next(): Maybe<T> {
    if (this.bag.length === 0) {
      return Maybe.none();
    }
    const randomIndex = randomNum(this.bag.length);
    const target = this.bag[randomIndex];
    this.bag.splice(randomIndex, 1);
    return Maybe.of(target);
  }
}

const createRandom7Bag = () =>
  RandomBag.of([
    TetriminoFactory.I,
    TetriminoFactory.J,
    TetriminoFactory.L,
    TetriminoFactory.O,
    TetriminoFactory.S,
    TetriminoFactory.T,
    TetriminoFactory.Z,
  ]);

export class TetriminoProvider {
  private bag: RandomBag<() => TetriminoFactory>;
  constructor() {
    this.bag = createRandom7Bag();
  }
  next() {
    return this.bag
      .next()
      .map((factory) =>
        randomLengthList(4).reduce(
          (f: TetriminoFactory) => f.clockwise(),
          factory(),
        ),
      );
  }
  reset() {
    this.bag = createRandom7Bag();
    return this;
  }
  get = (): Tetrimino => {
    return this.bag.next().fold({
      onSome: (f) => f().create(),
      onNone: () => this.reset().get(),
    });
  };
}
