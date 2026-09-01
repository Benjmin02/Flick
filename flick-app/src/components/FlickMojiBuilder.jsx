import React, { useState } from "react";
import { C, FACES, ACCESSORIES, BG_GRADIENTS } from "../theme.js";
import { FlickMojiAvatar, GradButton, SectionLabel } from "./Primitives.jsx";

export function FlickMojiBuilder({ initial, onSave, onCancel, saveLabel }) {
  const [emoji, setEmoji] = useState(initial?.emoji || FACES[0]);
  const [bg, setBg] = useState(initial?.bg ?? 0);
  const [accessory, setAccessory] = useState(initial?.accessory ?? null);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ display: "flex", justifyContent: "center", padding: "28px 0 18px" }}>
        <FlickMojiAvatar flickmoji={{ emoji, bg, accessory }} size={110} ring />
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "0 20px 20px" }}>
        <SectionLabel>Pick a face</SectionLabel>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 8, marginBottom: 22 }}>
          {FACES.map((f) => (
            <button key={f} onClick={() => setEmoji(f)} style={{
              fontSize: 24, padding: "8px 0", borderRadius: 12, cursor: "pointer",
              background: emoji === f ? C.panel2 : "transparent",
              border: emoji === f ? `2px solid ${C.pink}` : `2px solid transparent`,
            }}>{f}</button>
          ))}
        </div>
        <SectionLabel>Pick a color</SectionLabel>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10, marginBottom: 22 }}>
          {BG_GRADIENTS.map((g, i) => (
            <button key={i} onClick={() => setBg(i)} style={{
              height: 38, borderRadius: 12, cursor: "pointer",
              background: `linear-gradient(135deg, ${g[0]}, ${g[1]})`,
              border: bg === i ? `3px solid ${C.text}` : "3px solid transparent",
            }} />
          ))}
        </div>
        <SectionLabel>Add a touch (optional)</SectionLabel>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 8 }}>
          {ACCESSORIES.map((a, i) => (
            <button key={i} onClick={() => setAccessory(a)} style={{
              fontSize: 20, padding: "8px 0", borderRadius: 12, cursor: "pointer",
              background: accessory === a ? C.panel2 : "transparent",
              border: accessory === a ? `2px solid ${C.cyan}` : `2px solid transparent`,
              color: C.text,
            }}>{a || "—"}</button>
          ))}
        </div>
      </div>
      <div style={{ padding: 16, display: "flex", gap: 10, borderTop: `1px solid ${C.border}` }}>
        {onCancel && (
          <button onClick={onCancel} style={{
            flex: 1, background: "transparent", border: `1px solid ${C.border}`, color: C.muted,
            borderRadius: 14, padding: "13px 0", fontWeight: 600, cursor: "pointer",
          }}>Cancel</button>
        )}
        <div style={{ flex: onCancel ? 2 : 1 }}>
          <GradButton onClick={() => onSave({ emoji, bg, accessory })} style={{ width: "100%" }}>
            {saveLabel || "Continue"}
          </GradButton>
        </div>
      </div>
    </div>
  );
}
