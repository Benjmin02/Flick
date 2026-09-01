import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { FONT_DISPLAY, FONT_BODY } from "../theme.js";
import { FlickMojiAvatar } from "./Primitives.jsx";
import { timeAgo } from "../lib/utils.js";

export function StoryViewer({ user, items, flickmoji, onClose }) {
  const [idx, setIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    setProgress(0);
    const start = Date.now();
    const dur = 4200;
    const id = setInterval(() => {
      const p = (Date.now() - start) / dur;
      if (p >= 1) {
        clearInterval(id);
        if (idx < items.length - 1) setIdx((i) => i + 1);
        else onClose();
      } else setProgress(p);
    }, 40);
    return () => clearInterval(id);
  }, [idx]);

  function tap(dir) {
    if (dir === "next") { if (idx < items.length - 1) setIdx((i) => i + 1); else onClose(); }
    else { if (idx > 0) setIdx((i) => i - 1); }
  }

  return (
    <div style={{ position: "absolute", inset: 0, background: "#000", zIndex: 300, display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", gap: 4, padding: "10px 10px 0" }}>
        {items.map((_, i) => (
          <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: "rgba(255,255,255,0.25)", overflow: "hidden" }}>
            <div style={{ height: "100%", background: "#fff", width: `${i < idx ? 100 : i === idx ? progress * 100 : 0}%` }} />
          </div>
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px" }}>
        <FlickMojiAvatar flickmoji={flickmoji} size={32} />
        <div style={{ color: "#fff", fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 14 }}>@{user}</div>
        <div style={{ color: "rgba(255,255,255,0.6)", fontFamily: FONT_BODY, fontSize: 12 }}>{timeAgo(items[idx].ts)}</div>
        <div style={{ flex: 1 }} />
        <button onClick={onClose} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer" }}><X size={20} /></button>
      </div>
      <div style={{ flex: 1, position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <img src={items[idx].content} alt="story" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
        <div onClick={() => tap("prev")} style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "35%", cursor: "pointer" }} />
        <div onClick={() => tap("next")} style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "35%", cursor: "pointer" }} />
      </div>
    </div>
  );
}
