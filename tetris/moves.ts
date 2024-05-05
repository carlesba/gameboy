import { Free } from "./Free";
import { createOperation } from "./operation";
import { PlayFieldFactory, Playfield } from "./playfield";
import { Position, Positions } from "./position";
import { Tetrimino, TetriminoFactory } from "./tetrimino";

const moveTetrimino = (diff: Position) => (piece: Tetrimino) =>
  TetriminoFactory.from(piece).move(diff).create();

export const Moves = {
  down: moveTetrimino({ row: -1, col: 0 }),
  right: moveTetrimino({ row: 0, col: 1 }),
  left: moveTetrimino({ row: 0, col: -1 }),
};

export const MoveValidation = {
  operation: createOperation<Playfield, "touch" | "boundaries">(),

  withinLateralBoundaries: (playfield: Playfield) =>
    Free.of(PlayFieldFactory.from(playfield).width())
      .map((width) => ({
        validateBoundaries: Positions.withinLateralBoundaries(width),
        positions: playfield.piece.positions,
      }))
      .map(({ validateBoundaries, positions }) =>
        positions.every(validateBoundaries)
          ? MoveValidation.operation.success(playfield)
          : MoveValidation.operation.failure("boundaries"),
      )
      .run(),

  overlap: (playfield: Playfield) =>
    Free.of(PlayFieldFactory.from(playfield).pieceOverlaps())
      .map((overlaps) =>
        overlaps
          ? MoveValidation.operation.failure("touch")
          : MoveValidation.operation.success(playfield),
      )
      .run(),
  ground: (playfield: Playfield) =>
    Free.of(playfield.piece.positions)
      .map((positions) => positions.find(Positions.grounded))
      .map((groundedPosition) =>
        !groundedPosition
          ? MoveValidation.operation.success(playfield)
          : MoveValidation.operation.failure("boundaries"),
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
