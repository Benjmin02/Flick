import React from "react";
import { ChevronRight, LogOut } from "lucide-react";
import { C, GRAD, FONT_DISPLAY, FONT_BODY } from "../theme.js";
import { FlickMojiAvatar, SectionLabel } from "./Primitives.jsx";

function Toggle({ checked, onChange }) {
  return (
    <button onClick={onChange} style={{
      width: 44, height: 26, borderRadius: 999, border: "none", cursor: "pointer", flexShrink: 0,
      background: checked ? GRAD : C.border, position: "relative", transition: "background 0.2s",
    }}>
      <div style={{
        position: "absolute", top: 3, left: checked ? 21 : 3, width: 20, height: 20, borderRadius: 999,
        background: "#fff", transition: "left 0.2s",
      }} />
    </button>
  );
}

export function SettingsScreen({ user, autosave, onToggleAutosave, onEditAvatar, onLogout }) {
  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "4px 16px 16px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 4px", marginBottom: 8 }}>
        <FlickMojiAvatar flickmoji={user.flickmoji} size={62} ring />
        <div style={{ flex: 1 }}>
          <div style={{ color: C.text, fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 17 }}>@{user.username}</div>
          <button onClick={onEditAvatar} style={{
            marginTop: 4, background: "none", border: "none", color: C.pink,
            fontSize: 12.5, cursor: "pointer", padding: 0, display: "flex", alignItems: "center", gap: 3,
          }}>Edit FlickMoji <ChevronRight size={13} /></button>
        </div>
      </div>

      <SectionLabel>Chats</SectionLabel>
      <div style={{ background: C.panel, borderRadius: 16, padding: "14px 16px", marginBottom: 22, display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ color: C.text, fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 14 }}>Autosave chats</div>
          <div style={{ color: C.muted, fontSize: 12, marginTop: 2, lineHeight: 1.4 }}>
            When on, your texts and flicks are saved so they're there next time you log in.
            When off, they only last for this session.
          </div>
        </div>
        <Toggle checked={autosave} onChange={onToggleAutosave} />
      </div>

      <SectionLabel>Account</SectionLabel>
      <button onClick={onLogout} style={{
        display: "flex", alignItems: "center", gap: 10, background: C.panel, border: "none",
        borderRadius: 16, padding: "14px 16px", width: "100%", cursor: "pointer", color: C.danger,
        fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 14, marginBottom: 24,
      }}>
        <LogOut size={16} /> Log out
      </button>

      <div style={{ color: C.faint, fontSize: 11, lineHeight: 1.6, padding: "0 4px" }}>
        Flick is an independent project, not affiliated with Snap Inc.
      </div>
    </div>
  );
}
