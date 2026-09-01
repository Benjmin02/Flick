import React from "react";
import { MessageCircle, Flame } from "lucide-react";
import { C, FONT_DISPLAY, FONT_BODY } from "../theme.js";
import { FlickMojiAvatar, EmptyState } from "./Primitives.jsx";
import { timeAgo } from "../lib/utils.js";

export function ChatsList({ friends, chatMeta, onOpenChat, onGoFriends }) {
  const sorted = [...friends].sort((a, b) => (chatMeta[b]?.lastTs || 0) - (chatMeta[a]?.lastTs || 0));
  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "4px 10px 10px" }}>
      {friends.length === 0 && (
        <EmptyState
          icon={<MessageCircle size={30} color={C.faint} />}
          title="No chats yet"
          subtitle="Add friends by their username to start flicking messages and snaps back and forth."
          actionLabel="Add friends"
          onAction={onGoFriends}
        />
      )}
      {sorted.map((f) => {
        const meta = chatMeta[f];
        return (
          <button key={f} onClick={() => onOpenChat(f)} style={{
            width: "100%", display: "flex", alignItems: "center", gap: 12,
            background: "transparent", border: "none", padding: "10px 8px",
            borderRadius: 16, cursor: "pointer", textAlign: "left",
          }}
            onMouseEnter={(e) => (e.currentTarget.style.background = C.panel)}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <FlickMojiAvatar flickmoji={meta?.flickmoji} size={50} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: C.text, fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 15 }}>@{f}</div>
              <div style={{ color: C.muted, fontFamily: FONT_BODY, fontSize: 12.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {meta?.preview || "Say hi 👋"}
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
              <div style={{ color: C.faint, fontFamily: FONT_BODY, fontSize: 11 }}>{meta?.lastTs ? timeAgo(meta.lastTs) : ""}</div>
              {meta?.streak > 0 && (
                <div style={{ display: "flex", alignItems: "center", gap: 3, color: C.yellow, fontSize: 11.5, fontFamily: FONT_DISPLAY, fontWeight: 600 }}>
                  <Flame size={12} fill={C.yellow} /> {meta.streak}
                </div>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
