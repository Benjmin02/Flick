import React, { useState, useEffect, useRef, useCallback } from "react";
import { C, FONT_BODY } from "./theme.js";
import { api } from "./lib/api.js";
import { computeStreak } from "./lib/utils.js";

import { LogoMark, Toast } from "./components/Primitives.jsx";
import { TopBar } from "./components/TopBar.jsx";
import { AuthScreen } from "./components/AuthScreen.jsx";
import { FlickMojiBuilder } from "./components/FlickMojiBuilder.jsx";
import { ChatsList } from "./components/ChatsList.jsx";
import { ChatDetail } from "./components/ChatDetail.jsx";
import { FriendsScreen } from "./components/FriendsScreen.jsx";
import { StoriesScreen } from "./components/StoriesScreen.jsx";
import { StoryViewer } from "./components/StoryViewer.jsx";
import { CameraScreen } from "./components/CameraScreen.jsx";
import { SettingsScreen } from "./components/SettingsScreen.jsx";
import { BottomNav } from "./components/BottomNav.jsx";

export default function FlickApp() {
  const [booting, setBooting] = useState(true);
  const [user, setUser] = useState(null);
  const [authError, setAuthError] = useState("");
  const [authBusy, setAuthBusy] = useState(false);
  const [pendingSignup, setPendingSignup] = useState(null); // {username,password}
  const [buildingAvatar, setBuildingAvatar] = useState(false); // signup step 2
  const [editingAvatar, setEditingAvatar] = useState(false); // from settings

  const [tab, setTab] = useState("chats");
  const [friends, setFriends] = useState([]);
  const [autosave, setAutosave] = useState(true);
  const [activeChat, setActiveChat] = useState(null);
  const [friendProfiles, setFriendProfiles] = useState({}); // username -> {username,flickmoji}
  const [messagesByChat, setMessagesByChat] = useState({});
  const [chatSummary, setChatSummary] = useState({}); // username -> {last, activeDays}
  const loadedChats = useRef(new Set());

  const [cameraOpen, setCameraOpen] = useState(false);
  const [myStories, setMyStories] = useState([]);
  const [friendStories, setFriendStories] = useState({});
  const [viewingStory, setViewingStory] = useState(null);

  const [toast, setToast] = useState("");
  function showToast(t) { setToast(t); setTimeout(() => setToast(""), 2400); }

  /* ---- boot: restore session via httpOnly cookie ---- */
  useEffect(() => {
    (async () => {
      try {
        const { user: u } = await api.me();
        if (u) await afterLogin(u);
      } catch { /* not signed in */ }
      setBooting(false);
    })();
  }, []);

  async function afterLogin(u) {
    setUser(u);
    const { friends: f, profiles } = await api.getFriends();
    setFriends(f);
    setFriendProfiles(profiles);
    const s = await api.getSettings();
    setAutosave(s.autosave);
    await refreshChatSummary();
  }

  async function refreshChatSummary() {
    try {
      const { summary } = await api.getChatsSummary();
      setChatSummary(summary);
    } catch { /* ignore */ }
  }

  /* ---- auth ---- */
  async function handleLogin(username, password) {
    setAuthError("");
    if (!username.trim() || !password) { setAuthError("Enter a username and password."); return; }
    setAuthBusy(true);
    try {
      const u = await api.login(username, password);
      setAuthBusy(false);
      await afterLogin(u);
    } catch (e) {
      setAuthBusy(false);
      setAuthError(e.message);
    }
  }
  async function handleSignupCreds(username, password) {
    setAuthError("");
    const clean = username.trim();
    if (clean.length < 3) { setAuthError("Username needs at least 3 characters."); return; }
    if (!/^[a-zA-Z0-9_.]+$/.test(clean)) { setAuthError("Letters, numbers, _ and . only."); return; }
    if (password.length < 4) { setAuthError("Password needs at least 4 characters."); return; }
    setPendingSignup({ username: clean, password });
    setBuildingAvatar(true);
  }
  async function finishSignup(flickmoji) {
    const { username, password } = pendingSignup;
    setAuthBusy(true);
    try {
      const u = await api.signup(username, password, flickmoji);
      setAuthBusy(false);
      setBuildingAvatar(false);
      setPendingSignup(null);
      await afterLogin(u);
    } catch (e) {
      setAuthBusy(false);
      setBuildingAvatar(false);
      setAuthError(e.message);
    }
  }
  async function handleLogout() {
    await api.logout();
    setUser(null); setFriends([]); setTab("chats"); setActiveChat(null);
    setMessagesByChat({}); loadedChats.current = new Set(); setFriendProfiles({});
    setChatSummary({}); setMyStories([]); setFriendStories({});
  }
  async function saveAvatarEdit(flickmoji) {
    await api.updateFlickmoji(flickmoji);
    setUser((u) => ({ ...u, flickmoji }));
    setEditingAvatar(false);
    showToast("FlickMoji updated ✨");
  }

  /* ---- friends ---- */
  async function searchUsers(q) {
    const { users } = await api.searchUsers(q);
    return users;
  }
  async function addFriend(target) {
    if (target.toLowerCase() === user.username.toLowerCase()) { showToast("That's you!"); return; }
    if (friends.some((f) => f.toLowerCase() === target.toLowerCase())) return;
    try {
      const targetUser = await api.addFriend(target);
      setFriends((f) => [...f, targetUser.username]);
      setFriendProfiles((p) => ({ ...p, [targetUser.username]: targetUser }));
      showToast(`Added @${targetUser.username}`);
    } catch (e) {
      showToast(e.message || "Couldn't find that user.");
    }
  }
  async function removeFriend(target) {
    await api.removeFriend(target);
    setFriends((f) => f.filter((x) => x.toLowerCase() !== target.toLowerCase()));
    showToast(`Removed @${target}`);
  }

  /* ---- chats ---- */
  const openChat = useCallback(async (withUser) => {
    setActiveChat(withUser);
    if (!loadedChats.current.has(withUser)) {
      const { messages } = await api.getMessages(withUser);
      setMessagesByChat((prev) => ({ ...prev, [withUser]: messages }));
      loadedChats.current.add(withUser);
    }
  }, []);

  async function sendMessage(withUser, type, content) {
    try {
      const msg = await api.sendMessage(withUser, type, content);
      setMessagesByChat((prev) => ({ ...prev, [withUser]: [...(prev[withUser] || []), msg] }));
      refreshChatSummary();
    } catch (e) {
      showToast(e.message || "Couldn't send that.");
    }
  }

  // poll active chat for incoming messages
  useEffect(() => {
    if (!activeChat || tab !== "chats" || cameraOpen) return;
    const id = setInterval(async () => {
      try {
        const { messages } = await api.getMessages(activeChat);
        setMessagesByChat((prev) => {
          const local = prev[activeChat] || [];
          const ids = new Set(local.map((m) => m.id));
          const merged = [...local, ...messages.filter((m) => !ids.has(m.id))].sort((a, b) => a.ts - b.ts);
          return { ...prev, [activeChat]: merged };
        });
      } catch { /* ignore transient errors */ }
    }, 3500);
    return () => clearInterval(id);
  }, [activeChat, tab, cameraOpen]);

  // periodically refresh chat list previews / streaks
  useEffect(() => {
    if (!user || tab !== "chats" || activeChat) return;
    refreshChatSummary();
    const id = setInterval(refreshChatSummary, 5000);
    return () => clearInterval(id);
  }, [user, tab, activeChat]);

  const chatMeta = {};
  friends.forEach((f) => {
    const meta = chatSummary[f];
    chatMeta[f] = {
      flickmoji: friendProfiles[f]?.flickmoji,
      preview: meta?.last ? (meta.last.type === "snap" ? "📸 Sent a flick" : meta.last.content) : null,
      lastTs: meta?.last?.ts,
      streak: computeStreak(meta?.activeDays || []),
    };
  });

  /* ---- stories ---- */
  async function loadStories() {
    if (!user) return;
    const { mine, friendStories: fs } = await api.getStories();
    setMyStories(mine);
    setFriendStories(
      Object.fromEntries(
        Object.entries(fs).map(([u, data]) => [u, { items: data.items, flickmoji: data.flickmoji || friendProfiles[u]?.flickmoji }])
      )
    );
  }
  useEffect(() => { if (tab === "stories") loadStories(); }, [tab, user, friends]);

  async function postStory(dataUrl) {
    const item = await api.postStory(dataUrl);
    setMyStories((s) => [...s, item]);
  }

  /* ---- camera share ---- */
  const [cameraOrigin, setCameraOrigin] = useState("chats");
  function openCamera(origin) { setCameraOrigin(origin || tab); setCameraOpen(true); }
  async function handleShare(dataUrl, selectedFriends, alsoStory) {
    for (const f of selectedFriends) {
      await sendMessage(f, "snap", dataUrl);
    }
    if (alsoStory) await postStory(dataUrl);
    setCameraOpen(false);
    showToast(selectedFriends.length && alsoStory ? "Sent + added to story ✨" : selectedFriends.length ? "Flick sent ✨" : "Added to your story ✨");
    setTab(cameraOrigin === "camera" ? "chats" : cameraOrigin);
  }

  /* ------------------------------- RENDER -------------------------------- */
  const frameStyle = {
    width: "100%", maxWidth: 430, height: "100dvh", maxHeight: 900, margin: "0 auto",
    background: C.bg, color: C.text, position: "relative", overflow: "hidden",
    display: "flex", flexDirection: "column", fontFamily: FONT_BODY,
    boxShadow: "0 0 0 1px rgba(255,255,255,0.04)",
  };

  return (
    <div style={{ width: "100%", height: "100dvh", background: "#000", display: "flex" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; }
        input::placeholder { color: ${C.faint}; }
        div::-webkit-scrollbar { width: 0px; }
        @keyframes flickPop { 0% { transform: scale(0.6) rotate(-8deg); opacity: 0; } 100% { transform: scale(1) rotate(0); opacity: 1; } }
        @keyframes flickToastIn { 0% { opacity: 0; transform: translate(-50%, 8px); } 100% { opacity: 1; transform: translate(-50%, 0); } }
        .flick-spin { animation: flickSpin 0.8s linear infinite; }
        @keyframes flickSpin { to { transform: rotate(360deg); } }
      `}</style>

      <div style={frameStyle}>
        {booting ? (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <LogoMark size={36} />
          </div>
        ) : !user ? (
          <AuthScreen onLogin={handleLogin} onSignupCreds={handleSignupCreds} error={authError} busy={authBusy} />
        ) : (
          <>
            {tab === "chats" && !activeChat && (
              <>
                <TopBar title="Flick" />
                <ChatsList friends={friends} chatMeta={chatMeta} onOpenChat={openChat} onGoFriends={() => setTab("friends")} />
              </>
            )}
            {tab === "chats" && activeChat && (
              <ChatDetail
                me={user.username}
                withUser={activeChat}
                flickmoji={friendProfiles[activeChat]?.flickmoji}
                messages={messagesByChat[activeChat] || []}
                streak={chatMeta[activeChat]?.streak || 0}
                onBack={() => setActiveChat(null)}
                onSendText={(t) => sendMessage(activeChat, "text", t)}
                onOpenCamera={() => openCamera("chats")}
              />
            )}

            {tab === "stories" && (
              <>
                <TopBar title="Stories" />
                <StoriesScreen
                  me={user.username}
                  myFlickmoji={user.flickmoji}
                  myStories={myStories}
                  friendStories={friendStories}
                  onAddStory={() => openCamera("stories")}
                  onViewStory={(u, items, fm) => setViewingStory({ user: u, items, flickmoji: fm })}
                />
              </>
            )}

            {tab === "friends" && (
              <>
                <TopBar title="Friends" />
                <FriendsScreen
                  me={user.username}
                  friends={friends}
                  onAdd={addFriend}
                  onRemove={removeFriend}
                  onOpenChat={(f) => { setActiveChat(f); openChat(f); setTab("chats"); }}
                  chatMeta={chatMeta}
                  searchFn={searchUsers}
                />
              </>
            )}

            {tab === "settings" && !editingAvatar && (
              <>
                <TopBar title="Settings" />
                <SettingsScreen
                  user={user}
                  autosave={autosave}
                  onToggleAutosave={async () => {
                    const next = !autosave;
                    setAutosave(next);
                    await api.setAutosave(next);
                  }}
                  onEditAvatar={() => setEditingAvatar(true)}
                  onLogout={handleLogout}
                />
              </>
            )}
            {tab === "settings" && editingAvatar && (
              <>
                <TopBar title="Edit FlickMoji" onBack={() => setEditingAvatar(false)} />
                <FlickMojiBuilder initial={user.flickmoji} onSave={saveAvatarEdit} onCancel={() => setEditingAvatar(false)} saveLabel="Save" />
              </>
            )}

            {tab !== "camera" && !cameraOpen && !activeChat && <BottomNav tab={tab} setTab={(t) => (t === "camera" ? openCamera(tab) : setTab(t))} />}

            {cameraOpen && (
              <div style={{ position: "absolute", inset: 0, background: C.bg, zIndex: 150 }}>
                <CameraScreen friends={friends} onClose={() => setCameraOpen(false)} onShare={handleShare} />
              </div>
            )}
            {viewingStory && (
              <StoryViewer {...viewingStory} onClose={() => setViewingStory(null)} />
            )}
            <Toast text={toast} />
          </>
        )}

        {buildingAvatar && (
          <div style={{ position: "absolute", inset: 0, background: C.bg, zIndex: 400 }}>
            <TopBar title="Build your FlickMoji" onBack={() => { setBuildingAvatar(false); setPendingSignup(null); }} />
            <FlickMojiBuilder onSave={finishSignup} saveLabel="Create account" />
          </div>
        )}
      </div>
    </div>
  );
}
