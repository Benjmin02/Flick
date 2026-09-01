export const C = {
  bg: "#0A0913",
  panel: "#151222",
  panel2: "#1C1830",
  border: "#2A2540",
  text: "#F5F3FA",
  muted: "#8B87A0",
  faint: "#5B5773",
  pink: "#FF3D9A",
  cyan: "#35E6C8",
  violet: "#7B5CFF",
  yellow: "#FFD93D",
  danger: "#FF5C6C",
};
export const GRAD = `linear-gradient(135deg, ${C.pink}, ${C.violet})`;
export const GRAD2 = `linear-gradient(135deg, ${C.cyan}, ${C.violet})`;
export const FONT_DISPLAY = "'Space Grotesk', 'Segoe UI', sans-serif";
export const FONT_BODY = "'Inter', 'Segoe UI', sans-serif";

export const FACES = ["😀","😎","🥳","😇","🤖","👽","🐱","🦊","🐻","🐼","🦄","🌙","🔥","⚡","💀","👑","🌈","🐸","🐧","🦋","🐙","🌵","🍉","🎃"];
export const ACCESSORIES = [null, "🎧", "🕶️", "🎩", "✨", "⭐", "🧢", "💫", "👑"];
export const BG_GRADIENTS = [
  ["#FF3D9A", "#7B5CFF"], ["#35E6C8", "#7B5CFF"], ["#FF6B6B", "#FFD93D"],
  ["#4FACFE", "#00F2FE"], ["#FA709A", "#FEE140"], ["#30CFD0", "#330867"],
  ["#A18CD1", "#FBC2EB"], ["#FF9A9E", "#FAD0C4"], ["#84FAB0", "#8FD3F4"],
];
export const STICKERS = ["😂","❤️","🔥","💯","😍","🤙","✨","🎉","😱","👀","💀","🙌"];
export const PEN_COLORS = ["#F5F3FA","#FF3D9A","#35E6C8","#7B5CFF","#FFD93D","#FF6B6B","#4FACFE","#0A0913"];
export const BG_FILLS = ["#151222","#3B1E4F","#1B3A4B","#4B1E2F","#1E4B3A","#4B3A1E","#241E4B","#0A0913"];

export function inputStyle() {
  return {
    background: C.panel2, border: `1px solid ${C.border}`, borderRadius: 14,
    padding: "13px 16px", color: C.text, fontFamily: FONT_BODY, fontSize: 14.5,
    outline: "none", width: "100%", boxSizing: "border-box",
  };
}
