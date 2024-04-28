import { Free } from "./Free";
import { Maybe } from "./Maybe";
import { Actions } from "./actions";
import { Identity } from "./functional";
import { Game } from "./game";

type TetrisEvent = {
  type: "gameover" | "scored" | "scoring" | "nextpiece" | "tick" | "action";
  game: Game;
};

const SIZE = { row: 20, col: 10 };

const createGame = () =>
  Free.of(Actions.createGame)
    .map((create) => create(SIZE))
    .map((create) => create(Actions.randomTetrimo()))
    .map((create) => create(Actions.randomTetrimo()))
    .run();

function nextGame(game: Game) {
  switch (game.status) {
    case "playing":
      return Free.of(game).map(Actions.nextTick).run();
    case "scoring":
      return Free.of(game).map(Actions.score).run();
    case "scored":
      return Free.of(game)
        .map(Actions.cleanupScore(Actions.randomTetrimo))
        .run();
    default:
      return game;
  }
}

function delayFromGame(game: Game): Maybe<number> {
  switch (game.status) {
    case "scoring": {
      return Maybe.of(2000);
    }
    case "playing": {
      return Maybe.of(game).map(Actions.levelSpeed);
    }
    case "scored": {
      return Maybe.of(0);
    }
    default: {
      return Maybe.none();
    }
  }
}

function createState(
  dispatch: (event: {
    type: "next" | "update" | "reset";
    game: Game;
    nextTick: () => unknown;
  }) => unknown
) {
  let game = createGame();
  const nextTick = () => {
    game = nextGame(game);
    dispatch({ type: "next", game, nextTick: nextTick });
  };
  return {
    get: () => game,
    update: (fn: (game: Game) => Game) => {
      game = fn(game);
      dispatch({ type: "update", game, nextTick: nextTick });
    },
    nextTick,
    reset: () => {
      game = createGame();
      dispatch({ type: "reset", game, nextTick: nextTick });
    },
  };
}

function delayedExecution(fn: () => unknown) {
  let timer: NodeJS.Timeout;
  return {
    after: (delay: number) => {
      timer = setTimeout(fn, delay);
    },
  };
}

export function Tetris(onEvent: (event: TetrisEvent) => unknown) {
  const state = createState((event) => {
    const type = Free.of(event.type)
      .map((t) => {
        switch (t) {
          case "next":
            return "tick";
          case "reset":
            return "tick";
          case "update":
          default:
            return "action";
        }
      })
      .run();

    onEvent({ type, game: event.game });

    const nextTick = delayedExecution(event.nextTick);
    switch (event.type) {
      case "next":
        return delayFromGame(event.game).whenSome(nextTick.after);
      case "reset":
        return nextTick.after(0);
      case "update":
        return;
    }
  });

  return {
    start() {
      state.reset();
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
