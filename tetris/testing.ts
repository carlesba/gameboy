import { Free, Maybe } from "@/data-structures";
import { PlayFieldFactory, Playfield } from "./playfield";
import { Color, TetriminoFactory } from "./tetrimino";

const color: Color = "red";

const Matrix = {
  transpose<T>(matrix: T[][]): T[][] {
    return matrix[0].map((_, i) => matrix.map((row) => row[i]));
  },
  reverseVertically<T>(matrix: T[][]): T[][] {
    return matrix.slice().reverse();
  },
};

const block = Maybe.some(color);

export const Test = {
  flatPiece: TetriminoFactory.create(2, color)
    .withPosition({ row: 0, col: 0 })
    .withPosition({ row: 0, col: 1 })
    .move({ row: 4, col: 0 })
    .create(),

  dotPiece: TetriminoFactory.create(2, color)
    .withPosition({ row: 0, col: 0 })
    .move({ row: 4, col: 0 })
    .create(),

  clean: (s: string) => s.trim().replace(/[^\S\r\n]+/g, ""),
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
              (cell): Maybe<Color> =>
                Maybe.of(cell).flatMap(
                  (c): Maybe<Color> => (c === "O" ? Maybe.none() : block),
                ),
            ),
        ),
      )
      .map(Matrix.reverseVertically)
      .map(Matrix.transpose)
      .map((board) =>
        PlayFieldFactory.from({
          board,
          piece,
        }).create(),
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
