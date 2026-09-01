export function timeAgo(ts) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return "now";
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  if (s < 604800) return `${Math.floor(s / 86400)}d`;
  return new Date(ts).toLocaleDateString();
}

// Accepts either an array of message objects ({ts}) or an array of
// "YYYY-MM-DD" day strings (as returned by /api/chats/summary).
export function computeStreak(input) {
  if (!input || input.length === 0) return 0;
  const days = new Set(
    typeof input[0] === "string"
      ? input.map((d) => new Date(d).toDateString())
      : input.map((m) => new Date(m.ts).toDateString())
  );
  let cursor = new Date();
  if (!days.has(cursor.toDateString())) {
    cursor.setDate(cursor.getDate() - 1);
    if (!days.has(cursor.toDateString())) return 0;
  }
  let streak = 0;
  while (days.has(cursor.toDateString())) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}
