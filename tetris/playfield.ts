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

type Game = {
  playfield: Playfield;
  score: number;
  level: number;
  nextPiece: Tetrimino;
  status: "playing" | "paused" | "gameover" | "scoring";
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

  toID: (c: Position): PositionID => `${c.row},${c.col}`,

  add:
    (a: Position) =>
    (b: Position): Position => ({
      row: a.row + b.row,
      col: a.col + b.col,
    }),

  // hasOverlap: (a: Set<PositionID>) => (b: Set<PositionID>) =>
  //   Array.from(a).some((pos) => b.has(pos)),

  listFromSet: (p: Set<PositionID>) => Array.from(p, Positions.fromID),

  withinLateralBoundaries: (max: number) => (target: Position) =>
    target.col < max && target.col >= 0,
  grounded: (target: Position) => target.row >= 0,
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
  reverseClockwise: (piece: Tetrimino) =>
    Free.of(piece.positions)
      .map((p) => Array.from(p))
      .map((positions) => ({
        positions,
        flip: Positions.flipReverseClockwise(piece.size),
      }))
      .map((props) => props.positions.map(props.flip))
      .map((positions) =>
        TetriminoFactory.emptyFrom(piece).withPositionsList(positions).create()
      )
      .run(),
  clockwise: (piece: Tetrimino) =>
    Free.of(piece.positions)
      .map((p) => Array.from(p))
      .map((positions) => ({
        positions,
        flip: Positions.flipClockwise(piece.size),
      }))
      .map((props) => props.positions.map(props.flip))
      .map((positions) =>
        TetriminoFactory.emptyFrom(piece).withPositionsList(positions).create()
      )
      .run(),
};

const Moves = {
  down: Tetriminos.move({ row: 1, col: 0 }),
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
  updatePosition(position: Position, value: Maybe<Block>) {
    this.value.board = this.value.board.map((col) => col.concat());
    this.value.board[position.col][position.row] = value;
    return this;
  }
  withPiece(piece: Tetrimino) {
    this.value.piece = piece;
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
  create() {
    return this.value;
  }
}

const Playfields = {
  width: (playfield: Playfield): number => playfield.board[0].length,
  addPiece:
    (piece: Tetrimino) =>
    (playfield: Playfield): Playfield =>
      Free.of(piece)
        .map(
          Tetriminos.move({
            row: 0,
            col: Math.floor(playfield.board.length / 2) - piece.size / 2,
          })
        )
        .map((piece) =>
          PlayFieldFactory.of(playfield).withPiece(piece).create()
        )
        .run(),
  isLineComplete:
    (playfield: Playfield) =>
    (line: number): boolean =>
      playfield.board.every((col) =>
        col[line].fold({
          onSome: () => true,
          onNone: () => false,
        })
      ),
  spaceOverlook:
    (playfield: Playfield) =>
    (position: Position): boolean =>
      Maybe.of(playfield.board[position.col][position.row])
        .flatMap((p) => p)
        .fold({
          onNone: False,
          onSome: True,
        }),
  findCompleteLines: (playfield: Playfield) =>
    Free.of(playfield.board[0].length)
      .map((maxRow) => ({
        rows: Array.from({ length: maxRow }, (_, i) => i),
        isComplete: Playfields.isLineComplete(playfield),
      }))
      .map((context) => context.rows.filter(context.isComplete))
      .run(),
  // cleanLines:
  //   (rows: Array<number>) =>
  //   (playfield: Playfield): Playfield =>
  //     PlayFieldFactory.of(playfield).cleanLines(rows).create(),
};

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
    Free.of(Playfields.width(playfield))
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
    Free.of({
      positions: Array.from(playfield.piece.positions),
      hasOverlapping: Playfields.spaceOverlook(playfield),
    })
      .map((context) => !!context.positions.find(context.hasOverlapping))
      .map((hasOverlap) =>
        hasOverlap
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
      .flatMap(MoveValidation.ground)
      .flatMap(MoveValidation.overlap),
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

  static fromGame(game: Game) {
    return new GameFactory(game);
  }
  withPlayfield = (playfield: Playfield) => {
    this.value.playfield = playfield;
    return this;
  };
  withScore = (score: number) => {
    this.value.score = score;
    return this;
  };
  withLevel = (level: number) => {
    this.value.level = level;
    return this;
  };
  withStatus = (status: Game["status"]) => {
    this.value.status = status;
    return this;
  };
  withNextPiece = (piece: Tetrimino) => {
    this.value.nextPiece = piece;
    return this;
  };
  create() {
    return this.value;
  }
}

const Games = {
  updatePlayfield:
    (game: Game) =>
    (playfield: Playfield): Game => ({
      ...game,
      playfield,
    }),
  updateStatus:
    (status: Game["status"]) =>
    (game: Game): Game => ({
      ...game,
      status,
    }),
  scoreFromLines: (lines: number) => {
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
  },
  score: (level: number) => (lines: number) =>
    level * Games.scoreFromLines(lines),
};

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
            success: Games.updatePlayfield(game),
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
        .map(Games.updatePlayfield(game))
        .run(),
  // cleanLines:
  //   (lines: Array<number>) =>
  //   (playfield: Playfield): Playfield =>
  //     Free.of(
  //       lines.reduce(
  //         (acc, row) => Free.of(acc).map(Playfields.filterLine(row)).run(),
  //         playfield
  //       )
  //     )
  //       // .map(Playfields.dropLines(lines.length))
  //       // .map()
  //       .run(),

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
  moveRight: Flows.lateral("right"),
  moveLeft: Flows.lateral("left"),
  rotate: Flows.rotate("clock"),
  rotateReverse: Flows.rotate("reverse"),
  createGame:
    (size: { row: number; col: number }) =>
    (piece: Tetrimino) =>
    (nextPiece: Tetrimino) =>
      Free.of(piece)
        .map(
          Tetriminos.move({
            row: 0,
            col: Math.floor(size.col / 2) - piece.size / 2,
          })
        )
        .map((movedPiece) => PlayFieldFactory.create(size, movedPiece).create())
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
          success: Games.updatePlayfield(game),
          failure: () =>
            Free.of(game.playfield)
              .map((playfield) =>
                PlayFieldFactory.of(playfield).merge().create()
              )
              .map(Games.updatePlayfield(game))
              .map(Games.updateStatus("scoring"))
              .run(),
        })
      )
      .run(),
  score: (game: Game): Game =>
    Free.of(game.playfield)
      .map(Playfields.findCompleteLines)
      .map((lines) => ({
        score: Games.score(game.level)(lines.length),
        playfield: PlayFieldFactory.of(game.playfield)
          .cleanLines(lines)
          .create(),
      }))
      .map(({ score, playfield }) =>
        GameFactory.fromGame(game)
          .withScore(score)
          .withPlayfield(playfield)
          .create()
      )
      .run(),
  applyNextPiece:
    (pieceProvider: () => Tetrimino) =>
    (game: Game): Game =>
      Free.of(game.playfield)
        .map((playfield) => PlayFieldFactory.of(playfield).merge().create())
        // TODO: score and remove lines
        // - status: playing
        // - nextPiece: provider
        // - score
        .map(Playfields.addPiece(pieceProvider()))
        .map(
          (playfield): Game =>
            MoveValidation.validateTickPosition(playfield).fold({
              success: () =>
                Free.of(playfield).map(Games.updatePlayfield(game)).run(),
              failure: () =>
                Free.of(playfield)
                  .map(Games.updatePlayfield(game))
                  .map(Games.updateStatus("gameover"))
                  .run(),
            })
        )
        .run(),
  // drop: (game: Game): Game =>
  //   Free.of(game.playfield)
  //     .map(Flows.dropPiece)
  //     .map(Games.updatePlayfield(game))
  //     // TODO
  //     .run(),
};
