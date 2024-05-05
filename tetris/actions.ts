import { Free } from "./Free";
import { Game, GameFactory } from "./game";
import { MoveValidation, Moves } from "./moves";
import { PlayFieldFactory, Playfield } from "./playfield";
import { Tetrimino, TetriminoFactory } from "./tetrimino";

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
        .map((piece) =>
          direction === "clock"
            ? TetriminoFactory.from(piece).clockwise().create()
            : TetriminoFactory.from(piece).reverseClockwise().create(),
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
    const patterns = [
      TetriminoFactory.I,
      TetriminoFactory.J,
      TetriminoFactory.L,
      TetriminoFactory.O,
      TetriminoFactory.S,
      TetriminoFactory.T,
      TetriminoFactory.Z,
    ];
    const randomNum = (max: number) => Math.floor(Math.random() * max);

    let randomPiece = Free.of(patterns.length)
      .map(randomNum)
      .map((randomIndex) => patterns[randomIndex]())
      .run();

    return Free.of(randomNum(4))
      .map((length) => Array.from({ length }))
      .map((rotations) =>
        rotations.reduce(
          (factory: TetriminoFactory) => factory.clockwise(),
          TetriminoFactory.from(randomPiece),
        ),
      )
      .map((factory) => factory.create())
      .run();
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
