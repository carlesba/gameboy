import { test, expect, describe } from "vitest";
import {
  GameFactory,
  PlayFieldFactory,
  Playfield,
  Positions,
  TetriminoFactory,
  movePiece,
} from "./game";
import { Maybe } from "./Maybe";
import { Free } from "./Free";

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

const Matrix = {
  transpose<T>(matrix: T[][]): T[][] {
    return matrix[0].map((_, i) => matrix.map((row) => row[i]));
  },
  reverseVertically<T>(matrix: T[][]): T[][] {
    return matrix.slice().reverse();
  },
};

const piece = TetriminoFactory.of(2, color)
  .withPosition({ row: 0, col: 0 })
  .create();
const block = Maybe.some<string>(color);

const renderBoard = (board: Maybe<string>[][]): string => {
  let output = "";
  Free.of(board)
    .map(Matrix.transpose)
    .map(Matrix.reverseVertically)
    .run()
    .forEach((col) => {
      col.forEach((block) => {
        output += block.fold({
          onSome: () => "X",
          onNone: () => "O",
        });
      });
      output += "\n";
    });
  return output;
};

const TextPlayfield = {
  render(field: Playfield): string {
    let output = "";
    Free.of(field.board)
      .map(Matrix.transpose)
      .map(Matrix.reverseVertically)
      .run()
      .forEach((col) => {
        col.forEach((block) => {
          output += block.fold({
            onSome: () => "X",
            onNone: () => "O",
          });
        });
        output += "\n";
      });
    return output.trim();
  },
  fromText(text: string): Playfield {
    return Free.of(text.split("\n"))
      .map((t) =>
        t.map((row) =>
          row
            .split("")
            .map(
              (cell): Maybe<string> =>
                Maybe.of(cell).flatMap((c) =>
                  c === "O" ? Maybe.none() : block
                )
            )
        )
      )
      .map(Matrix.reverseVertically)
      .map(Matrix.transpose)
      .map((board) =>
        PlayFieldFactory.of({
          board,
          piece,
        }).create()
      )
      .run();
  },
};

function debugDiff(input: string, output: string) {
  console.log("::: A :::");
  console.log(input);
  console.log("");
  console.log("::: B :::");
  console.log(output);
}

describe("clean lines", () => {
  test("last line", () => {
    const input = `
OO
OO
OX
XX
`.trim();
    const expectedOutput = `
OO
OO
OO
OX
`.trim();
    const output = Free.of(input)
      .map(TextPlayfield.fromText)
      .map((field) => PlayFieldFactory.of(field).cleanLines([0]).create())
      .map(TextPlayfield.render)
      .run();

    expect(output).toBe(expectedOutput);
  });

  test("multiple lines", () => {
    const input = `
OO
OO
XX
OX
XX
`.trim();
    const expectedOutput = `
OO
OO
OO
OO
OX
`.trim();
    const output = Free.of(input)
      .map(TextPlayfield.fromText)
      .map((field) => PlayFieldFactory.of(field).cleanLines([0, 2]).create())
      .map(TextPlayfield.render)
      .run();

    debugDiff(output, expectedOutput);

    expect(output).toBe(expectedOutput);
  });
});
