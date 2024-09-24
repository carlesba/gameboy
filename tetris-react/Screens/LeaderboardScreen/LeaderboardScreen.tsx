import { useMemo, useState } from "react";
import { useControlEvents } from "@/cartridge-react";
import { InputName, ViewName } from "./Name";
import { Score } from "@/tetris-react/Scores";

function ScoreLine(props: {
  position: number;
  name: React.ReactNode;
  points: number;
  highlighted?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "10px",
        padding: "0 5px",
        fontSize: "20px",
        outline: props.highlighted ? "2px solid black" : "none",
      }}
    >
      <h4 style={{ width: "50px" }}>{props.position}</h4>
      <div style={{ width: "50px" }}>{props.name}</div>
      <p style={{ width: "100px", textAlign: "right" }}>{props.points}</p>
    </div>
  );
}

export function LeaderboardScreen(props: {
  points: number;
  mode: "edit" | "view";
  scores: Score[];
  onSubmitScore: (event: Score) => unknown;
  onFinish: () => unknown;
}) {
  const [name, setName] = useState("");
  const [editing, setEditing] = useState(() => props.mode === "edit");

  const ranking = useMemo(() => {
    type EditableScore =
      | { type: "score"; score: Score }
      | { type: "edit" | "empty" };
    const ranking: EditableScore[] = [];
    let currentScoreAdded = props.mode === "view" ? true : false;

    Array.from({ length: 10 }, (_, i) => i).forEach((index) => {
      const score = props.scores[index];
      if (!score && !currentScoreAdded) {
        ranking.push({ type: "edit" });
        currentScoreAdded = true;
        return;
      }
      if (!score) {
        ranking.push({ type: "empty" });
        return;
      }
      if (props.points > score.points && !currentScoreAdded) {
        ranking.push({ type: "score", score: { name, points: props.points } });
        currentScoreAdded = true;
      }
      ranking.push({ type: "score", score });
    });
    return ranking.slice(0, 10);
  }, [props.points, name, props.scores, props.mode]);

  useControlEvents(() => {
    if (editing) return;
    props.onFinish();
  });
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
      {ranking.map((entry, index) => {
        switch (entry.type) {
          case "score":
            return (
              <ScoreLine
                key={index}
                position={index + 1}
                name={<ViewName>{entry.score.name}</ViewName>}
                points={entry.score.points}
              />
            );
          case "edit":
            return (
              <ScoreLine
                key={index}
                position={index + 1}
                name={
                  editing ? (
                    <InputName
                      onSubmit={(n) => {
                        setName(n);
                        setEditing(false);
                        props.onSubmitScore({ name: n, points: props.points });
                      }}
                    />
                  ) : (
                    <ViewName>{name}</ViewName>
                  )
                }
                points={props.points}
                highlighted
              />
            );
          case "empty":
            return (
              <ScoreLine
                key={index}
                position={index + 1}
                name={<ViewName>___</ViewName>}
                points={0}
                highlighted={false}
              />
            );
        }
      })}
    </div>
  );
}
