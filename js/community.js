// ===========================================================
// MAMATA — Community Forum
// ===========================================================

function timeAgo(ts) {
  if (!ts) return "এখনই";
  const date = ts.toDate ? ts.toDate() : new Date(ts);
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return "এইমাত্র";
  if (diff < 3600) return Math.floor(diff / 60) + " মিনিট আগে";
  if (diff < 86400) return Math.floor(diff / 3600) + " ঘণ্টা আগে";
  return Math.floor(diff / 86400) + " দিন আগে";
}

function postCardHTML(p) {
  return `
  <div class="card" style="padding:22px;margin-bottom:18px;">
    <div class="flex items-center gap-10" style="margin-bottom:10px;">
      <div style="width:38px;height:38px;border-radius:50%;background:var(--sage-tint);display:flex;align-items:center;justify-content:center;font-weight:700;color:var(--sage-dark);">
        ${(p.authorName || "?")[0]}
      </div>
      <div>
        <div style="font-weight:700;font-size:.92rem;">${p.authorName || "অতিথি"}</div>
        <div class="muted" style="font-size:.78rem;">${timeAgo(p.createdAt)} · <span class="tag" style="margin:0;padding:2px 10px;">${categoryLabel(p.category)}</span></div>
      </div>
    </div>
    <h4 style="margin-bottom:6px;">${p.title}</h4>
    <p class="muted" style="font-size:.94rem;">${p.body}</p>
    <div class="flex items-center gap-10 mt-16">
      <button class="btn btn-sm btn-ghost" onclick="likePost('${p.id}', ${p.likes || 0})">❤️ ${p.likes || 0}</button>
      <span class="muted" style="font-size:.85rem;">💬 ${p.commentCount || 0} মন্তব্য</span>
    </div>
  </div>`;
}

function categoryLabel(c) {
  const map = { feeding: "খাওয়ানো", sleep: "ঘুম", health: "স্বাস্থ্য", general: "সাধারণ", tips: "টিপস" };
  return map[c] || "সাধারণ";
}

function loadPosts() {
  const list = document.getElementById("postList");
  if (!list) return;
  list.innerHTML = Array(3).fill('<div class="skeleton" style="height:140px;margin-bottom:18px;"></div>').join("");

  col.posts.orderBy("createdAt", "desc").limit(50).get()
    .then(snap => {
      if (snap.empty) {
        list.innerHTML = `<div class="empty-state"><div class="ico">🌱</div><p>এখনো কোনো পোস্ট নেই। প্রথম পোস্টটি আপনিই করুন!</p></div>`;
        return;
      }
      list.innerHTML = snap.docs.map(d => postCardHTML({ id: d.id, ...d.data() })).join("");
    })
    .catch(err => { list.innerHTML = `<p class="muted">পোস্ট লোড করা যায়নি।</p>`; });
}

function likePost(id, current) {
  col.posts.doc(id).update({ likes: current + 1 }).then(loadPosts);
}

function submitPost(e) {
  e.preventDefault();
  if (!auth.currentUser) { toast("পোস্ট করতে লগইন করুন", "error"); window.location.href = "login.html"; return; }

  const title = document.getElementById("postTitle").value.trim();
  const body = document.getElementById("postBody").value.trim();
  const category = document.getElementById("postCategory").value;
  if (!title || !body) return;

  col.posts.add({
    title, body, category,
    authorName: auth.currentUser.displayName || auth.currentUser.email.split("@")[0],
    authorId: auth.currentUser.uid,
    likes: 0, commentCount: 0,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
  }).then(() => {
    document.getElementById("postForm").reset();
    document.getElementById("postModal").classList.remove("open");
    toast("পোস্ট প্রকাশিত হয়েছে 🌸", "success");
    loadPosts();
  });
}

document.addEventListener("DOMContentLoaded", loadPosts);
