"use client";
import { GameBoy } from "@/gameboy-react";
import { TetrisCartridge } from "@/tetris-react";

const GAMES = [{ name: "Tetris", Cartridge: TetrisCartridge }];

export default function Home() {
  return (
    <main
      style={{
        display: "flex",
        minHeight: "100vh",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "1rem",
      }}
    >
      <GameBoy games={GAMES} />
    </main>
  );
}
