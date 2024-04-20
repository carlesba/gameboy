import { Free } from "./Free";
import { Maybe } from "./Maybe";
import { Game, GameFactory } from "./game";
import { MoveValidation, Moves } from "./moves";
import { PlayFieldFactory, Playfield } from "./playfield";
import { Tetrimino, Tetriminos } from "./tetrimino";

const Flows = {
  lateral:
    (move: "left" | "right") =>
    (game: Game): Game =>
      Free.of(game.playfield.piece)
        .map(move === "left" ? Moves.left : Moves.right)
        .map((piece) =>
          PlayFieldFactory.of(game.playfield).withPiece(piece).create()
        )
        .map(MoveValidation.validateLateralPosition)
        .map((operation) =>
          operation.fold({
            success: (p) => GameFactory.of(game).withPlayfield(p).create(),
            failure: () => game,
          })
        )
        .run(),
  dropPiece: (playfield: Playfield): Playfield =>
    Free.of(playfield.piece)
      .map(Moves.down)
      .map((piece) => PlayFieldFactory.of(playfield).withPiece(piece).create())
      .map(MoveValidation.validateTickPosition)
      .map((operation) =>
        operation.fold({
          success: (updatedPlayfield) => Flows.dropPiece(updatedPlayfield),
          failure: () => playfield,
        })
      )
      .run(),
  rotate:
    (direction: "clock" | "reverse") =>
    (game: Game): Game =>
      Free.of(game.playfield.piece)
        .map(
          direction === "clock"
            ? Tetriminos.clockwise
            : Tetriminos.reverseClockwise
        )
        .map((piece) =>
          PlayFieldFactory.of(game.playfield).withPiece(piece).create()
        )
        .map((playfield) =>
          GameFactory.of(game).withPlayfield(playfield).create()
        )
        .run(),

  getRandomTetrimono() {
    let randomPiece = Free.of(Tetriminos.patterns)
      .map(Object.values)
      .map((patterns) => patterns[Math.floor(Math.random() * patterns.length)])
      .run();

    const rotations = Math.floor(Math.random() * 4);
    for (let i = 0; i < rotations; i++) {
      randomPiece = Tetriminos.clockwise(randomPiece);
    }

    return Array.from({ length: rotations }).reduce(
      (acc: Tetrimino) => Tetriminos.clockwise(acc),
      randomPiece
    );
  },
};

export const Actions = {
  randomTetrimo: Flows.getRandomTetrimono,
  moveRight: Flows.lateral("right"),
  moveLeft: Flows.lateral("left"),
  rotate: Flows.rotate("clock"),
  rotateReverse: Flows.rotate("reverse"),
  pause: (game: Game): Game =>
    GameFactory.of(game)
      .withStatus(game.status === "pause" ? "playing" : "pause")
      .create(),
  levelSpeed: (game: Game) => {
    switch (game.level) {
      case 0:
        return 1000;
      case 1:
        return 900;
      case 2:
        return 800;
      case 3:
        return 700;
      case 4:
        return 600;
      case 5:
        return 500;
      case 6:
        return 400;
      case 7:
        return 300;
      case 8:
        return 200;
      default:
        return 100;
    }
  },
  createGame:
    (size: { row: number; col: number }) =>
    (piece: Tetrimino) =>
    (nextPiece: Tetrimino) =>
      Free.of(piece)
        .map((p) =>
          PlayFieldFactory.create(size, p).introducePiece(piece).create()
        )
        .map((playfield) =>
          GameFactory.fromPlayfield(playfield).withNextPiece(nextPiece).create()
        )
        .run(),

  nextTick: (game: Game): Game =>
    Free.of(game.playfield.piece)
      .map(Moves.down)
      .map((piece) =>
        PlayFieldFactory.of(game.playfield).withPiece(piece).create()
      )
      .map((p) =>
        MoveValidation.validateTickPosition(p).fold({
          success: (p) => GameFactory.of(game).withPlayfield(p).create(),
          failure: () =>
            GameFactory.of(game)
              .withPlayfield(
                PlayFieldFactory.of(game.playfield).merge().create()
              )
              .withStatus("scoring")
              .create(),
        })
      )
      .run(),
  score: (game: Game): Game =>
    Free.of(game.playfield)
      .map((p) => PlayFieldFactory.of(p).findCompleteLines())
      .map((lines) =>
        lines.length === 0 ? Maybe.none<number[]>() : Maybe.of(lines)
      )
      .run()
      .map((lines) => ({
        lines,
        playfield: PlayFieldFactory.of(game.playfield)
          .cleanLines(lines)
          .create(),
      }))
      .fold({
        onNone: () => GameFactory.of(game).withStatus("scored").create(),
        onSome: (ctx) =>
          GameFactory.of(game)
            .score(ctx.lines.length)
            .withPlayfield(ctx.playfield)
            .create(),
      }),
  consolidatePiece: (game: Game): Game =>
    Free.of(game)
      .map(Actions.nextTick)
      .map((g) => (g.status === "scoring" ? g : Actions.consolidatePiece(g)))
      .run(),
  applyNextPiece:
    (pieceProvider: () => Tetrimino) =>
    (game: Game): Game =>
      Free.of(game.playfield)
        .map((playfield) =>
          PlayFieldFactory.of(playfield)
            .merge()
            .introducePiece(pieceProvider())
            .create()
        )
        .map(
          (playfield): Game =>
            MoveValidation.validateTickPosition(playfield).fold({
              success: () =>
                GameFactory.of(game)
                  .withPlayfield(playfield)
                  .withStatus("playing")
                  .create(),
              failure: () =>
                GameFactory.of(game)
                  .withPlayfield(playfield)
                  .withStatus("gameover")
                  .create(),
            })
        )
        .run(),
};
