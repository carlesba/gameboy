import { test, expect } from "vitest";
import { Positions, TetriminoFactory, movePiece } from "./playfield";

const color = "red";

const moveDown = movePiece({ row: 1, col: 0 });
const moveRight = movePiece({ row: 0, col: 1 });

test("move piece down", () => {
  const initial = TetriminoFactory.of(2, color)
    .withPosition({ row: 0, col: 0 })
    .withPosition({ row: 0, col: 1 })
    .create();
  const moved = TetriminoFactory.of(2, color)
    .withPosition({ row: 1, col: 0 })
    .withPosition({ row: 1, col: 1 })
    .create();

  expect(moveDown(initial)).toEqual(moved);
});

test("move piece right", () => {
  const initial = TetriminoFactory.of(2, color)
    .withPosition({ row: 0, col: 0 })
    .withPosition({ row: 1, col: 0 })
    .create();
  const moved = TetriminoFactory.of(2, color)
    .withPosition({ row: 0, col: 1 })
    .withPosition({ row: 1, col: 1 })
    .create();

  expect(moveRight(initial)).toEqual(moved);
});

test("flip position clockwise", () => {
  const flipClockwise = Positions.flipClockwise(4);

  expect(flipClockwise({ row: 3, col: 2 })).toEqual({ row: 2, col: 0 });
  expect(flipClockwise({ row: 1, col: 3 })).toEqual({ row: 3, col: 2 });
});

test("flip position reverse clockwise", () => {
  const flipReverseClockwise = Positions.flipReverseClockwise(4);

  expect(flipReverseClockwise({ row: 2, col: 0 })).toEqual({ row: 3, col: 2 });
  expect(flipReverseClockwise({ row: 3, col: 2 })).toEqual({ row: 1, col: 3 });
});
