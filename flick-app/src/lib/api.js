const BASE = "/api";

async function call(path, opts = {}) {
  const res = await fetch(`${BASE}/${path}`, {
    method: opts.method || "GET",
    credentials: "include",
    headers: opts.body ? { "Content-Type": "application/json" } : undefined,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  let data = null;
  try { data = await res.json(); } catch { /* no body */ }
  if (!res.ok) {
    const message = (data && data.error) || `Request failed (${res.status})`;
    throw new Error(message);
  }
  return data;
}

export const api = {
  // auth
  me: () => call("auth/me"),
  signup: (username, password, flickmoji) => call("auth/signup", { method: "POST", body: { username, password, flickmoji } }),
  login: (username, password) => call("auth/login", { method: "POST", body: { username, password } }),
  logout: () => call("auth/logout", { method: "POST" }),
  updateFlickmoji: (flickmoji) => call("me/flickmoji", { method: "PUT", body: { flickmoji } }),

  // users / friends
  searchUsers: (q) => call(`users/search?q=${encodeURIComponent(q)}`),
  getFriends: () => call("friends"),
  addFriend: (username) => call("friends", { method: "POST", body: { username } }),
  removeFriend: (username) => call("friends/remove", { method: "POST", body: { username } }),

  // settings
  getSettings: () => call("settings"),
  setAutosave: (autosave) => call("settings", { method: "PUT", body: { autosave } }),

  // stories
  getStories: () => call("stories"),
  postStory: (content) => call("stories", { method: "POST", body: { content } }),

  // messages
  getMessages: (withUser) => call(`messages?with=${encodeURIComponent(withUser)}`),
  sendMessage: (withUser, type, content) => call("messages", { method: "POST", body: { with: withUser, type, content } }),

  // chat list previews / streaks
  getChatsSummary: () => call("chats/summary"),
};
