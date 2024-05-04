import { Free } from "./Free";
import { Maybe } from "./Maybe";
import { Actions } from "./actions";
import { Identity } from "./functional";
import { Game } from "./game";

type Dispatch<E> = (event: E) => unknown;

type TetrisEvent =
  | {
      type: "tick" | "action";
      game: Game;
    }
  | { type: "fps"; fps: number };

const SIZE = { row: 20, col: 10 };

const createGame = () =>
  Free.of(Actions.createGame)
    .map((create) => create(SIZE))
    .map((create) => create(Actions.randomTetrimo()))
    .map((create) => create(Actions.randomTetrimo()))
    .run();

class Timer {
  time: number;
  fps: number;
  constructor(fps: number) {
    this.time = new Date().getTime();
    this.fps = fps;
  }
  next = (): Maybe<number> => {
    const now = new Date().getTime();
    const diff = now - this.time;
    const fps = Math.round(1000 / diff);

    if (fps > this.fps) {
      return Maybe.none();
    }
    this.time = now;
    return Maybe.of(fps);
  };
}

class Framer {
  frames: number;

  constructor() {
    this.frames = 1;
  }
  static create() {
    return new Framer();
  }
  nextFrame = (frames: number) => {
    this.frames = frames;
  };
  nextFrameFromLevel = (level: number) => {
    this.frames = Free.of(level)
      .map((l) => {
        if (l === 0) return 48;
        if (l === 1) return 43;
        if (l === 2) return 38;
        if (l === 3) return 33;
        if (l === 4) return 28;
        if (l === 5) return 23;
        if (l === 6) return 18;
        if (l === 7) return 13;
        if (l === 8) return 8;
        if (l === 9) return 5;
        if (l >= 10 && l <= 12) return 5;
        if (l >= 13 && l <= 15) return 4;
        if (l >= 16 && l <= 18) return 3;
        if (l <= 29) return 2;
        return 1;
      })
      .run();
  };
  next = () => {
    this.frames -= 1;
    if (this.frames === 0) {
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
  const setGame = (g: Game) => (game = g);
  const dispatchEvent = (type: StateEvent["type"]) => (game: Game) =>
    dispatch({ type, game });

  return {
    get: () => game,
    update: (fn: (game: Game) => Game) => {
      return Maybe.some(game)
        .map(fn)
        .whenSome(setGame)
        .whenSome(dispatchEvent("update"));
    },
    nextTick() {
      return Maybe.of(game.status)
        .map((status) => {
          switch (status) {
            case "playing":
              return Actions.nextTick(game);
            case "scoring":
              // TODO: merge these actions and remove the scored status
              return Free.of(game)
                .map(Actions.score)
                .map(Actions.cleanupScore(Actions.randomTetrimo))
                .run();
            default:
              return game;
          }
        })
        .whenSome(setGame)
        .whenSome(dispatchEvent("next"))
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
    let type;
    if (event.type === "update") {
      type = "action" as const;
    } else {
      type = "tick" as const;
    }
    onEvent({ type, game: event.game });
  });

  const framer = Framer.create();
  // TODO: achieve 60fps
  const timer = new Timer(60);
  const setFrames = (g: Game) => {
    switch (g.status) {
      case "scoring": {
        const frames = g.scoringLines.length === 0 ? 5 : 30;
        console.log("scoring", frames);
        return framer.nextFrame(frames);
      }
      case "playing":
        return framer.nextFrameFromLevel(g.level);
    }
  };

  const ticker = () => {
    timer.next().whenSome((fps) => {
      onEvent({ type: "fps", fps });
      framer.next().map(state.nextTick).whenSome(setFrames);
    });
    requestAnimationFrame(ticker);
  };

  return {
    start() {
      ticker();
    },
    action(action: "left" | "right" | "down" | "rotateA" | "rotateB") {
      Maybe.of(action)
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
        .flatMap(state.update)
        .flatMap(
          (g): Maybe<Game> =>
            g.status === "scoring" ? Maybe.some(g) : Maybe.none(),
        )
        .whenSome(setFrames);
    },
  };
}
