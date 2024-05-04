import { Free } from "./Free";
import { Position, Positions } from "./position";

export type Tetrimino = {
  id: Symbol;
  color: string;
  size: number;
  origin: Position;
  positions: Array<Position>;
};

export class TetriminoFactory {
  value: Tetrimino;
  constructor(id: Symbol, size: number, color: string) {
    this.value = {
      id,
      size,
      origin: Positions.ORIGIN,
      color,
      positions: [],
    };
  }
  static of(size: number, color: string) {
    return new TetriminoFactory(Symbol(), size, color);
  }
  static emptyFrom(tetrimono: Tetrimino) {
    return new TetriminoFactory(tetrimono.id, tetrimono.size, tetrimono.color);
  }

  static from(tetrimino: Tetrimino) {
    return TetriminoFactory.emptyFrom(tetrimino)
      .withPositionsList(tetrimino.positions)
      .withOrigin(tetrimino.origin);
  }
  static createEmpty() {
    return new TetriminoFactory(Symbol(), 0, "none").create();
  }
  static I() {
    return TetriminoFactory.of(4, "red")
      .withPosition({ row: 1, col: 0 })
      .withPosition({ row: 1, col: 1 })
      .withPosition({ row: 1, col: 2 })
      .withPosition({ row: 1, col: 3 })
      .create();
  }
  static Z() {
    return TetriminoFactory.of(3, "red")
      .withPosition({ row: 0, col: 0 })
      .withPosition({ row: 0, col: 1 })
      .withPosition({ row: 1, col: 1 })
      .withPosition({ row: 1, col: 2 })
      .create();
  }
  static S() {
    return TetriminoFactory.of(3, "red")
      .withPosition({ row: 0, col: 1 })
      .withPosition({ row: 0, col: 2 })
      .withPosition({ row: 1, col: 1 })
      .withPosition({ row: 1, col: 0 })
      .create();
  }
  static O() {
    return TetriminoFactory.of(2, "red")
      .withPosition({ row: 0, col: 0 })
      .withPosition({ row: 0, col: 1 })
      .withPosition({ row: 1, col: 0 })
      .withPosition({ row: 1, col: 1 })
      .create();
  }
  static L() {
    return TetriminoFactory.of(3, "red")
      .withPosition({ row: 0, col: 0 })
      .withPosition({ row: 0, col: 1 })
      .withPosition({ row: 1, col: 1 })
      .withPosition({ row: 2, col: 1 })
      .create();
  }
  static J() {
    return TetriminoFactory.of(3, "red")
      .withPosition({ row: 0, col: 2 })
      .withPosition({ row: 0, col: 1 })
      .withPosition({ row: 1, col: 1 })
      .withPosition({ row: 2, col: 1 })
      .create();
  }
  static F() {
    return TetriminoFactory.of(3, "red")
      .withPosition({ row: 0, col: 2 })
      .withPosition({ row: 0, col: 1 })
      .withPosition({ row: 1, col: 1 })
      .withPosition({ row: 2, col: 1 })
      .create();
  }
  static T() {
    return TetriminoFactory.of(3, "red")
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
  newId = () => {
    this.value.id = Symbol();
    return this;
  };
  withPosition = (p: Position) => {
    this.value.positions.push(p);
    return this;
  };
  updatePositions = (fn: (p: Array<Position>) => Array<Position>) => {
    this.value.positions = fn(this.value.positions);
    return this;
  };
  withPositionsList = (p: Array<Position>) => {
    this.value.positions = p;
    return this;
  };
  withOrigin = (p: Position) => {
    this.value.origin = p;
    return this;
  };
  move = (diff: Position) => {
    const piece = this.value;

    const moveDiff = Positions.add(diff);

    const factory = TetriminoFactory.of(piece.size, piece.color);

    Free.of(piece.origin).map(moveDiff).map(factory.withOrigin).run();

    piece.positions.forEach((pos) =>
      Free.of(pos).map(moveDiff).map(factory.withPosition).run(),
    );
    return factory;
  };
  normalizePosition = () => {
    const diff = Positions.inverse(this.value.origin);
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
