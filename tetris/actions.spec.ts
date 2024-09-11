import { test, expect, describe } from "vitest";
import { GameFactory } from "./game";
import { Free, tap } from "@/data-structures";
import { Test } from "./testing";
import { Playfield } from "./playfield";
import { Actions } from "./actions";

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
        .map((field) => GameFactory.empty().withPlayfield(field).create())
        .map(Actions.consolidatePiece)
        .map(
          tap((g) => {
            expect(g.status).toBe("scoring");
          }),
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

describe("Scoring sequence", () => {
  const a = Test.clean(`
            OO
            OO
            OO
            OX`);

  let game = Free.of(a)
    .map((p) => Test.fromText(p, Test.dotPiece))
    .map((field) => GameFactory.empty().withPlayfield(field).create())
    .run();

  test("piece gets merged into playfield after landing", () => {
    game = Actions.consolidatePiece(game);

    const b = Test.clean(`
              OO
              OO
              OO
              XX`);
    expect(Test.render(game.playfield)).toBe(b);
    expect(game.status).toBe("scoring");
    // empty current piece
    expect(game.playfield.piece.size).toBe(0);
  });

  test("updateScore", () => {
    game = Actions.score(game);
    expect(game.score).toBe(100);
    expect(game.status).toBe("scored");

    const c = Test.clean(`
              OO
              OO
              OO
              OO`);
    expect(Test.render(game.playfield)).toBe(c);
  });
});
