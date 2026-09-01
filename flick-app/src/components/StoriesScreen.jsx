import React from "react";
import { Plus } from "lucide-react";
import { C, GRAD, FONT_DISPLAY, FONT_BODY } from "../theme.js";
import { FlickMojiAvatar, SectionLabel } from "./Primitives.jsx";
import { timeAgo } from "../lib/utils.js";

export function StoriesScreen({ me, myFlickmoji, myStories, friendStories, onAddStory, onViewStory }) {
  const hasMyStory = myStories.length > 0;
  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "4px 16px 16px" }}>
      <SectionLabel>My story</SectionLabel>
      <button onClick={() => (hasMyStory ? onViewStory(me, myStories, myFlickmoji) : onAddStory())} style={{
        display: "flex", alignItems: "center", gap: 12, background: "none", border: "none",
        cursor: "pointer", width: "100%", padding: "6px 4px 22px", textAlign: "left",
      }}>
        <div style={{ position: "relative" }}>
          <FlickMojiAvatar flickmoji={myFlickmoji} size={54} ring={hasMyStory} />
          {!hasMyStory && (
            <div style={{
              position: "absolute", bottom: -2, right: -2, width: 20, height: 20, borderRadius: 999,
              background: GRAD, display: "flex", alignItems: "center", justifyContent: "center",
              border: `2px solid ${C.bg}`,
            }}><Plus size={12} color="#fff" /></div>
          )}
        </div>
        <div>
          <div style={{ color: C.text, fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 14 }}>
            {hasMyStory ? "Your story" : "Add to your story"}
          </div>
          <div style={{ color: C.muted, fontFamily: FONT_BODY, fontSize: 12 }}>
            {hasMyStory ? `${myStories.length} snap${myStories.length > 1 ? "s" : ""} · tap to view` : "Share a snap for 24 hours"}
          </div>
        </div>
      </button>

      <SectionLabel>Flickers</SectionLabel>
      {Object.keys(friendStories).length === 0 && (
        <div style={{ color: C.faint, fontSize: 12.5, padding: "4px 4px 0" }}>
          No stories from friends right now. Check back later!
        </div>
      )}
      {Object.entries(friendStories).map(([user, data]) => (
        <button key={user} onClick={() => onViewStory(user, data.items, data.flickmoji)} style={{
          display: "flex", alignItems: "center", gap: 12, background: "none", border: "none",
          cursor: "pointer", width: "100%", padding: "8px 4px", textAlign: "left",
        }}>
          <FlickMojiAvatar flickmoji={data.flickmoji} size={54} ring />
          <div>
            <div style={{ color: C.text, fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 14 }}>@{user}</div>
            <div style={{ color: C.muted, fontFamily: FONT_BODY, fontSize: 12 }}>{timeAgo(data.items[0].ts)}</div>
          </div>
        </button>
      ))}
    </div>
  );
}
