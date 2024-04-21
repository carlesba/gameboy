import { Free } from "./Free";
import { Maybe } from "./Maybe";
import { Actions } from "./actions";
import { Always, Apply, Identity } from "./functional";
import { Game } from "./game";

type TetrisEvent = {
  type: "gameover" | "scored" | "scoring" | "tick" | "action";
  game: Game;
};

type DispatchTetrisEvent = (event: TetrisEvent) => unknown;

const SIZE = { row: 20, col: 10 };

const createGame = () =>
  Free.of(Actions.createGame)
    .map((create) => create(SIZE))
    .map((create) => create(Actions.randomTetrimo()))
    .map((create) => create(Actions.randomTetrimo()))
    .run();

class Timer {
  date = 0;
  static create() {
    return new Timer();
  }
  next = (gap: number) => {
    this.date = gap + new Date().getTime();
    return this;
  };
  done = () => {
    return new Date().getTime() > this.date;
  };
}

const CommandCreator = {
  nextTick:
    (timer: Timer) => (dispatch: DispatchTetrisEvent) => (value: Game) =>
      Maybe.of(value)
        .check(timer.done)
        .map(Actions.nextTick)
        .whenSome((game) => dispatch({ type: "tick", game }))
        .whenSome((game) =>
          Free.of(game).map(Actions.levelSpeed).map(timer.next).run()
        ),

  scoring: (timer: Timer) => (dispatch: DispatchTetrisEvent) => (value: Game) =>
    Maybe.of(value)
      .check(timer.done)
      .map(Actions.score)
      .whenSome((game) => dispatch({ type: "scoring", game }))
      .whenSome(() => timer.next(800)),

  scored: (timer: Timer) => (dispatch: DispatchTetrisEvent) => (value: Game) =>
    Maybe.of(value)
      .check(timer.done)
      .whenSome((game) => dispatch({ type: "scored", game }))
      .map(Actions.applyNextPiece(Actions.randomTetrimo)),
};

export function Tetris(onEvent: (event: TetrisEvent) => unknown) {
  let game = createGame();

  const [nextTick, scoring, scored] = Object.values(CommandCreator)
    .map((createCommand) => createCommand(Timer.create()))
    .map((createCommand) => createCommand(onEvent));

  const nextGame = (game: Game) => {
    switch (game.status) {
      case "playing":
        return nextTick(game);
      case "scoring":
        return scoring(game);
      case "scored":
        return scored(game);
      default:
        return Maybe.of(game);
    }
  };

  // function* gametick() {
  //   while (game.status !== "gameover") {
  //     game = yield nextGame(game).fold({
  //       onSome: Identity,
  //       onNone: Always(game),
  //     });
  //   }
  //   return game;
  // }

  return {
    start() {
      // const tick = gametick();
      // let result = tick.next();
      const interval = setInterval(() => {
        game = nextGame(game).fold({
          onSome: Identity,
          onNone: Always(game),
        });
        if (game.status === "gameover") {
          onEvent({ type: "gameover", game });
          clearInterval(interval);
        }
      }, 10);
      // result.value;
      // while (!result.done) {
      //   requestAnimationFrame(() => {
      //     result = tick.next();
      //   });
      // }
      onEvent({ type: "gameover", game });
    },
    action(action: "left" | "right" | "down" | "rotateA" | "rotateB") {
      game = Free.of(action)
        .map((action) => {
          switch (action) {
            case "left":
              return Actions.moveLeft;
            case "right":
              return Actions.moveRight;
            case "down":
              return Actions.consolidatePiece;
            case "rotateA":
              return Actions.rotate;
            case "rotateB":
              return Actions.rotateReverse;
            default:
              return Identity;
          }
        })
        .map(Apply(game))
        .run();
      onEvent({ type: "action", game });
    },
  };
}
