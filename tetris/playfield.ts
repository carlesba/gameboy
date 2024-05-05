import { Free } from "./Free";
import { Maybe } from "./Maybe";
import { False, True } from "./functional";
import { Position } from "./position";
import { Color, Tetrimino, TetriminoFactory } from "./tetrimino";

type Block = Color;

export type Playfield = {
  board: Array<Array<Maybe<Block>>>;
  piece: Tetrimino;
};
export class PlayFieldFactory {
  private value: Playfield;
  constructor(value: Playfield) {
    this.value = value;
  }
  static from(playfield: Playfield) {
    return new PlayFieldFactory(playfield);
  }
  static of(size: Position, piece: Tetrimino) {
    return new PlayFieldFactory({
      board: Array.from({ length: size.col }, () =>
        Array.from({ length: size.row }, () => Maybe.none()),
      ),
      piece,
    });
  }

  static empty() {
    return PlayFieldFactory.of({ col: 10, row: 20 }, TetriminoFactory.empty());
  }
  width() {
    return this.value.board.length;
  }
  height() {
    return this.value.board[0].length;
  }
  introducePiece(piece: Tetrimino) {
    const centeredPiece = TetriminoFactory.from(piece)
      .move({
        row: this.height() - piece.size,
        col: Math.floor(this.value.board.length / 2 - piece.size / 2),
      })
      .create();

    this.withPiece(centeredPiece);

    return this;
  }
  withPiece(piece: Tetrimino) {
    this.value = { ...this.value, piece };
    return this;
  }
  cleanLines(lines: Array<number>) {
    const filler: Maybe<Color>[] = Array.from({ length: lines.length }, () =>
      Maybe.none(),
    );

    const linesSet = new Set(lines);
    const matchingLine = <T>(_r: T, index: number) => !linesSet.has(index);

    const board = this.value.board.map((column) =>
      Free.of(column)
        .map((c) => c.filter(matchingLine))
        .map((c) => c.concat(filler))
        .run(),
    );

    this.value = { ...this.value, board };

    return this;
  }
  mergePiece() {
    const block = Maybe.of(this.value.piece.color);

    const board = this.value.board.map((col) => col.concat());
    this.value.piece.positions.forEach((p) => {
      board[p.col][p.row] = block;
    });
    this.value = { ...this.value, board };

    return this;
  }
  isLineComplete(line: number) {
    return this.value.board.every((col) =>
      col[line].fold({
        onSome: True,
        onNone: False,
      }),
    );
  }
  isPositionTaken(position: Position) {
    return Maybe.of(this.value.board[position.col][position.row])
      .flatMap((m) => m)
      .fold({
        onSome: True,
        onNone: False,
      });
  }
  findCompleteLines() {
    return Array.from({ length: this.height() }, (_, i) => i).filter((line) =>
      this.isLineComplete(line),
    );
  }
  pieceOverlaps() {
    return this.value.piece.positions.some((position) =>
      this.isPositionTaken(position),
    );
  }
  create() {
    return this.value;
  }
}
