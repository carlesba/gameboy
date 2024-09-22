import { useStorage } from "@/cartridge-react";

export type Score = {
  name: string;
  points: number;
  // level: number;
};

const scoreFromStorage = (storage: string) => {
  try {
    const parsed = JSON.parse(storage);
    if (!Array.isArray(parsed)) {
      return [];
    }
    const scores: Array<Score> = [];
    parsed.forEach((value: Score) => {
      if (
        typeof value.name === "string" &&
        typeof value.points === "number"
        // typeof value.level === "number"
      ) {
        scores.push(value);
      }
    });
    return scores;
  } catch (e) {
    return [];
  }
};

const STORAGE_KEY = "score";
export function useScoreStore() {
  const store = useStorage(STORAGE_KEY);

  function read() {
    const writtenScore = store.get();
    return scoreFromStorage(writtenScore ?? "");
  }
  function write(scores: Array<Score>) {
    store.set(JSON.stringify(scores));
  }

  return {
    qualifyingScore(score: number) {
      if (score <= 0) {
        return false;
      }
      const index = read().findIndex((s) => s.points < score);
      return index === -1 || index < 10;
    },
    rankings() {
      return read();
    },
    submit(name: string, points: number) {
      const scores = read();
      const newScore = { name, points };
      scores.push(newScore);
      scores.sort((a, b) => b.points - a.points);
      write(scores.slice(0, 10));
    },
  };
}
