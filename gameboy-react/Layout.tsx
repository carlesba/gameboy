import { CSSProperties } from "react";

const global = `
:root{
  --red: #ef4444;
  --cyan: #06b6d4;
  --yellow: #eab308;
  --green: #22c55e;
  --blue: #3b82f6;
  --purple: #8b5cf6;
  --orange: #f97316;
  --screen: #ACB1A4;
  --device: #DFD6DA;
  --button-red: #B3214B;
  --button-light-shadow: rgba(248, 238, 247, 0.6);
  --black: #282828;
  --pad-color: #282828
}
body {
  background-color: var(--device);
  margin: 0;
  overflow: hidden;
  width: 100vw;
  height: 100vh;
}

@keyframes blink {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
`;
const layout = (): CSSProperties => ({
  display: "flex",
  flexDirection: "column",
  paddingTop: "30px",
  height: "100vh",
});
const screenFrame = (): CSSProperties => ({
  background: "var(--black)",
  margin: "1vmin",
  borderRadius: "25px",
  padding: "20px 20px 50px",
  width: "330px",
  alignSelf: "center",
  position: "relative",
  boxShadow: "inset rgba(255, 255, 255, 0.9) -1px -1px 0px",
});
const screen = (): CSSProperties => ({
  borderRadius: "10px",
  background: "var(--screen)",
  padding: "10px",
  height: "400px",
  width: "310px",
  boxShadow: "inset rgba(0, 0, 0, 0.9) -1px -1px 3px",
});
const gameboy = (): CSSProperties => ({
  position: "absolute",
  bottom: "15px",
  left: "20px",
  fontSize: "20px",
  fontWeight: "bold",
  fontStyle: "italic",
  color: "rgba(240, 240, 240, 0.3)",
  textShadow: "1px 1px 1px rgba(0, 0, 0, 0.5)",
});

export function Layout(props: {
  screen: React.ReactNode;
  controls: React.ReactNode;
}) {
  return (
    <>
      <style>{global}</style>
      <div style={layout()}>
        <div style={screenFrame()}>
          <div style={screen()}>{props.screen}</div>
          <div style={gameboy()}>WebGameBoy</div>
        </div>
        {props.controls}
      </div>
    </>
  );
}
