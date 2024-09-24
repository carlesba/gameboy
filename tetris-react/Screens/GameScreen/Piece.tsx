import { Game } from "@/tetris/game";
import { Block } from "./Block";

export function Piece(props: { value: Game["nextPiece"] }) {
  return (
    <div>
      {Array.from(props.value.positions).map((p, i) => (
        <Block key={i} col={p.col} row={p.row} color={props.value.color} />
      ))}
    </div>
  );
}
