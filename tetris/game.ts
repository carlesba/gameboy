import { Playfield } from "./playfield";
import { Tetrimino } from "./tetrimino";

export type Game = {
  playfield: Playfield;
  score: number;
  level: number;
  nextPiece: Tetrimino;
  scoringLines: number[];
  lines: number;
  status: "playing" | "pause" | "gameover" | "scoring" | "scored";
};

export class GameFactory {
  private value: Game;
  constructor(game: Game) {
    this.value = game;
  }
  static fromPlayfield(playfield: Playfield) {
    return new GameFactory({
      playfield,
      score: 0,
      level: 0,
      lines: 0,
      scoringLines: [],
      nextPiece: playfield.piece,
      status: "playing",
    });
  }

  static of(game: Game) {
    return new GameFactory(game);
  }
  static scoreFromLines(lines: number) {
    switch (lines) {
      case 1:
        return 100;
      case 2:
        return 300;
      case 3:
        return 500;
      case 4:
        return 800;
      default:
        return 0;
    }
  }

  withPlayfield = (playfield: Playfield) => {
    return GameFactory.of({ ...this.value, playfield });
  };
  withScore = (score: number) => {
    return GameFactory.of({ ...this.value, score });
  };
  withScoringLines = (scoringLines: number[]) => {
    return GameFactory.of({ ...this.value, scoringLines });
  };
  cleanScoringLines = () => {
    return GameFactory.of({ ...this.value, scoringLines: [] });
  };
  withLevel = (level: number) => {
    return GameFactory.of({ ...this.value, level });
  };
  withStatus = (status: Game["status"]) => {
    return GameFactory.of({ ...this.value, status });
  };
  withNextPiece = (nextPiece: Tetrimino) => {
    return GameFactory.of({ ...this.value, nextPiece });
  };
  withLines = (lines: number) => {
    return GameFactory.of({ ...this.value, lines });
  };
  create() {
    return this.value;
  }
}
