import { Free } from "./Free";
import { Maybe } from "./Maybe";
import { tap } from "./functional";
import { Game, GameFactory } from "./game";
import { MoveValidation, Moves } from "./moves";
import { PlayFieldFactory, Playfield } from "./playfield";
import { Tetrimino, TetriminoFactory, Tetriminos } from "./tetrimino";

const Flows = {
  lateral:
    (move: "left" | "right") =>
    (game: Game): Game =>
      Free.of(game.playfield.piece)
        .map(move === "left" ? Moves.left : Moves.right)
        .map((piece) =>
          PlayFieldFactory.of(game.playfield).withPiece(piece).create(),
        )
        .map(MoveValidation.validateLateralPosition)
        .map((operation) =>
          operation.fold({
            success: (p) => GameFactory.of(game).withPlayfield(p).create(),
            failure: () => game,
          }),
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
        }),
      )
      .run(),
  rotate:
    (direction: "clock" | "reverse") =>
    (game: Game): Game =>
      Free.of(game.playfield.piece)
        .map(
          direction === "clock"
            ? Tetriminos.clockwise
            : Tetriminos.reverseClockwise,
        )
        .map((piece) =>
          PlayFieldFactory.of(game.playfield).withPiece(piece).create(),
        )
        .map(MoveValidation.validateLateralPosition)
        .map((operation) =>
          operation.fold({
            success: (p) => GameFactory.of(game).withPlayfield(p).create(),
            failure: () => game,
          }),
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
      randomPiece,
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
        return 800;
      case 1:
        return 720;
      case 2:
        return 630;
      case 3:
        return 550;
      case 4:
        return 470;
      case 5:
        return 380;
      case 6:
        return 300;
      case 7:
        return 220;
      case 8:
        return 130;
      case 9:
        return 100;
      case 10:
      case 11:
      case 12:
        return 80;
      case 13:
      case 14:
      case 15:
        return 70;
      case 16:
      case 17:
      case 18:
        return 50;
      case 19:
        return 30;
      default:
        return 20;
    }
  },
  createGame:
    (size: { row: number; col: number }) =>
    (piece: Tetrimino) =>
    (nextPiece: Tetrimino) =>
      Free.of(piece)
        .map((p) =>
          PlayFieldFactory.create(size, p).introducePiece(piece).create(),
        )
        .map((playfield) =>
          GameFactory.fromPlayfield(playfield)
            .withNextPiece(nextPiece)
            .create(),
        )
        .run(),

  nextTick: (game: Game): Game =>
    Free.of(game.playfield.piece)
      .map(Moves.down)
      .map((piece) =>
        PlayFieldFactory.of(game.playfield).withPiece(piece).create(),
      )
      .map((p) =>
        MoveValidation.validateTickPosition(p).fold({
          success: (p) => GameFactory.of(game).withPlayfield(p).create(),
          failure: () =>
            Free.of(game.playfield)
              .map((f) =>
                PlayFieldFactory.of(f)
                  .mergePiece()
                  .withPiece(TetriminoFactory.createEmpty())
                  .create(),
              )
              .map((playfield) =>
                GameFactory.of(game)
                  .withPlayfield(playfield)
                  .withScoringLines(
                    PlayFieldFactory.of(playfield).findCompleteLines(),
                  )
                  .withStatus("scoring")
                  .create(),
              )
              .run(),
        }),
      )
      .run(),
  score: (game: Game): Game =>
    Free.of(game)
      .map((g) => ({
        score: Free.of(g.level + 1)
          .map(
            (level) =>
              level * GameFactory.scoreFromLines(g.scoringLines.length),
          )
          .map((score) => game.score + score)
          .run(),
        playfield: PlayFieldFactory.of(g.playfield)
          .cleanLines(g.scoringLines)
          .create(),
      }))
      .map((ctx) =>
        GameFactory.of(game)
          .withScoringLines([])
          .withScore(ctx.score)
          .withPlayfield(ctx.playfield)
          .withStatus("scored")
          .create(),
      )
      .run(),
  consolidatePiece: (game: Game): Game =>
    Free.of(game)
      .map(Actions.nextTick)
      .map((g) => (g.status === "scoring" ? g : Actions.consolidatePiece(g)))
      .run(),
  cleanupScore:
    (pieceProvider: () => Tetrimino) =>
    (game: Game): Game =>
      Free.of(game)
        .map((g) =>
          PlayFieldFactory.of(g.playfield)
            .introducePiece(pieceProvider())
            .cleanLines(g.scoringLines)
            .create(),
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
            }),
        )
        .run(),
};
