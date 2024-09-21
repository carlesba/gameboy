import { useEffect } from "react";

const ANIMATIONS = `
@keyframes appear {
  from{
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
@keyframes slideDown {
  from{
    transform: translateY(-200px);
  }
  100% {
    transform: translateY(0);
  }
}
`;

export function StartScreen(props: { onStart: () => unknown }) {
  const { onStart } = props;
  useEffect(() => {
    let timer = setTimeout(() => onStart(), 6000);
    return () => {
      clearTimeout(timer);
    };
  }, [onStart]);

  return (
    <>
      <style>{ANIMATIONS}</style>
      <div
        style={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <h1 style={{ animation: "slideDown 5s linear", margin: 0 }}>Tetris</h1>
        <p
          style={{
            opacity: 0,
            animation: "appear 300ms forwards",
            animationDelay: "5s",
            margin: 0,
          }}
        >
          by @carlesba
        </p>
      </div>
    </>
  );
}
