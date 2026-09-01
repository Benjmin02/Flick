import React, { useState, useRef, useEffect } from "react";
import { X, Trash2, Pencil, Smile, Sparkles, Send } from "lucide-react";
import { C, FONT_DISPLAY, PEN_COLORS, STICKERS, BG_FILLS, inputStyle } from "../theme.js";
import { GradButton, Swatch, ModeTab, Checkbox } from "./Primitives.jsx";

export function CameraScreen({ friends, onClose, onShare }) {
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const [mode, setMode] = useState("pen");
  const [penColor, setPenColor] = useState(PEN_COLORS[0]);
  const [sticker, setSticker] = useState(STICKERS[0]);
  const [caption, setCaption] = useState("");
  const [picker, setPicker] = useState(false);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [alsoStory, setAlsoStory] = useState(false);

  useEffect(() => {
    const c = canvasRef.current;
    const ctx = c.getContext("2d");
    ctx.fillStyle = BG_FILLS[0];
    ctx.fillRect(0, 0, c.width, c.height);
  }, []);

  function fillBg(color) {
    const c = canvasRef.current;
    const ctx = c.getContext("2d");
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, c.width, c.height);
  }
  function getPos(e) {
    const rect = canvasRef.current.getBoundingClientRect();
    const t = e.touches && e.touches[0];
    const clientX = t ? t.clientX : e.clientX;
    const clientY = t ? t.clientY : e.clientY;
    return {
      x: (clientX - rect.left) * (canvasRef.current.width / rect.width),
      y: (clientY - rect.top) * (canvasRef.current.height / rect.height),
    };
  }
  function down(e) {
    if (mode === "sticker") { stamp(e); return; }
    drawing.current = true;
    const ctx = canvasRef.current.getContext("2d");
    const { x, y } = getPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  }
  function move(e) {
    if (mode !== "pen" || !drawing.current) return;
    const ctx = canvasRef.current.getContext("2d");
    const { x, y } = getPos(e);
    ctx.lineTo(x, y);
    ctx.strokeStyle = penColor;
    ctx.lineWidth = 7;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
  }
  function up() { drawing.current = false; }
  function stamp(e) {
    const ctx = canvasRef.current.getContext("2d");
    const { x, y } = getPos(e);
    ctx.font = "54px serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(sticker, x, y);
  }
  function clearCanvas() { fillBg(BG_FILLS[0]); }

  function composite() {
    const c = canvasRef.current;
    const out = document.createElement("canvas");
    out.width = c.width; out.height = c.height;
    const ctx = out.getContext("2d");
    ctx.drawImage(c, 0, 0);
    if (caption.trim()) {
      ctx.font = "bold 24px sans-serif";
      ctx.textAlign = "center";
      const x = out.width / 2, y = out.height - 34;
      ctx.strokeStyle = "rgba(0,0,0,0.55)";
      ctx.lineWidth = 6;
      ctx.strokeText(caption, x, y);
      ctx.fillStyle = "#fff";
      ctx.fillText(caption, x, y);
    }
    return out.toDataURL("image/jpeg", 0.75);
  }

  function toggleFriend(f) {
    setSelectedFriends((s) => (s.includes(f) ? s.filter((x) => x !== f) : [...s, f]));
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px 8px" }}>
        <button onClick={onClose} style={{ background: "none", border: "none", color: C.text, cursor: "pointer" }}><X size={22} /></button>
        <div style={{ color: C.text, fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 15 }}>New Flick</div>
        <button onClick={clearCanvas} style={{ background: "none", border: "none", color: C.faint, cursor: "pointer" }}><Trash2 size={19} /></button>
      </div>

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "6px 20px" }}>
        <canvas
          ref={canvasRef}
          width={300} height={420}
          style={{ width: "100%", maxWidth: 260, aspectRatio: "300/420", borderRadius: 22, border: `1px solid ${C.border}`, touchAction: "none", cursor: mode === "sticker" ? "copy" : "crosshair" }}
          onMouseDown={down} onMouseMove={move} onMouseUp={up} onMouseLeave={up}
          onTouchStart={down} onTouchMove={move} onTouchEnd={up}
        />
      </div>

      <div style={{ padding: "0 18px" }}>
        <input
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Add a caption…"
          maxLength={60}
          style={{ ...inputStyle(), textAlign: "center", marginBottom: 12 }}
        />
      </div>

      <div style={{ display: "flex", gap: 6, padding: "0 14px 8px", justifyContent: "center" }}>
        <ModeTab active={mode === "pen"} onClick={() => setMode("pen")} icon={<Pencil size={14} />} label="Draw" />
        <ModeTab active={mode === "sticker"} onClick={() => setMode("sticker")} icon={<Smile size={14} />} label="Sticker" />
        <ModeTab active={mode === "bg"} onClick={() => setMode("bg")} icon={<Sparkles size={14} />} label="Backdrop" />
      </div>

      <div style={{ display: "flex", gap: 8, padding: "0 18px 14px", overflowX: "auto" }}>
        {mode === "pen" && PEN_COLORS.map((c) => (
          <Swatch key={c} color={c} active={c === penColor} onClick={() => setPenColor(c)} />
        ))}
        {mode === "sticker" && STICKERS.map((s) => (
          <button key={s} onClick={() => setSticker(s)} style={{
            fontSize: 20, background: sticker === s ? C.panel2 : "transparent",
            border: sticker === s ? `2px solid ${C.pink}` : "2px solid transparent",
            borderRadius: 10, width: 36, height: 36, flexShrink: 0, cursor: "pointer",
          }}>{s}</button>
        ))}
        {mode === "bg" && BG_FILLS.map((c) => (
          <Swatch key={c} color={c} onClick={() => fillBg(c)} />
        ))}
      </div>

      <div style={{ padding: 16, borderTop: `1px solid ${C.border}` }}>
        <GradButton style={{ width: "100%" }} onClick={() => setPicker(true)}>
          <Send size={16} /> Share flick
        </GradButton>
      </div>

      {picker && (
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 250, display: "flex", alignItems: "flex-end" }}>
          <div style={{ background: C.panel, width: "100%", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 18, maxHeight: "75%", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div style={{ color: C.text, fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 16 }}>Send to</div>
              <button onClick={() => setPicker(false)} style={{ background: "none", border: "none", color: C.faint, cursor: "pointer" }}><X size={20} /></button>
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 4px", cursor: "pointer" }}>
              <Checkbox checked={alsoStory} onChange={() => setAlsoStory((s) => !s)} />
              <Sparkles size={16} color={C.cyan} />
              <span style={{ color: C.text, fontSize: 14 }}>Add to My Story</span>
            </label>
            <div style={{ overflowY: "auto", flex: 1, marginTop: 6 }}>
              {friends.length === 0 && (
                <div style={{ color: C.faint, fontSize: 12.5, padding: "10px 4px" }}>Add friends first to send them a flick.</div>
              )}
              {friends.map((f) => (
                <label key={f} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 4px", cursor: "pointer" }}>
                  <Checkbox checked={selectedFriends.includes(f)} onChange={() => toggleFriend(f)} />
                  <span style={{ color: C.text, fontSize: 14 }}>@{f}</span>
                </label>
              ))}
            </div>
            <div style={{ marginTop: 12 }}>
              <GradButton
                style={{ width: "100%" }}
                disabled={selectedFriends.length === 0 && !alsoStory}
                onClick={() => onShare(composite(), selectedFriends, alsoStory)}
              >
                Send
              </GradButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
