import { PlayFieldFactory, Playfield } from "./playfield";
import { Tetrimino, TetriminoFactory } from "./tetrimino";

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
  static empty() {
    return new GameFactory({
      playfield: PlayFieldFactory.empty().create(),
      score: 0,
      level: 0,
      lines: 0,
      scoringLines: [],
      nextPiece: TetriminoFactory.empty(),
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
    this.value = { ...this.value, playfield };
    return this;
  };
  withScore = (score: number) => {
    this.value = { ...this.value, score };
    return this;
  };
  withScoringLines = (scoringLines: number[]) => {
    this.value = { ...this.value, scoringLines };
    return this;
  };
  cleanScoringLines = () => {
    this.value = { ...this.value, scoringLines: [] };
    return this;
  };
  withLevel = (level: number) => {
    this.value = { ...this.value, level };
    return this;
  };
  withStatus = (status: Game["status"]) => {
    this.value = { ...this.value, status };
    return this;
  };
  withNextPiece = (nextPiece: Tetrimino) => {
    this.value = { ...this.value, nextPiece };
    return this;
  };
  withLines = (lines: number) => {
    this.value = { ...this.value, lines };
    return this;
  };
  create() {
    return this.value;
  }
}
