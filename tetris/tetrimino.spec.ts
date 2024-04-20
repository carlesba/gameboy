import { test, expect } from "vitest";
import { TetriminoFactory } from "./tetrimino";
import { movePiece } from "./moves";

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
