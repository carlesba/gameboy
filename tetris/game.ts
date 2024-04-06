import { Free } from "./Free";
import { Maybe } from "./Maybe";
import { createOperation } from "./Operation";

type PositionID = `${number},${number}`;
type Position = { row: number; col: number };

type Tetrimino = {
  color: string;
  size: number;
  origin: Position;
  positions: Set<Position>;
};

type Block = string;

type Playfield = {
  board: Array<Array<Maybe<Block>>>;
  piece: Tetrimino;
};

export type Game = {
  playfield: Playfield;
  score: number;
  level: number;
  nextPiece: Tetrimino;
  status: "playing" | "pause" | "gameover" | "scoring" | "scored";
};

const Identity = <T>(a: T): T => a;
const False = () => false;
const True = () => true;

export const Positions = {
  ORIGIN: { row: 0, col: 0 },
  fromID: (p: PositionID): Position =>
    Free.of(p)
      .map((x) => x.split(",").map((x) => Number(x)))
      .map((x) => ({ row: x[0], col: x[1] }))
      .run(),

  inverse: (p: Position): Position => ({
    row: -p.row,
    col: -p.col,
  }),
  add:
    (a: Position) =>
    (b: Position): Position => ({
      row: a.row + b.row,
      col: a.col + b.col,
    }),

  withinLateralBoundaries: (max: number) => (target: Position) =>
    target.col < max && target.col >= 0,

  grounded: (target: Position) => target.row < 0,

  flipClockwise: (max: number) => (target: Position) => ({
    row: target.col,
    col: max - target.row - 1,
  }),

  flipReverseClockwise: (max: number) => (target: Position) => ({
    row: max - target.col - 1,
    col: target.row,
  }),
};

export class TetriminoFactory {
  value: Tetrimino;
  constructor(size: number, color: string) {
    this.value = {
      size,
      origin: Positions.ORIGIN,
      color,
      positions: new Set(),
    };
  }
  static of(size: number, color: string) {
    return new TetriminoFactory(size, color);
  }
  static emptyFrom(tetrimono: Tetrimino) {
    return new TetriminoFactory(tetrimono.size, tetrimono.color);
  }
  withPosition = (p: Position) => {
    this.value.positions.add(p);
    return this;
  };
  withPositionsList = (p: Array<Position>) => {
    this.value.positions = Free.of(p)
      .map((list) => new Set(list))
      .run();
    return this;
  };
  withOrigin = (p: Position) => {
    this.value.origin = p;
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
    if (a.positions.size !== b.positions.size) return false;
    return Array.from(a.positions).every((pos) => b.positions.has(pos));
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
      .map((p) => Array.from(p.positions))
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
      .map((p) => Array.from(p.positions))
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

const Moves = {
  down: Tetriminos.move({ row: -1, col: 0 }),
  right: Tetriminos.move({ row: 0, col: 1 }),
  left: Tetriminos.move({ row: 0, col: -1 }),
};

class PlayFieldFactory {
  private value: Playfield;
  constructor(value: Playfield) {
    this.value = value;
  }
  static of(playfield: Playfield) {
    return new PlayFieldFactory(playfield);
  }
  static create(size: Position, piece: Tetrimino) {
    return new PlayFieldFactory({
      board: Array.from({ length: size.col }, () =>
        Array.from({ length: size.row }, () => Maybe.none())
      ),
      piece,
    });
  }
  width() {
    return this.value.board.length;
  }
  height() {
    return this.value.board[0].length;
  }
  introducePiece(piece: Tetrimino) {
    const centeredPiece = Free.of(piece)
      .map(
        Tetriminos.move({
          row: this.height() - piece.size,
          col: Math.floor(this.value.board.length / 2 - piece.size / 2),
        })
      )
      .run();

    this.withPiece(centeredPiece);

    return this;
  }
  updatePosition(position: Position, value: Maybe<Block>) {
    this.value.board = this.value.board.map((col) => col.concat());
    this.value.board[position.col][position.row] = value;
    return this;
  }
  withPiece(piece: Tetrimino) {
    this.value = { ...this.value, piece };
    return this;
  }
  cleanLines(lines: Array<number>) {
    const filler: Maybe<string>[] = Array.from({ length: lines.length }, () =>
      Maybe.none()
    );

    const matchingLine = <T>(_r: T, index: number) =>
      lines.some((line) => line === index);

    this.value.board = this.value.board.map((column) =>
      Free.of(column.concat())
        .map((c) => c.filter(matchingLine))
        .map((c) => c.concat(filler))
        .run()
    );

    return this;
  }
  merge() {
    const block = Maybe.of(this.value.piece.color);
    this.value.piece.positions.forEach((p) => {
      this.updatePosition(p, block);
    });
    return this;
  }
  isLineComplete(line: number) {
    return this.value.board.every((col) =>
      col[line].fold({
        onSome: () => true,
        onNone: () => false,
      })
    );
  }
  isPositionTaken(position: Position) {
    return Maybe.of(this.value.board[position.col][position.col])
      .flatMap((m) => m)
      .fold({
        onSome: True,
        onNone: False,
      });
  }
  findCompleteLines() {
    return Array.from({ length: this.height() }, (_, i) => i).filter((line) =>
      this.isLineComplete(line)
    );
  }
  pieceOverlaps() {
    return Array.from(this.value.piece.positions).some((position) =>
      this.isPositionTaken(position)
    );
  }
  create() {
    return this.value;
  }
}

export const movePiece =
  (diff: Position) =>
  (piece: Tetrimino): Tetrimino => {
    const factory = TetriminoFactory.of(piece.size, piece.color);
    piece.positions.forEach((pos) => {
      Free.of(pos).map(Positions.add(diff)).map(factory.withPosition).run();
    });
    return factory.create();
  };

const MoveValidation = {
  operation: createOperation<Playfield, "touch" | "boundaries">(),

  withinLateralBoundaries: (playfield: Playfield) =>
    Free.of(PlayFieldFactory.of(playfield).width())
      .map((width) => ({
        validateBoundaries: Positions.withinLateralBoundaries(width),
        positions: Array.from(playfield.piece.positions),
      }))
      .map(({ validateBoundaries, positions }) =>
        positions.every(validateBoundaries)
          ? MoveValidation.operation.success(playfield)
          : MoveValidation.operation.failure("boundaries")
      )
      .run(),

  overlap: (playfield: Playfield) =>
    Free.of(PlayFieldFactory.of(playfield).pieceOverlaps())
      .map((overlaps) =>
        overlaps
          ? MoveValidation.operation.failure("touch")
          : MoveValidation.operation.success(playfield)
      )
      .run(),
  ground: (playfield: Playfield) =>
    Free.of(playfield.piece.positions)
      .map((positions) => Array.from(positions))
      .map((positions) => positions.find(Positions.grounded))
      .map((groundedPosition) =>
        !groundedPosition
          ? MoveValidation.operation.success(playfield)
          : MoveValidation.operation.failure("boundaries")
      )
      .run(),

  validateLateralPosition: (playfield: Playfield) =>
    MoveValidation.operation
      .success(playfield)
      .flatMap(MoveValidation.withinLateralBoundaries)
      .flatMap(MoveValidation.overlap),

  validateTickPosition: (playfield: Playfield) =>
    MoveValidation.operation
      .success(playfield)
      .flatMap(MoveValidation.overlap)
      .flatMap(MoveValidation.ground),
};

class GameFactory {
  private value: Game;
  constructor(game: Game) {
    this.value = game;
  }
  static fromPlayfield(playfield: Playfield) {
    return new GameFactory({
      playfield,
      score: 0,
      level: 0,
      nextPiece: playfield.piece,
      status: "playing",
    });
  }

  static of(game: Game) {
    return new GameFactory(game);
  }
  scoreFromLines(lines: number) {
    switch (lines) {
      case 1:
        return 100;
      case 2:
        return 300;
      case 3:
        return 500;
      case 4:
        return 800;
      default:
        return 0;
    }
  }
  score(lines: number) {
    const score = this.value.level * this.scoreFromLines(lines);
    this.withScore(score);
    return this;
  }

  withPlayfield = (playfield: Playfield) => {
    this.value = { ...this.value, playfield };
    return this;
  };
  withScore = (score: number) => {
    this.value = { ...this.value, score };
    return this;
  };
  withLevel = (level: number) => {
    this.value = { ...this.value, level };
    return this;
  };
  withStatus = (status: Game["status"]) => {
    this.value = { ...this.value, status };
    return this;
  };
  withNextPiece = (nextPiece: Tetrimino) => {
    this.value = { ...this.value, nextPiece };
    return this;
  };
  create() {
    return this.value;
  }
}

// const Games = {
//   updatePlayfield:
//     (game: Game) =>
//     (playfield: Playfield): Game => ({
//       ...game,
//       playfield,
//     }),
//   updateStatus:
//     (status: Game["status"]) =>
//     (game: Game): Game => ({
//       ...game,
//       status,
//     }),
//   scoreFromLines: (lines: number) => {
//     switch (lines) {
//       case 1:
//         return 100;
//       case 2:
//         return 300;
//       case 3:
//         return 500;
//       case 4:
//         return 800;
//       default:
//         return 0;
//     }
//   },
//   score: (level: number) => (lines: number) =>
//     level * Games.scoreFromLines(lines),
// };

const Flows = {
  lateral:
    (move: "left" | "right") =>
    (game: Game): Game =>
      Free.of(game.playfield.piece)
        .map(move === "left" ? Moves.left : Moves.right)
        .map((piece) =>
          PlayFieldFactory.of(game.playfield).withPiece(piece).create()
        )
        .map(MoveValidation.validateLateralPosition)
        .map((operation) =>
          operation.fold({
            success: (p) => GameFactory.of(game).withPlayfield(p).create(),
            failure: () => game,
          })
        )
        .run(),
  dropPiece: (playfield: Playfield): Playfield =>
    Free.of(playfield.piece)
      .map(Moves.down)
      .map((piece) => PlayFieldFactory.of(playfield).withPiece(piece).create())
      .map(MoveValidation.validateTickPosition)
      .map((operation) =>
        operation.fold({
          success: (updatedPlayfield) => Flows.dropPiece(updatedPlayfield),
          failure: () => playfield,
        })
      )
      .run(),
  rotate:
    (direction: "clock" | "reverse") =>
    (game: Game): Game =>
      Free.of(game.playfield.piece)
        .map(
          direction === "clock"
            ? Tetriminos.clockwise
            : Tetriminos.reverseClockwise
        )
        .map((piece) =>
          PlayFieldFactory.of(game.playfield).withPiece(piece).create()
        )
        .map((playfield) =>
          GameFactory.of(game).withPlayfield(playfield).create()
        )
        .run(),

  getRandomTetrimono() {
    let randomPiece = Free.of(Tetriminos.patterns)
      .map(Object.values)
      .map((patterns) => patterns[Math.floor(Math.random() * patterns.length)])
      .run();

    const rotations = Math.floor(Math.random() * 4);
    for (let i = 0; i < rotations; i++) {
      randomPiece = Tetriminos.clockwise(randomPiece);
    }

    return Array.from({ length: rotations }).reduce(
      (acc: Tetrimino) => Tetriminos.clockwise(acc),
      randomPiece
    );
  },
};

export const Actions = {
  randomTetrimo: Flows.getRandomTetrimono,
  moveRight: Flows.lateral("right"),
  moveLeft: Flows.lateral("left"),
  rotate: Flows.rotate("clock"),
  rotateReverse: Flows.rotate("reverse"),
  pause: (game: Game): Game =>
    GameFactory.of(game)
      .withStatus(game.status === "pause" ? "playing" : "pause")
      .create(),
  levelSpeed: (game: Game) => {
    switch (game.level) {
      case 0:
        return 1000;
      case 1:
        return 900;
      case 2:
        return 800;
      case 3:
        return 700;
      case 4:
        return 600;
      case 5:
        return 500;
      case 6:
        return 400;
      case 7:
        return 300;
      case 8:
        return 200;
      default:
        return 100;
    }
  },
  createGame:
    (size: { row: number; col: number }) =>
    (piece: Tetrimino) =>
    (nextPiece: Tetrimino) =>
      Free.of(piece)
        .map((p) =>
          PlayFieldFactory.create(size, p).introducePiece(piece).create()
        )
        .map((playfield) =>
          GameFactory.fromPlayfield(playfield).withNextPiece(nextPiece).create()
        )
        .run(),

  nextTick: (game: Game): Game =>
    Free.of(game.playfield.piece)
      .map(Moves.down)
      .map((piece) =>
        PlayFieldFactory.of(game.playfield).withPiece(piece).create()
      )
      .map((p) =>
        MoveValidation.validateTickPosition(p).fold({
          success: (p) => GameFactory.of(game).withPlayfield(p).create(),
          failure: () =>
            GameFactory.of(game)
              .withPlayfield(
                PlayFieldFactory.of(game.playfield).merge().create()
              )
              .withStatus("scoring")
              .create(),
        })
      )
      .run(),
  score: (game: Game): Game =>
    Maybe.of(PlayFieldFactory.of(game.playfield).findCompleteLines())
      .flatMap((lines) =>
        lines.length === 0 ? Maybe.none<number[]>() : Maybe.of(lines)
      )
      .map((lines) => ({
        lines,
        playfield: PlayFieldFactory.of(game.playfield)
          .cleanLines(lines)
          .create(),
      }))
      .fold({
        onNone: () => GameFactory.of(game).withStatus("scored").create(),
        onSome: (ctx) =>
          GameFactory.of(game)
            .score(ctx.lines.length)
            .withPlayfield(ctx.playfield)
            .create(),
      }),
  applyNextPiece:
    (pieceProvider: () => Tetrimino) =>
    (game: Game): Game =>
      Free.of(game.playfield)
        .map((playfield) =>
          PlayFieldFactory.of(playfield)
            .merge()
            .introducePiece(pieceProvider())
            .create()
        )
        .map(
          (playfield): Game =>
            MoveValidation.validateTickPosition(playfield).fold({
              success: () =>
                GameFactory.of(game)
                  .withPlayfield(playfield)
                  .withStatus("playing")
                  .create(),
              failure: () =>
                GameFactory.of(game)
                  .withPlayfield(playfield)
                  .withStatus("gameover")
                  .create(),
            })
        )
        .run(),
};
