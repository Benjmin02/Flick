import React from "react";
import { MessageCircle, Sparkles, Camera, Users, Settings as SettingsIcon } from "lucide-react";
import { C, GRAD } from "../theme.js";

export function BottomNav({ tab, setTab }) {
  const items = [
    { id: "chats", icon: MessageCircle },
    { id: "stories", icon: Sparkles },
    { id: "camera", icon: Camera, center: true },
    { id: "friends", icon: Users },
    { id: "settings", icon: SettingsIcon },
  ];
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-around", padding: "10px 10px 14px", borderTop: `1px solid ${C.border}`, flexShrink: 0 }}>
      {items.map(({ id, icon: Icon, center }) => {
        const active = tab === id;
        if (center) {
          return (
            <button key={id} onClick={() => setTab(id)} style={{
              width: 52, height: 52, borderRadius: 999, background: GRAD, border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: `0 6px 18px ${C.pink}66`, marginTop: -22,
            }}>
              <Icon size={22} color="#fff" />
            </button>
          );
        }
        return (
          <button key={id} onClick={() => setTab(id)} style={{ background: "none", border: "none", cursor: "pointer", padding: 8 }}>
            <Icon size={22} color={active ? C.text : C.faint} strokeWidth={active ? 2.4 : 2} />
          </button>
        );
      })}
    </div>
  );
}
