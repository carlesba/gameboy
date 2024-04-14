import { test, expect, describe } from "vitest";
import {
  Actions,
  GameFactory,
  PlayFieldFactory,
  Playfield,
  Position,
  Positions,
  TetriminoFactory,
  movePiece,
} from "./game";
import { Maybe } from "./Maybe";
import { Free } from "./Free";

const tap =
  <T>(fn: (a: T) => void) =>
  (a: T) => {
    fn(a);
    return a;
  };
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

const block = Maybe.some<string>(color);

const Test = {
  flatPiece: TetriminoFactory.of(2, color)
    .withPosition({ row: 0, col: 0 })
    .withPosition({ row: 0, col: 1 })
    .move({ row: 4, col: 0 })
    .create(),

  dotPiece: TetriminoFactory.of(2, color)
    .withPosition({ row: 0, col: 0 })
    .move({ row: 4, col: 0 })
    .create(),

  clean: (s: string) => s.trim(),
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
  fromText(text: string, piece: Playfield["piece"]): Playfield {
    return Free.of(text.trim().split("\n"))
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
  debug(input: string, output: string) {
    console.log("::: A :::");
    console.log(input);
    console.log("");
    console.log("::: B :::");
    console.log(output);
  },
};

describe("clean lines", () => {
  test("last line", () => {
    const input = Test.clean(`
OO
OO
OX
XX
`);
    const expectedOutput = Test.clean(`
OO
OO
OO
OX
`);
    const output = Free.of(Test.fromText(input, Test.dotPiece))
      .map((field) => PlayFieldFactory.of(field).cleanLines([0]).create())
      .map(Test.render)
      .run();

    expect(output).toBe(expectedOutput);
  });

  test("multiple lines", () => {
    const input = Test.clean(`
OO
OO
XX
OX
XX
`);
    const expectedOutput = Test.clean(`
OO
OO
OO
OO
OX
`);
    const output = Free.of(Test.fromText(input, Test.dotPiece))
      .map((field) => PlayFieldFactory.of(field).cleanLines([0, 2]).create())
      .map(Test.render)
      .run();

    // debugDiff(output, expectedOutput);

    expect(output).toBe(expectedOutput);
  });
});

describe("consolidate", () => {
  test.only("piece goes to the bottom", () => {
    const a = Test.clean(`
OO
OO
OO
OO
OX
`);

    const act = (input: string, p: Playfield["piece"]) =>
      Free.of(input)
        .map((i) => Test.fromText(i, p))
        // .map(
        //   tap((g) => {
        //     console.log("::: Test :::");
        //     console.log(Test.render(g));
        //     console.log(g.piece);
        //   })
        // )
        .map((field) => GameFactory.fromPlayfield(field).create())
        .map(Actions.consolidatePiece)
        .map(
          tap((g) => {
            expect(g.status).toBe("scoring");
          })
        )
        .map((g) => g.playfield)
        .map(Test.render)
        .run();

    const expectedB = Test.clean(`
OO
OO
OO
XX
OX
`);
    const expectedC = Test.clean(`
OO
OO
XO
XX
OX
`);
    const b = act(a, Test.flatPiece);
    const c = act(expectedB, Test.dotPiece);
    // Test.debug(c, expectedC);

    expect(b).toEqual(expectedB);
    expect(c).toEqual(expectedC);
  });
});
