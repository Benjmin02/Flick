import React from "react";
import { ArrowLeft } from "lucide-react";
import { C, FONT_DISPLAY } from "../theme.js";
import { LogoMark } from "./Primitives.jsx";

export function TopBar({ title, onBack, right }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "16px 18px 12px", flexShrink: 0,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
        {onBack && (
          <button onClick={onBack} style={{ background: "none", border: "none", color: C.text, cursor: "pointer", display: "flex" }}>
            <ArrowLeft size={20} />
          </button>
        )}
        {!onBack && <LogoMark size={22} />}
        <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 19, color: C.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {title}
        </div>
      </div>
      {right}
    </div>
  );
}
