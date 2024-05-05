import { IdProvider } from "./ids";
import { Position, Positions } from "./position";

export type Tetrimino = {
  id: string;
  color: string;
  size: number;
  origin: Position;
  positions: Array<Position>;
};

const idProvider = new IdProvider();

export class TetriminoFactory {
  value: Tetrimino;
  constructor(id: string, size: number, color: string) {
    this.value = {
      id,
      size,
      origin: Positions.ORIGIN,
      color,
      positions: [],
    };
  }
  static create(size: number, color: string) {
    return new TetriminoFactory(idProvider.next(), size, color);
  }

  static from(tetrimino: Tetrimino) {
    return new TetriminoFactory(tetrimino.id, tetrimino.size, tetrimino.color)
      .withPositionsList(tetrimino.positions)
      .withOrigin(tetrimino.origin);
  }
  static createEmpty() {
    return new TetriminoFactory(idProvider.next(), 0, "none").create();
  }
  static I() {
    return TetriminoFactory.create(4, "red")
      .withPosition({ row: 1, col: 0 })
      .withPosition({ row: 1, col: 1 })
      .withPosition({ row: 1, col: 2 })
      .withPosition({ row: 1, col: 3 })
      .create();
  }
  static Z() {
    return TetriminoFactory.create(3, "red")
      .withPosition({ row: 0, col: 0 })
      .withPosition({ row: 0, col: 1 })
      .withPosition({ row: 1, col: 1 })
      .withPosition({ row: 1, col: 2 })
      .create();
  }
  static S() {
    return TetriminoFactory.create(3, "red")
      .withPosition({ row: 0, col: 1 })
      .withPosition({ row: 0, col: 2 })
      .withPosition({ row: 1, col: 1 })
      .withPosition({ row: 1, col: 0 })
      .create();
  }
  static O() {
    return TetriminoFactory.create(2, "red")
      .withPosition({ row: 0, col: 0 })
      .withPosition({ row: 0, col: 1 })
      .withPosition({ row: 1, col: 0 })
      .withPosition({ row: 1, col: 1 })
      .create();
  }
  static L() {
    return TetriminoFactory.create(3, "red")
      .withPosition({ row: 0, col: 0 })
      .withPosition({ row: 0, col: 1 })
      .withPosition({ row: 1, col: 1 })
      .withPosition({ row: 2, col: 1 })
      .create();
  }
  static J() {
    return TetriminoFactory.create(3, "red")
      .withPosition({ row: 0, col: 2 })
      .withPosition({ row: 0, col: 1 })
      .withPosition({ row: 1, col: 1 })
      .withPosition({ row: 2, col: 1 })
      .create();
  }
  static F() {
    return TetriminoFactory.create(3, "red")
      .withPosition({ row: 0, col: 2 })
      .withPosition({ row: 0, col: 1 })
      .withPosition({ row: 1, col: 1 })
      .withPosition({ row: 2, col: 1 })
      .create();
  }
  static T() {
    return TetriminoFactory.create(3, "red")
      .withPosition({ row: 1, col: 0 })
      .withPosition({ row: 1, col: 1 })
      .withPosition({ row: 1, col: 2 })
      .withPosition({ row: 2, col: 1 })
      .create();
  }
  equals = (a: Tetrimino) => {
    if (this.value.color !== a.color) return false;
    if (this.value.positions.length !== a.positions.length) return false;
    return this.value.positions.every(
      (aa) => !!a.positions.find(Positions.equals(aa)),
    );
  };
  withPosition = (p: Position) => {
    this.value = { ...this.value, positions: this.value.positions.concat(p) };
    return this;
  };
  updatePositions = (fn: (p: Array<Position>) => Array<Position>) => {
    this.value = { ...this.value, positions: fn(this.value.positions) };
    return this;
  };
  withPositionsList = (p: Array<Position>) => {
    this.value = { ...this.value, positions: p.concat() };
    return this;
  };
  withOrigin = (origin: Position) => {
    this.value = { ...this.value, origin };
    return this;
  };
  move = (diff: Position) => {
    const moveDiff = Positions.add(diff);

    return TetriminoFactory.from(this.value)
      .updatePositions((p) => p.map(moveDiff))
      .withOrigin(moveDiff(this.value.origin));
  };
  normalizePosition = () => {
    const diff = Positions.negative(this.value.origin);
    return TetriminoFactory.from(this.value).move(diff);
  };
  denormalizePosition = (origin: Position) => {
    return TetriminoFactory.from(this.value).move(origin);
  };
  clockwise = () => {
    const origin = this.value.origin;
    const flip = Positions.flipClockwise(this.value.size);

    return TetriminoFactory.from(this.value)
      .normalizePosition()
      .updatePositions((positions) => positions.map(flip))
      .denormalizePosition(origin);
  };
  reverseClockwise = () => {
    const origin = this.value.origin;
    const flip = Positions.flipReverseClockwise(this.value.size);

    return TetriminoFactory.from(this.value)
      .normalizePosition()
      .updatePositions((positions) => positions.map(flip))
      .denormalizePosition(origin);
  };
  create() {
    return this.value;
  }
}
