"use client";
import { GameBoy } from "@/gameboy-react";
import { TetrisCartridge } from "@/tetris-react";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <GameBoy Cartridge={TetrisCartridge} />
    </main>
  );
}
