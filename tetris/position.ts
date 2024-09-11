import { Free } from "@/data-structures";

type PositionID = `${number},${number}`;
export type Position = { row: number; col: number };

export const Positions = {
  ORIGIN: { row: 0, col: 0 },
  fromID: (p: PositionID): Position =>
    Free.of(p)
      .map((x) => x.split(",").map((x) => Number(x)))
      .map((x) => ({ row: x[0], col: x[1] }))
      .run(),

  negative: (p: Position): Position => ({
    row: -p.row,
    col: -p.col,
  }),
  add:
    (a: Position) =>
    (b: Position): Position => ({
      row: a.row + b.row,
      col: a.col + b.col,
    }),
  equals:
    (a: Position) =>
    (b: Position): boolean =>
      a.row === b.row && a.col === b.col,

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
