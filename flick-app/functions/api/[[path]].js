/**
 * Flick API — single catch-all Cloudflare Pages Function.
 * Handles /api/* using the D1 binding `DB` and cookie-based sessions
 * signed with the `SESSION_SECRET` environment secret.
 */

const COOKIE_NAME = "fs";
const SESSION_DAYS = 30;

/* ------------------------------- crypto helpers ------------------------------- */

function b64urlEncode(bytes) {
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function b64urlDecode(str) {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4) str += "=";
  const bin = atob(str);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}
function randomHex(len = 16) {
  const bytes = crypto.getRandomValues(new Uint8Array(len));
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function hashPassword(password, saltHex) {
  const enc = new TextEncoder();
  const salt = saltHex
    ? new Uint8Array(saltHex.match(/.{2}/g).map((h) => parseInt(h, 16)))
    : crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" },
    keyMaterial,
    256
  );
  const hashHex = Array.from(new Uint8Array(bits)).map((b) => b.toString(16).padStart(2, "0")).join("");
  const saltOut = Array.from(salt).map((b) => b.toString(16).padStart(2, "0")).join("");
  return { hash: hashHex, salt: saltOut };
}

async function hmacKey(secret) {
  const enc = new TextEncoder();
  return crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

async function makeSessionCookie(username, secret) {
  const payload = { u: username, exp: Date.now() + SESSION_DAYS * 86400000 };
  const enc = new TextEncoder();
  const payloadBytes = enc.encode(JSON.stringify(payload));
  const key = await hmacKey(secret);
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", key, payloadBytes));
  const value = `${b64urlEncode(payloadBytes)}.${b64urlEncode(sig)}`;
  return `${COOKIE_NAME}=${value}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${SESSION_DAYS * 86400}`;
}
function clearSessionCookie() {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}
async function readSession(request, secret) {
  const cookie = request.headers.get("Cookie") || "";
  const match = cookie.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
  if (!match) return null;
  const [p, s] = match[1].split(".");
  if (!p || !s) return null;
  try {
    const payloadBytes = b64urlDecode(p);
    const sigBytes = b64urlDecode(s);
    const key = await hmacKey(secret);
    const ok = await crypto.subtle.verify("HMAC", key, sigBytes, payloadBytes);
    if (!ok) return null;
    const payload = JSON.parse(new TextDecoder().decode(payloadBytes));
    if (payload.exp < Date.now()) return null;
    return payload.u;
  } catch {
    return null;
  }
}

/* --------------------------------- response utils -------------------------------- */

function json(data, init = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: { "Content-Type": "application/json", ...(init.headers || {}) },
  });
}
function err(status, message) {
  return json({ error: message }, { status });
}
function chatKeyOf(a, b) {
  return [a.toLowerCase(), b.toLowerCase()].sort().join("__");
}

/* ------------------------------------ router ------------------------------------ */

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const path = url.pathname.replace(/^\/api\/?/, "");
  const method = request.method;
  const DB = env.DB;
  const SECRET = env.SESSION_SECRET || "dev-insecure-secret-change-me";

  if (!DB) return err(500, "D1 database not bound. Add a [[d1_databases]] binding named DB.");

  let body = {};
  if (method === "POST" || method === "PUT" || method === "DELETE") {
    try {
      body = await request.json();
    } catch {
      body = {};
    }
  }

  const currentUser = await readSession(request, SECRET);

  try {
    /* ---------- AUTH ---------- */
    if (path === "auth/signup" && method === "POST") {
      const username = String(body.username || "").trim();
      const password = String(body.password || "");
      const flickmoji = body.flickmoji || { emoji: "😀", bg: 0, accessory: null };
      if (username.length < 3 || !/^[a-zA-Z0-9_.]+$/.test(username)) return err(400, "Invalid username.");
      if (password.length < 4) return err(400, "Password too short.");
      const existing = await DB.prepare("SELECT username FROM users WHERE username = ?").bind(username.toLowerCase()).first();
      if (existing) return err(409, "That username is taken.");
      const { hash, salt } = await hashPassword(password);
      await DB.prepare(
        "INSERT INTO users (username, pass_hash, salt, flickmoji, created_at) VALUES (?, ?, ?, ?, ?)"
      ).bind(username, hash, salt, JSON.stringify(flickmoji), Date.now()).run();
      await DB.prepare("INSERT INTO settings (username, autosave) VALUES (?, 1)").bind(username.toLowerCase()).run();
      const cookie = await makeSessionCookie(username, SECRET);
      return json({ username, flickmoji }, { headers: { "Set-Cookie": cookie } });
    }

    if (path === "auth/login" && method === "POST") {
      const username = String(body.username || "").trim();
      const password = String(body.password || "");
      const row = await DB.prepare("SELECT * FROM users WHERE username = ?").bind(username.toLowerCase()).first();
      if (!row) return err(401, "No Flick account with that username.");
      const { hash } = await hashPassword(password, row.salt);
      if (hash !== row.pass_hash) return err(401, "Incorrect password.");
      const cookie = await makeSessionCookie(row.username, SECRET);
      return json({ username: row.username, flickmoji: JSON.parse(row.flickmoji) }, { headers: { "Set-Cookie": cookie } });
    }

    if (path === "auth/logout" && method === "POST") {
      return json({ ok: true }, { headers: { "Set-Cookie": clearSessionCookie() } });
    }

    if (path === "auth/me" && method === "GET") {
      if (!currentUser) return json({ user: null });
      const row = await DB.prepare("SELECT * FROM users WHERE username = ?").bind(currentUser.toLowerCase()).first();
      if (!row) return json({ user: null }, { headers: { "Set-Cookie": clearSessionCookie() } });
      return json({ user: { username: row.username, flickmoji: JSON.parse(row.flickmoji) } });
    }

    // Everything below requires auth
    if (!currentUser) return err(401, "Not signed in.");

    if (path === "me/flickmoji" && method === "PUT") {
      await DB.prepare("UPDATE users SET flickmoji = ? WHERE username = ?")
        .bind(JSON.stringify(body.flickmoji), currentUser.toLowerCase()).run();
      return json({ ok: true });
    }

    /* ---------- USERS ---------- */
    if (path === "users/search" && method === "GET") {
      const q = (url.searchParams.get("q") || "").trim().toLowerCase();
      if (!q) return json({ users: [] });
      const rows = await DB.prepare("SELECT username, flickmoji FROM users WHERE lower(username) LIKE ? LIMIT 15")
        .bind(`${q}%`).all();
      return json({ users: rows.results.map((r) => ({ username: r.username, flickmoji: JSON.parse(r.flickmoji) })) });
    }

    /* ---------- FRIENDS ---------- */
    if (path === "friends" && method === "GET") {
      const rows = await DB.prepare("SELECT friend_username FROM friends WHERE username = ?")
        .bind(currentUser.toLowerCase()).all();
      const usernames = rows.results.map((r) => r.friend_username);
      const profiles = {};
      for (const u of usernames) {
        const row = await DB.prepare("SELECT username, flickmoji FROM users WHERE username = ?").bind(u).first();
        if (row) profiles[row.username] = { username: row.username, flickmoji: JSON.parse(row.flickmoji) };
      }
      return json({ friends: Object.keys(profiles), profiles });
    }

    if (path === "friends" && method === "POST") {
      const target = String(body.username || "").trim();
      if (!target || target.toLowerCase() === currentUser.toLowerCase()) return err(400, "Invalid target.");
      const targetRow = await DB.prepare("SELECT username, flickmoji FROM users WHERE username = ?").bind(target).first();
      if (!targetRow) return err(404, "User not found.");
      await DB.prepare("INSERT OR IGNORE INTO friends (username, friend_username) VALUES (?, ?)")
        .bind(currentUser.toLowerCase(), targetRow.username).run();
      await DB.prepare("INSERT OR IGNORE INTO friends (username, friend_username) VALUES (?, ?)")
        .bind(targetRow.username.toLowerCase(), currentUser).run();
      return json({ username: targetRow.username, flickmoji: JSON.parse(targetRow.flickmoji) });
    }

    if (path === "friends/remove" && method === "POST") {
      const target = String(body.username || "").trim();
      await DB.prepare("DELETE FROM friends WHERE username = ? AND friend_username = ?")
        .bind(currentUser.toLowerCase(), target).run();
      return json({ ok: true });
    }

    /* ---------- SETTINGS ---------- */
    if (path === "settings" && method === "GET") {
      const row = await DB.prepare("SELECT autosave FROM settings WHERE username = ?").bind(currentUser.toLowerCase()).first();
      return json({ autosave: row ? !!row.autosave : true });
    }
    if (path === "settings" && method === "PUT") {
      await DB.prepare("INSERT INTO settings (username, autosave) VALUES (?, ?) ON CONFLICT(username) DO UPDATE SET autosave = excluded.autosave")
        .bind(currentUser.toLowerCase(), body.autosave ? 1 : 0).run();
      return json({ ok: true });
    }

    /* ---------- STORIES (24h) ---------- */
    if (path === "stories" && method === "GET") {
      const since = Date.now() - 86400000;
      const mine = await DB.prepare("SELECT id, ts, content FROM stories WHERE username = ? AND ts > ? ORDER BY ts ASC")
        .bind(currentUser.toLowerCase(), since).all();
      const friendRows = await DB.prepare("SELECT friend_username FROM friends WHERE username = ?").bind(currentUser.toLowerCase()).all();
      const friendStories = {};
      for (const f of friendRows.results.map((r) => r.friend_username)) {
        const items = await DB.prepare("SELECT id, ts, content FROM stories WHERE username = ? AND ts > ? ORDER BY ts ASC")
          .bind(f.toLowerCase(), since).all();
        if (items.results.length) {
          const prof = await DB.prepare("SELECT flickmoji FROM users WHERE username = ?").bind(f.toLowerCase()).first();
          friendStories[f] = { items: items.results, flickmoji: prof ? JSON.parse(prof.flickmoji) : null };
        }
      }
      return json({ mine: mine.results, friendStories });
    }
    if (path === "stories" && method === "POST") {
      const id = crypto.randomUUID();
      const ts = Date.now();
      await DB.prepare("INSERT INTO stories (id, username, ts, content) VALUES (?, ?, ?, ?)")
        .bind(id, currentUser, ts, body.content).run();
      return json({ id, ts, content: body.content });
    }

    /* ---------- MESSAGES ---------- */
    if (path === "messages" && method === "GET") {
      const withUser = String(url.searchParams.get("with") || "").trim();
      if (!withUser) return err(400, "Missing 'with'.");
      const key = chatKeyOf(currentUser, withUser);
      const rows = await DB.prepare("SELECT id, from_user, type, content, ts FROM messages WHERE chat_key = ? ORDER BY ts ASC")
        .bind(key).all();
      return json({ messages: rows.results });
    }
    if (path === "messages" && method === "POST") {
      const withUser = String(body.with || "").trim();
      const type = body.type === "snap" ? "snap" : "text";
      const content = String(body.content || "");
      if (!withUser || !content) return err(400, "Missing fields.");
      const id = crypto.randomUUID();
      const ts = Date.now();
      const settingsRow = await DB.prepare("SELECT autosave FROM settings WHERE username = ?").bind(currentUser.toLowerCase()).first();
      const autosave = settingsRow ? !!settingsRow.autosave : true;
      if (autosave) {
        const key = chatKeyOf(currentUser, withUser);
        await DB.prepare("INSERT INTO messages (id, chat_key, from_user, type, content, ts, autosave) VALUES (?, ?, ?, ?, ?, ?, 1)")
          .bind(id, key, currentUser, type, content, ts).run();
      }
      return json({ id, from: currentUser, type, content, ts });
    }

    /* ---------- CHAT LIST PREVIEWS ---------- */
    if (path === "chats/summary" && method === "GET") {
      const rows = await DB.prepare("SELECT friend_username FROM friends WHERE username = ?").bind(currentUser.toLowerCase()).all();
      const summary = {};
      for (const f of rows.results.map((r) => r.friend_username)) {
        const key = chatKeyOf(currentUser, f);
        const last = await DB.prepare("SELECT type, content, ts FROM messages WHERE chat_key = ? ORDER BY ts DESC LIMIT 1").bind(key).first();
        const days = await DB.prepare("SELECT DISTINCT date(ts / 1000, 'unixepoch') AS d FROM messages WHERE chat_key = ?").bind(key).all();
        summary[f] = { last: last || null, activeDays: days.results.map((r) => r.d) };
      }
      return json({ summary });
    }

    return err(404, "Not found.");
  } catch (e) {
    return err(500, `Server error: ${e.message || e}`);
  }
}
