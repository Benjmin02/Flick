import React, { useState, useEffect } from "react";
import { Search, Check, UserPlus, X, Flame } from "lucide-react";
import { C, FONT_DISPLAY, FONT_BODY, inputStyle } from "../theme.js";
import { FlickMojiAvatar, SectionLabel } from "./Primitives.jsx";

export function FriendsScreen({ me, friends, onAdd, onRemove, onOpenChat, chatMeta, searchFn }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    let active = true;
    if (!q.trim()) { setResults([]); return; }
    setSearching(true);
    const t = setTimeout(async () => {
      const r = await searchFn(q);
      if (active) { setResults(r); setSearching(false); }
    }, 250);
    return () => { active = false; clearTimeout(t); };
  }, [q]);

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "4px 16px 16px" }}>
      <div style={{ position: "relative", marginBottom: 18 }}>
        <Search size={16} color={C.faint} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Add friends by username"
          style={{ ...inputStyle(), paddingLeft: 38 }}
        />
      </div>

      {q.trim() && (
        <div style={{ marginBottom: 24 }}>
          {searching && <div style={{ color: C.faint, fontSize: 12.5, padding: "8px 4px" }}>Searching…</div>}
          {!searching && results.length === 0 && (
            <div style={{ color: C.faint, fontSize: 12.5, padding: "8px 4px" }}>No Flickers found with that username.</div>
          )}
          {results.map((u) => {
            const already = friends.some((f) => f.toLowerCase() === u.username.toLowerCase());
            const isMe = u.username.toLowerCase() === me.toLowerCase();
            return (
              <div key={u.username} style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 4px" }}>
                <FlickMojiAvatar flickmoji={u.flickmoji} size={42} />
                <div style={{ flex: 1, color: C.text, fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 14 }}>@{u.username}</div>
                {isMe ? (
                  <div style={{ color: C.faint, fontSize: 12 }}>You</div>
                ) : already ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 4, color: C.cyan, fontSize: 12, fontFamily: FONT_DISPLAY, fontWeight: 600 }}>
                    <Check size={14} /> Added
                  </div>
                ) : (
                  <button onClick={() => onAdd(u.username)} style={{
                    background: C.panel2, border: `1px solid ${C.border}`, borderRadius: 10, padding: "6px 12px",
                    color: C.text, fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 12, cursor: "pointer",
                    display: "flex", alignItems: "center", gap: 5,
                  }}>
                    <UserPlus size={13} /> Add
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      <SectionLabel>{friends.length > 0 ? `Your friends · ${friends.length}` : "Your friends"}</SectionLabel>
      {friends.length === 0 && !q.trim() && (
        <div style={{ color: C.faint, fontSize: 12.5, padding: "4px 4px 0" }}>
          Search a username above to add your first friend.
        </div>
      )}
      {friends.map((f) => (
        <div key={f} style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 4px" }}>
          <FlickMojiAvatar flickmoji={chatMeta[f]?.flickmoji} size={44} />
          <button onClick={() => onOpenChat(f)} style={{ flex: 1, textAlign: "left", background: "none", border: "none", cursor: "pointer" }}>
            <div style={{ color: C.text, fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 14 }}>@{f}</div>
            {chatMeta[f]?.streak > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 3, color: C.yellow, fontSize: 11, fontFamily: FONT_BODY }}>
                <Flame size={11} fill={C.yellow} /> {chatMeta[f].streak} day streak
              </div>
            )}
          </button>
          <button onClick={() => onRemove(f)} style={{ background: "none", border: "none", color: C.faint, cursor: "pointer" }}>
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
