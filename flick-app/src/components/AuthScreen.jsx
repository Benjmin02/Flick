import React, { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { C, GRAD, FONT_DISPLAY, FONT_BODY, inputStyle } from "../theme.js";
import { LogoMark, GradButton } from "./Primitives.jsx";

export function AuthScreen({ onLogin, onSignupCreds, error, busy }) {
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);

  function submit() {
    if (mode === "login") onLogin(username, password);
    else onSignupCreds(username, password);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: "0 24px" }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
        <div style={{ animation: "flickPop 0.5s cubic-bezier(.2,1.4,.4,1)" }}>
          <div style={{
            width: 84, height: 84, borderRadius: 24, background: GRAD, display: "flex",
            alignItems: "center", justifyContent: "center", marginBottom: 18,
            boxShadow: `0 12px 32px ${C.pink}55`,
          }}>
            <LogoMark size={52} />
          </div>
        </div>
        <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 34, color: C.text, letterSpacing: -0.5 }}>Flick</div>
        <div style={{ color: C.muted, fontFamily: FONT_BODY, fontSize: 14, marginTop: 4, marginBottom: 32, textAlign: "center" }}>
          Snap it. Send it. Flick it.
        </div>

        <div style={{ display: "flex", background: C.panel2, borderRadius: 14, padding: 4, marginBottom: 22, width: "100%" }}>
          {["login", "signup"].map((m) => (
            <button key={m} onClick={() => setMode(m)} style={{
              flex: 1, padding: "9px 0", borderRadius: 10, border: "none", cursor: "pointer",
              fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 13.5,
              background: mode === m ? C.panel : "transparent",
              color: mode === m ? C.text : C.muted,
            }}>{m === "login" ? "Log in" : "Sign up"}</button>
          ))}
        </div>

        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 12 }}>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value.replace(/\s/g, ""))}
            placeholder="Username"
            style={inputStyle()}
            onKeyDown={(e) => e.key === "Enter" && submit()}
          />
          <div style={{ position: "relative" }}>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              type={showPw ? "text" : "password"}
              style={inputStyle()}
              onKeyDown={(e) => e.key === "Enter" && submit()}
            />
            <button onClick={() => setShowPw((s) => !s)} style={{
              position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
              background: "none", border: "none", color: C.faint, cursor: "pointer", display: "flex",
            }}>
              {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
          {error && <div style={{ color: C.danger, fontSize: 12.5, textAlign: "center" }}>{error}</div>}
          <GradButton onClick={submit} disabled={busy} style={{ width: "100%", marginTop: 4 }}>
            {busy ? <Loader2 size={16} className="flick-spin" /> : mode === "login" ? "Log in" : "Continue"}
          </GradButton>
        </div>
      </div>
      <div style={{ color: C.faint, fontFamily: FONT_BODY, fontSize: 11, textAlign: "center", paddingBottom: 18, lineHeight: 1.5 }}>
        By continuing you agree to Flick's terms. Your password is hashed and never stored in plain text.
      </div>
    </div>
  );
}
