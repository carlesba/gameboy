import { Free } from "./Free";
import { Maybe } from "./Maybe";
import { Actions } from "./actions";
import { Apply, Identity } from "./functional";
import { Game } from "./game";

type Dispatch<E> = (event: E) => unknown;

type TetrisEvent = {
  // type: "gameover" | "scored" | "scoring" | "nextpiece" | "tick" | "action";
  game: Game;
};

const SIZE = { row: 20, col: 10 };

const createGame = () =>
  Free.of(Actions.createGame)
    .map((create) => create(SIZE))
    .map((create) => create(Actions.randomTetrimo()))
    .map((create) => create(Actions.randomTetrimo()))
    .run();

// TODO: move logic to work in FPS
class Timer {
  timer: number;
  status: "idle" | "waiting";

  constructor() {
    this.timer = new Date().getTime();
    this.status = "idle";
  }
  static create() {
    return new Timer();
  }
  setOverdue = (ms: number) => {
    this.timer = new Date().getTime() + ms;
    this.status = "waiting";
  };
  check = () => {
    const overtime = new Date().getTime() > this.timer;
    const pending = this.status === "waiting";
    if (overtime && pending) {
      this.status = "idle";
      return Maybe.of(true);
    }
    return Maybe.none();
  };
}

type StateEvent = {
  type: "next" | "update" | "reset";
  game: Game;
};

function createState(dispatch: Dispatch<StateEvent>) {
  let game = createGame();
  return {
    get: () => game,
    update: (fn: (game: Game) => Game) => {
      game = fn(game);
      dispatch({ type: "update", game });
    },
    nextTick() {
      return Maybe.of(game.status)
        .map((status) => {
          switch (status) {
            case "playing":
              return Actions.nextTick;
            case "scoring":
              return Actions.score;
            case "scored":
              return Actions.cleanupScore(Actions.randomTetrimo);
            default:
              return Identity;
          }
        })
        .map(Apply(game))
        .whenSome((g) => {
          game = g;
        })
        .whenSome((g) => dispatch({ type: "next", game: g }))
        .getValue(game);
    },
    reset: () => {
      game = createGame();
      dispatch({ type: "reset", game });
    },
  };
}

export function Tetris(onEvent: (event: TetrisEvent) => unknown) {
  const state = createState((event) => {
    onEvent(event);
  });

  const timer = Timer.create();

  const ticker = () => {
    timer
      .check()
      .map(() => state.nextTick())
      .flatMap((g): Maybe<number> => {
        switch (g.status) {
          case "scoring": {
            return g.scoringLines.length === 0
              ? Maybe.none()
              : Maybe.some(3000);
          }
          case "playing":
            return Maybe.some(g).map(Actions.levelSpeed);
          case "scored":
            return Maybe.some(0);
          default: {
            return Maybe.none();
          }
        }
      })
      .whenSome(timer.setOverdue),
      requestAnimationFrame(ticker);
  };

  return {
    start() {
      timer.setOverdue(0);
      ticker();
    },
    action(action: "left" | "right" | "down" | "rotateA" | "rotateB") {
      Free.of(action)
        .map((action) => {
          switch (action) {
            case "left":
              return Actions.moveLeft;
            case "right":
              return Actions.moveRight;
            case "down":
              timer.setOverdue(167);
              return Actions.consolidatePiece;
            case "rotateA":
              return Actions.rotate;
            case "rotateB":
              return Actions.rotateReverse;
            default:
              return Identity;
          }
        })
        .map(state.update)
        .run();
    },
  };
}
