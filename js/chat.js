// ===========================================================
// MAMATA — Admin Chat widget (floating bubble, works for guests too)
// Firestore shape:
//   chats/{chatId}      { name, phone, lastMessage, updatedAt, unreadForAdmin, unreadForUser }
//   messages/{id}       { chatId, sender: 'user'|'admin', text, createdAt }
// ===========================================================

function getChatId() {
  let id = localStorage.getItem("mamata_chat_id");
  if (!id) {
    id = "chat_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem("mamata_chat_id", id);
  }
  return id;
}

function mountChatWidget() {
  const root = document.getElementById("chat-widget-root");
  if (!root || typeof db === "undefined") return;

  root.innerHTML = `
    <button id="chatBubble" style="position:fixed;bottom:22px;right:22px;width:58px;height:58px;border-radius:50%;
      background:var(--rose);color:#fff;font-size:1.5rem;box-shadow:var(--shadow-lg);z-index:120;
      display:flex;align-items:center;justify-content:center;">💬</button>
    <div id="chatPanel" style="display:none;position:fixed;bottom:92px;right:22px;width:340px;max-width:90vw;
      height:440px;background:#fff;border-radius:var(--r-md);box-shadow:var(--shadow-lg);z-index:120;
      flex-direction:column;overflow:hidden;border:1px solid var(--line);">
      <div style="background:var(--rose);color:#fff;padding:14px 18px;font-weight:700;display:flex;justify-content:space-between;align-items:center;">
        <span>মমতা সাপোর্ট 🌸</span>
        <button id="chatClose" style="color:#fff;font-size:1.1rem;">✕</button>
      </div>
      <div id="chatIntro" style="padding:14px;font-size:.85rem;">
        <div class="field"><label>আপনার নাম</label><input id="chatName" placeholder="যেমন: রিমা আক্তার"></div>
        <button class="btn btn-primary btn-block btn-sm" id="chatStart">চ্যাট শুরু করুন</button>
      </div>
      <div id="chatMessages" style="display:none;flex:1;overflow-y:auto;padding:14px;font-size:.88rem;"></div>
      <form id="chatForm" style="display:none;border-top:1px solid var(--line);padding:10px;gap:8px;" class="flex">
        <input id="chatInput" placeholder="বার্তা লিখুন..." style="flex:1;border:1px solid var(--line);border-radius:20px;padding:9px 14px;">
        <button class="btn btn-primary btn-sm" type="submit">পাঠান</button>
      </form>
    </div>`;

  const bubble = document.getElementById("chatBubble");
  const panel = document.getElementById("chatPanel");
  const closeBtn = document.getElementById("chatClose");
  bubble.onclick = () => { panel.style.display = panel.style.display === "flex" ? "none" : "flex"; };
  closeBtn.onclick = () => panel.style.display = "none";

  const chatId = getChatId();
  const savedName = localStorage.getItem("mamata_chat_name");
  const intro = document.getElementById("chatIntro");
  const msgsBox = document.getElementById("chatMessages");
  const form = document.getElementById("chatForm");

  function openThread(name) {
    intro.style.display = "none";
    msgsBox.style.display = "block";
    form.style.display = "flex";

    col.chats.doc(chatId).set({
      name, chatId, updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      unreadForAdmin: true
    }, { merge: true });

    col.messages.where("chatId", "==", chatId).orderBy("createdAt", "asc")
      .onSnapshot(snap => {
        msgsBox.innerHTML = snap.empty
          ? `<p class="muted" style="text-align:center;margin-top:30px;">👋 স্বাগতম! আপনার প্রশ্ন লিখুন, আমরা দ্রুত উত্তর দেব।</p>`
          : "";
        snap.forEach(doc => {
          const m = doc.data();
          const mine = m.sender === "user";
          msgsBox.innerHTML += `<div style="margin-bottom:10px;display:flex;justify-content:${mine ? "flex-end" : "flex-start"};">
            <div style="max-width:75%;padding:8px 12px;border-radius:14px;
              background:${mine ? "var(--rose)" : "var(--cream-deep)"};color:${mine ? "#fff" : "var(--plum)"};">
              ${m.text}
            </div></div>`;
        });
        msgsBox.scrollTop = msgsBox.scrollHeight;
      });
  }

  document.getElementById("chatStart").onclick = () => {
    const name = document.getElementById("chatName").value.trim() || "অতিথি";
    localStorage.setItem("mamata_chat_name", name);
    openThread(name);
  };

  if (savedName) openThread(savedName);

  form.onsubmit = (e) => {
    e.preventDefault();
    const input = document.getElementById("chatInput");
    const text = input.value.trim();
    if (!text) return;
    col.messages.add({ chatId, sender: "user", text, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
    col.chats.doc(chatId).set({
      lastMessage: text, updatedAt: firebase.firestore.FieldValue.serverTimestamp(), unreadForAdmin: true
    }, { merge: true });
    input.value = "";
  };
}

function openChatWidget() {
  const panel = document.getElementById("chatPanel");
  if (panel) panel.style.display = "flex";
}
