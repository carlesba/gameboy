"use client";
import { GameView } from "@/tetris/Tetris";
import { useEffect, useState } from "react";

export default function Home() {
  const [started, setStarted] = useState(false);
  useEffect(() => {
    setStarted(true);
  }, []);
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      {!started ? (
        <button onClick={() => setStarted(true)}>start</button>
      ) : (
        <GameView />
      )}
    </main>
  );
}
