import { useControlEvents } from "@/cartridge-react";
import { useSounds } from "../Sounds";

const Section = (props: { children: React.ReactNode }) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      gap: "8px",
    }}
  >
    {props.children}
  </div>
);
export function HowToPlayScreen(props: { onDone: () => unknown }) {
  const sounds = useSounds();
  useControlEvents((key) => {
    switch (key) {
      case "A":
      case "B":
      case "start":
        sounds.selectSound();
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
      <Section>
        <h2>How to Play</h2>
        <Section>
          <h3>On your phone</h3>
          <p>Use the buttons you see on the screen.</p>
          <p>The pad will allow to move the selection in the screen.</p>
          <p>Use A or B to click the selected option.</p>
        </Section>
        <Section>
          <h3>On your computer</h3>
          <p>Use the arrow keys to move the selection in the screen.</p>
          <p>Use A on your keyboard to press A button</p>
          <p>Use S on your keyboard to press B button</p>
          <p>Use Enter on your keyboard to press Start button</p>
        </Section>

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
      </Section>
    </div>
  );
}
