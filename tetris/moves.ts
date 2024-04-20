import { Free } from "./Free";
import { createOperation } from "./operation";
import { PlayFieldFactory, Playfield } from "./playfield";
import { Position, Positions } from "./position";
import { Tetrimino, TetriminoFactory, Tetriminos } from "./tetrimino";

export const Moves = {
  down: Tetriminos.move({ row: -1, col: 0 }),
  right: Tetriminos.move({ row: 0, col: 1 }),
  left: Tetriminos.move({ row: 0, col: -1 }),
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

export const MoveValidation = {
  operation: createOperation<Playfield, "touch" | "boundaries">(),

  withinLateralBoundaries: (playfield: Playfield) =>
    Free.of(PlayFieldFactory.of(playfield).width())
      .map((width) => ({
        validateBoundaries: Positions.withinLateralBoundaries(width),
        positions: playfield.piece.positions,
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
