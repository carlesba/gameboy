import { IdProvider } from "./ids";
import { Position, Positions } from "./position";

export type Color =
  | "none"
  | "cyan"
  | "red"
  | "yellow"
  | "green"
  | "blue"
  | "purple"
  | "orange";

export type Tetrimino = {
  id: string;
  color: Color;
  size: number;
  origin: Position;
  positions: Array<Position>;
};

const idProvider = new IdProvider();

export class TetriminoFactory {
  value: Tetrimino;
  constructor(id: string, size: number, color: Color) {
    this.value = {
      id,
      size,
      origin: Positions.ORIGIN,
      color,
      positions: [],
    };
  }
  static create(size: number, color: Color) {
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
    return TetriminoFactory.create(4, "cyan")
      .withPosition({ row: 1, col: 0 })
      .withPosition({ row: 1, col: 1 })
      .withPosition({ row: 1, col: 2 })
      .withPosition({ row: 1, col: 3 });
  }
  static Z() {
    return TetriminoFactory.create(3, "red")
      .withPosition({ row: 0, col: 0 })
      .withPosition({ row: 0, col: 1 })
      .withPosition({ row: 1, col: 1 })
      .withPosition({ row: 1, col: 2 });
  }
  static S() {
    return TetriminoFactory.create(3, "green")
      .withPosition({ row: 0, col: 1 })
      .withPosition({ row: 0, col: 2 })
      .withPosition({ row: 1, col: 1 })
      .withPosition({ row: 1, col: 0 });
  }
  static O() {
    return TetriminoFactory.create(2, "yellow")
      .withPosition({ row: 0, col: 0 })
      .withPosition({ row: 0, col: 1 })
      .withPosition({ row: 1, col: 0 })
      .withPosition({ row: 1, col: 1 });
  }
  static L() {
    return TetriminoFactory.create(3, "orange")
      .withPosition({ row: 0, col: 0 })
      .withPosition({ row: 0, col: 1 })
      .withPosition({ row: 1, col: 1 })
      .withPosition({ row: 2, col: 1 });
  }
  static J() {
    return TetriminoFactory.create(3, "blue")
      .withPosition({ row: 0, col: 2 })
      .withPosition({ row: 0, col: 1 })
      .withPosition({ row: 1, col: 1 })
      .withPosition({ row: 2, col: 1 });
  }
  static T() {
    return TetriminoFactory.create(3, "purple")
      .withPosition({ row: 1, col: 0 })
      .withPosition({ row: 1, col: 1 })
      .withPosition({ row: 1, col: 2 })
      .withPosition({ row: 2, col: 1 });
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
