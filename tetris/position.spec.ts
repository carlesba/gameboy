import { test, expect } from "vitest";
import { Positions } from "./position";

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
