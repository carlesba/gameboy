import { test, expect, describe } from "vitest";
import { Test } from "./testing";
import { Free } from "./Free";
import { PlayFieldFactory } from "./playfield";

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
      .map((field) => PlayFieldFactory.from(field).cleanLines([0]).create())
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
      .map((field) => PlayFieldFactory.from(field).cleanLines([0, 2]).create())
      .map(Test.render)
      .run();

    // debugDiff(output, expectedOutput);

    expect(output).toBe(expectedOutput);
  });
});
