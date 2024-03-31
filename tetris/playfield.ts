import { Free } from "./Free";
import { Maybe } from "./Maybe";
import { createOperation } from "./Operation";

type PositionID = `${number},${number}`;
type Position = { row: number; col: number };

type Tetrimino = {
  color: string;
  size: number;
  origin: PositionID;
  positions: Set<PositionID>;
};

type Playfield = {
  height: number; // 20
  width: number; // 10
  positions: Set<PositionID>;
  colors: Map<PositionID, string>;
  piece: Tetrimino;
};

type Game = {
  playfield: Playfield;
  score: number;
  level: number;
  nextPiece: Tetrimino;
  status: "playing" | "paused" | "gameover" | "scoring";
};

// const Identity = <T>(a: T): T => a;

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

  hasOverlap: (a: Set<PositionID>) => (b: Set<PositionID>) =>
    Array.from(a).some((pos) => b.has(pos)),

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
      origin: Positions.toID(Positions.ORIGIN),
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
    this.value.positions.add(Positions.toID(p));
    return this;
  };
  withPositionsList = (p: Array<Position>) => {
    this.value.positions = Free.of(p.map(Positions.toID))
      .map((list) => new Set(list))
      .run();
    return this;
  };
  withOrigin = (p: Position) => {
    this.value.origin = Positions.toID(p);
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

      Free.of(piece.origin)
        .map(Positions.fromID)
        .map(moveDiff)
        .map(factory.withOrigin)
        .run();

      piece.positions.forEach((pos) =>
        Free.of(pos)
          .map(Positions.fromID)
          .map(moveDiff)
          .map(factory.withPosition)
          .run()
      );

      return factory.create();
    },
  reverseClockwise: (piece: Tetrimino) =>
    Free.of(piece.positions)
      .map((p) => Array.from(p, Positions.fromID))
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
      .map((p) => Array.from(p, Positions.fromID))
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

const Playfields = {
  create:
    (height: number, width: number) =>
    (piece: Tetrimino): Playfield => ({
      height,
      width,
      positions: new Set(),
      colors: new Map(),
      piece,
    }),
  updatePiece:
    (playfield: Playfield) =>
    (piece: Tetrimino): Playfield => ({ ...playfield, piece }),
  mergePiece: (playfield: Playfield): Playfield => {
    const positions = new Set(playfield.positions);
    const colors = new Map(playfield.colors);
    playfield.piece.positions.forEach((pos) => {
      positions.add(pos);
      colors.set(pos, playfield.piece.color);
    });
    return { ...playfield, positions, colors };
  },
  addPiece:
    (piece: Tetrimino) =>
    (playfield: Playfield): Playfield =>
      Free.of(piece)
        .map(
          Tetriminos.move({
            row: 0,
            col: Math.floor(playfield.width / 2) - piece.size / 2,
          })
        )
        .map(Playfields.updatePiece(playfield))
        .run(),
  findCompleteLines: (playfield: Playfield) =>
    Free.of(playfield.positions)
      .map((positions) => Array.from(positions, Positions.fromID))
      .map((positions) =>
        positions.reduce(
          (byRow, pos) =>
            byRow.set(
              pos.row,
              Maybe.of(byRow.get(pos.row))
                .map((x) => x + 1)
                .getValue(1)
            ),
          {} as Map<number, number>
        )
      )
      .map((byRow) =>
        Object.entries(byRow)
          .filter(([_, count]) => count === playfield.width)
          .map(([row]) => Number(row))
      )
      .run(),
  filterLine:
    (row: number) =>
    (playfield: Playfield): Playfield =>
      Free.of(playfield.positions)
        .map((p) => Array.from(p))
        .map((pos) =>
          pos.reduce(
            (acc, p): Pick<Playfield, "positions" | "colors"> =>
              Free.of(p)
                .map(Positions.fromID)
                .map((id) => {
                  if (id.row === row) {
                    acc.positions.delete(p);
                    acc.colors.delete(p);
                  }
                  return acc;
                })
                .run(),
            {
              positions: new Set(playfield.positions),
              colors: new Map(playfield.colors),
            }
          )
        )
        .map(({ positions, colors }) =>
          PlayFieldFactory.of(playfield)
            .withPositions(positions)
            .withColors(colors)
            .create()
        )
        .run(),
  consolidatePieces: (playfield: Playfield): Playfield =>
    Free.of(playfield).run(),
};

export const movePiece =
  (diff: Position) =>
  (piece: Tetrimino): Tetrimino => {
    const factory = TetriminoFactory.of(piece.size, piece.color);
    piece.positions.forEach((pos) => {
      Free.of(pos)
        .map(Positions.fromID)
        .map(Positions.add(diff))
        .map(factory.withPosition)
        .run();
    });
    return factory.create();
  };

const MoveValidation = {
  operation: createOperation<Playfield, "touch" | "boundaries">(),

  withinLateralBoundaries: (playfield: Playfield) =>
    Free.of(playfield.width)
      .map(Positions.withinLateralBoundaries)
      .map((validateBoundaries) => ({
        validateBoundaries,
        positions: Array.from(playfield.piece.positions, Positions.fromID),
      }))
      .map(({ validateBoundaries, positions }) =>
        positions.every(validateBoundaries)
          ? MoveValidation.operation.success(playfield)
          : MoveValidation.operation.failure("boundaries")
      )
      .run(),

  overlap: (playfield: Playfield) =>
    Free.of(playfield.piece.positions)
      .map(Positions.hasOverlap(playfield.positions))
      .map((hasOverlap) =>
        hasOverlap
          ? MoveValidation.operation.failure("touch")
          : MoveValidation.operation.success(playfield)
      )
      .run(),
  ground: (playfield: Playfield) =>
    Free.of(playfield.piece.positions)
      .map((positions) => Array.from(positions, Positions.fromID))
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

class PlayFieldFactory {
  value: Playfield;
  constructor(value: Playfield) {
    this.value = value;
  }
  static of(playfield: Playfield) {
    return new PlayFieldFactory({
      ...playfield,
    });
  }
  withPositions(positions: Playfield["positions"]) {
    this.value.positions = positions;
    return this;
  }
  withColors(colors: Playfield["colors"]) {
    this.value.colors = colors;
    return this;
  }
  create() {
    return this.value;
  }
}

class GameFactory {
  value: Game;
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
};

const Flows = {
  lateral:
    (move: "left" | "right") =>
    (game: Game): Game =>
      Free.of(game.playfield.piece)
        .map(move === "left" ? Moves.left : Moves.right)
        .map(Playfields.updatePiece(game.playfield))
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
      .map(Playfields.updatePiece(playfield))
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
        .map(Playfields.updatePiece(game.playfield))
        .map(Games.updatePlayfield(game))
        .run(),
  cleanLines:
    (lines: Array<number>) =>
    (playfield: Playfield): Playfield =>
      Free.of(
        lines.reduce(
          (acc, row) => Free.of(acc).map(Playfields.filterLine(row)).run(),
          playfield
        )
      )
        // .map(Playfields.dropLines(lines.length))
        // .map()
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
  moveRight: Flows.lateral("right"),
  moveLeft: Flows.lateral("left"),
  rotate: Flows.rotate("clock"),
  rotateReverse: Flows.rotate("reverse"),
  createGame:
    (size: { height: number; width: number }) =>
    (piece: Tetrimino) =>
    (nextPiece: Tetrimino) =>
      Free.of(piece)
        .map(
          Tetriminos.move({
            row: 0,
            col: Math.floor(size.width / 2) - piece.size / 2,
          })
        )
        .map(Playfields.create(size.height, size.width))
        .map((playfield) =>
          GameFactory.fromPlayfield(playfield).withNextPiece(nextPiece).create()
        )
        .run(),

  nextTick: (game: Game): Game =>
    Free.of(game.playfield.piece)
      .map(Moves.down)
      .map(Playfields.updatePiece(game.playfield))
      .map((p) =>
        MoveValidation.validateTickPosition(p).fold({
          success: Games.updatePlayfield(game),
          failure: () =>
            Free.of(game.playfield)
              .map(Playfields.mergePiece)
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
        score: game.level * Games.scoreFromLines(lines.length),
        playfield: Free.of(game.playfield).map(Flows.cleanLines(lines)).run(),
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
        .map(Playfields.mergePiece)
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
