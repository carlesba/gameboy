import { Playfield } from "./playfield";
import { Tetrimino } from "./tetrimino";

export type Game = {
  playfield: Playfield;
  score: number;
  level: number;
  nextPiece: Tetrimino;
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
      nextPiece: playfield.piece,
      status: "playing",
    });
  }

  static of(game: Game) {
    return new GameFactory(game);
  }
  scoreFromLines(lines: number) {
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
  score(lines: number) {
    const score = this.value.level * this.scoreFromLines(lines);
    this.withScore(score);
    return this;
  }

  withPlayfield = (playfield: Playfield) => {
    this.value = { ...this.value, playfield };
    return this;
  };
  withScore = (score: number) => {
    this.value = { ...this.value, score };
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
  create() {
    return this.value;
  }
}
