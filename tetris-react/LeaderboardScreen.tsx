import { useState } from "react";
import { Score, useScoreStore } from "./ScoreStore";
import { useControlEvents } from "@/cartridge-react";

function ScoreLine(props: {
  position: number;
  name: React.ReactNode;
  points: number;
  highlighted: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
      }}
    >
      <h5>{props.position}</h5>
      <div>{props.name}</div>
      <p>{props.points}</p>
    </div>
  );
}
function InsertName() {
  return <p>AAA</p>;
}

export function LeaderboardScreen(props: {
  points: number;
  // scores: Score[];
  onSubmitScore: (event: Score) => unknown;
}) {
  const [name, setName] = useState("");
  const scoreStore = useScoreStore();

  useControlEvents((key) => {
    console.log(key);
    // switch (key) {
    //   case "down":
    //     setLevel((level) => (level + 1) % LEVELS.length);
    //     break;
    //   case "up":
    //     setLevel((level) => (level - 1 + LEVELS.length) % LEVELS.length);
    //     break;
    //   case "A":
    //   case "B":
    //   case "start":
    //     props.onSelect({ level: level });
    //     break;
    // }
  });
  const editPosition = 0;
  const scores: Score[] = [];
  const editing = true;
  return (
    <div
      style={{
        position: "relative",
        height: "100%",
        display: "flex",
        gap: "8px",
        flexDirection: "column",
      }}
    >
      <h1>Top Scores</h1>
      <ScoreLine highlighted position={1} name={<InsertName />} points={200} />
    </div>
  );
}
