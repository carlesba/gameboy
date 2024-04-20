import { test, expect, describe } from "vitest";
import { GameFactory } from "./game";
import { Free } from "./Free";
import { Test } from "./testing";
import { Playfield } from "./playfield";
import { Actions } from "./actions";
import { tap } from "./functional";

describe("consolidate", () => {
  test("piece goes to the bottom", () => {
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
