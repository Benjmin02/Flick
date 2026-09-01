-- Flick D1 schema

CREATE TABLE IF NOT EXISTS users (
  username    TEXT PRIMARY KEY,
  pass_hash   TEXT NOT NULL,
  salt        TEXT NOT NULL,
  flickmoji   TEXT NOT NULL,   -- JSON: {emoji,bg,accessory}
  created_at  INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS friends (
  username         TEXT NOT NULL,
  friend_username  TEXT NOT NULL,
  PRIMARY KEY (username, friend_username)
);

CREATE TABLE IF NOT EXISTS settings (
  username  TEXT PRIMARY KEY,
  autosave  INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS stories (
  id        TEXT PRIMARY KEY,
  username  TEXT NOT NULL,
  ts        INTEGER NOT NULL,
  content   TEXT NOT NULL   -- data URL
);
CREATE INDEX IF NOT EXISTS idx_stories_username ON stories(username, ts);

CREATE TABLE IF NOT EXISTS messages (
  id         TEXT PRIMARY KEY,
  chat_key   TEXT NOT NULL,   -- sorted "userA__userB"
  from_user  TEXT NOT NULL,
  type       TEXT NOT NULL,   -- "text" | "snap"
  content    TEXT NOT NULL,
  ts         INTEGER NOT NULL,
  autosave   INTEGER NOT NULL DEFAULT 1
);
CREATE INDEX IF NOT EXISTS idx_messages_chatkey ON messages(chat_key, ts);
