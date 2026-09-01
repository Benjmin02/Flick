import React, { useState, useRef, useEffect } from "react";
import { ArrowLeft, Camera, Send, Flame, X } from "lucide-react";
import { C, GRAD, GRAD2, FONT_DISPLAY, FONT_BODY, inputStyle } from "../theme.js";
import { FlickMojiAvatar } from "./Primitives.jsx";

export function ChatDetail({ me, withUser, flickmoji, messages, streak, onBack, onSendText, onOpenCamera }) {
  const [text, setText] = useState("");
  const scrollRef = useRef(null);
  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [messages.length]);
  const [viewSnap, setViewSnap] = useState(null);

  function submit() {
    if (!text.trim()) return;
    onSendText(text);
    setText("");
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px 10px", borderBottom: `1px solid ${C.border}` }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: C.text, cursor: "pointer", display: "flex" }}>
          <ArrowLeft size={20} />
        </button>
        <FlickMojiAvatar flickmoji={flickmoji} size={38} />
        <div style={{ flex: 1 }}>
          <div style={{ color: C.text, fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 15 }}>@{withUser}</div>
        </div>
        {streak > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 3, color: C.yellow, fontSize: 13, fontFamily: FONT_DISPLAY, fontWeight: 600 }}>
            <Flame size={14} fill={C.yellow} /> {streak}
          </div>
        )}
      </div>

      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "14px 14px 6px", display: "flex", flexDirection: "column", gap: 8 }}>
        {messages.length === 0 && (
          <div style={{ color: C.faint, fontFamily: FONT_BODY, fontSize: 13, textAlign: "center", marginTop: 40 }}>
            This is the start of you and @{withUser}. Send a flick 👋
          </div>
        )}
        {messages.map((m) => {
          const mine = m.from.toLowerCase() === me.toLowerCase();
          return (
            <div key={m.id} style={{ display: "flex", justifyContent: mine ? "flex-end" : "flex-start" }}>
              {m.type === "text" ? (
                <div style={{
                  maxWidth: "75%", padding: "9px 13px", borderRadius: 18,
                  borderBottomRightRadius: mine ? 4 : 18, borderBottomLeftRadius: mine ? 18 : 4,
                  background: mine ? GRAD : C.panel2, color: "#fff",
                  fontFamily: FONT_BODY, fontSize: 14, lineHeight: 1.4, wordBreak: "break-word",
                }}>{m.content}</div>
              ) : (
                <button onClick={() => setViewSnap(m)} style={{
                  padding: 0, border: "none", cursor: "pointer", borderRadius: 16, overflow: "hidden",
                  width: 120, height: 160, background: C.panel2, position: "relative",
                }}>
                  <img src={m.content} alt="snap" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  <div style={{ position: "absolute", bottom: 6, left: 6, background: "rgba(0,0,0,0.5)", borderRadius: 8, padding: "2px 7px", fontSize: 10, color: "#fff", fontFamily: FONT_DISPLAY }}>
                    Tap to view
                  </div>
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: 12, borderTop: `1px solid ${C.border}` }}>
        <button onClick={onOpenCamera} style={{
          width: 40, height: 40, borderRadius: 999, background: GRAD2, border: "none",
          display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0,
        }}>
          <Camera size={18} color="#0A0913" />
        </button>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="Send a flick..."
          style={{ ...inputStyle(), padding: "10px 14px", fontSize: 14 }}
        />
        <button onClick={submit} disabled={!text.trim()} style={{
          width: 40, height: 40, borderRadius: 999, border: "none", flexShrink: 0,
          background: text.trim() ? GRAD : C.panel2, cursor: text.trim() ? "pointer" : "default",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Send size={16} color={text.trim() ? "#fff" : C.faint} />
        </button>
      </div>

      {viewSnap && (
        <div onClick={() => setViewSnap(null)} style={{
          position: "absolute", inset: 0, background: "#000", zIndex: 300,
          display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
        }}>
          <img src={viewSnap.content} alt="snap" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
          <div style={{ position: "absolute", top: 18, right: 18, color: "#fff" }}><X size={22} /></div>
        </div>
      )}
    </div>
  );
}
