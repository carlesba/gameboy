import { Free } from "./Free";
import { Position, Positions } from "./position";

export type Tetrimino = {
  color: string;
  size: number;
  origin: Position;
  positions: Array<Position>;
};

export class TetriminoFactory {
  value: Tetrimino;
  constructor(size: number, color: string) {
    this.value = {
      size,
      origin: Positions.ORIGIN,
      color,
      positions: [],
    };
  }
  static of(size: number, color: string) {
    return new TetriminoFactory(size, color);
  }
  static emptyFrom(tetrimono: Tetrimino) {
    return new TetriminoFactory(tetrimono.size, tetrimono.color);
  }
  withPosition = (p: Position) => {
    this.value.positions.push(p);
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
    this.value = Tetriminos.move(diff)(this.value);
    return this;
  };
  create() {
    return this.value;
  }
}

export const Tetriminos = {
  patterns: {
    I: TetriminoFactory.of(4, "red")
      .withPosition({ row: 1, col: 0 })
      .withPosition({ row: 1, col: 1 })
      .withPosition({ row: 1, col: 2 })
      .withPosition({ row: 1, col: 3 })
      .create(),
    Z: TetriminoFactory.of(3, "red")
      .withPosition({ row: 0, col: 0 })
      .withPosition({ row: 0, col: 1 })
      .withPosition({ row: 1, col: 1 })
      .withPosition({ row: 1, col: 2 })
      .create(),
    S: TetriminoFactory.of(3, "red")
      .withPosition({ row: 0, col: 1 })
      .withPosition({ row: 0, col: 2 })
      .withPosition({ row: 1, col: 0 })
      .withPosition({ row: 1, col: 1 })
      .create(),
    O: TetriminoFactory.of(2, "red")
      .withPosition({ row: 0, col: 0 })
      .withPosition({ row: 0, col: 1 })
      .withPosition({ row: 1, col: 0 })
      .withPosition({ row: 1, col: 1 })
      .create(),
    L: TetriminoFactory.of(3, "red")
      .withPosition({ row: 0, col: 0 })
      .withPosition({ row: 0, col: 1 })
      .withPosition({ row: 1, col: 1 })
      .withPosition({ row: 2, col: 1 })
      .create(),
    F: TetriminoFactory.of(3, "red")
      .withPosition({ row: 0, col: 2 })
      .withPosition({ row: 0, col: 1 })
      .withPosition({ row: 1, col: 1 })
      .withPosition({ row: 2, col: 1 })
      .create(),
    T: TetriminoFactory.of(3, "red")
      .withPosition({ row: 1, col: 0 })
      .withPosition({ row: 1, col: 1 })
      .withPosition({ row: 1, col: 2 })
      .withPosition({ row: 2, col: 1 })
      .create(),
  } as const,
  equals: (a: Tetrimino) => (b: Tetrimino) => {
    if (a.color !== b.color) return false;
    if (a.positions.length !== b.positions.length) return false;
    return a.positions.every((aa) => !!b.positions.find(Positions.equals(aa)));
  },
  move:
    (diff: Position) =>
    (piece: Tetrimino): Tetrimino => {
      const moveDiff = Positions.add(diff);

      const factory = TetriminoFactory.of(piece.size, piece.color);

      Free.of(piece.origin).map(moveDiff).map(factory.withOrigin).run();

      piece.positions.forEach((pos) =>
        Free.of(pos).map(moveDiff).map(factory.withPosition).run()
      );

      return factory.create();
    },
  normalizePosition: (piece: Tetrimino) =>
    Free.of(piece)
      .map(Tetriminos.move(Positions.inverse(piece.origin)))
      .run(),
  denormalizePosition: (origin: Position) => (piece: Tetrimino) =>
    Free.of(piece).map(Tetriminos.move(origin)).run(),

  reverseClockwise: (piece: Tetrimino) =>
    Free.of(piece)
      .map(Tetriminos.normalizePosition)
      .map((p) => p.positions)
      .map((positions) => ({
        positions,
        flip: Positions.flipReverseClockwise(piece.size),
      }))
      .map((props) => props.positions.map(props.flip))
      .map((positions) =>
        TetriminoFactory.emptyFrom(piece).withPositionsList(positions).create()
      )
      .map(Tetriminos.denormalizePosition(piece.origin))
      .run(),
  clockwise: (piece: Tetrimino) =>
    Free.of(piece)
      .map(Tetriminos.normalizePosition)
      .map((p) => p.positions)
      .map((positions) => ({
        positions,
        flip: Positions.flipClockwise(piece.size),
      }))
      .map((props) => props.positions.map(props.flip))
      .map((positions) =>
        TetriminoFactory.emptyFrom(piece).withPositionsList(positions).create()
      )
      .map(Tetriminos.denormalizePosition(piece.origin))
      .run(),
};
