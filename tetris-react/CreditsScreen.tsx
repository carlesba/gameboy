import { useControlEvents } from "@/cartridge-react";

export function CreditsScreen(props: { onDone: () => unknown }) {
  useControlEvents((key) => {
    switch (key) {
      case "A":
      case "B":
      case "start":
        props.onDone();
        break;
    }
  });
  return (
    <div>
      <style>
        {`@keyframes blink {
  0%, 100% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
}`}
      </style>
      <div
        style={{
          flexDirection: "column",
          display: "flex",
          alignItems: "start",
          justifyContent: "start",
          gap: "8px",
        }}
      >
        <h2>Credits</h2>
        <p>This projects is done for fun and love by Carles Ballester.</p>
        <p>If you want to learn more about me, please visit:</p>
        <a target="_blank" href="https://www.linkedin.com/in/carlesbaas/">
          LinkedIn
        </a>
        <a target="_blank" href="https://github.com/carlesba">
          Github
        </a>
        <button
          style={{
            animation: "blink 1.2s infinite",
            borderRadius: "4px",
            color: "rgba(0, 0, 0, 0.8)",
            border: "none",
            outline: "1px solid ",
            padding: "4px 8px",
            backgroundColor: "transparent",
            outlineColor: "currentColor",
          }}
          onClick={props.onDone}
        >
          Back
        </button>
      </div>
    </div>
  );
}
