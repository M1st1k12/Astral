import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api/http";
import useAuthStore from "../store/authStore";

function Modal({ open, title, description, confirmText, onClose, onConfirm, danger }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-md rounded-2xl bg-white border border-slate-200 shadow-xl p-5"
      >
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="mt-2 text-sm text-slate-600">{description}</p>
        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            className="px-4 py-2 rounded-xl border border-slate-200 text-sm"
            onClick={onClose}
          >
            Отмена
          </button>
          <button
            className={`px-4 py-2 rounded-xl text-sm text-white ${
              danger ? "bg-rose-600 hover:bg-rose-700" : "bg-slate-900 hover:bg-black"
            }`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function Admin() {
  const user = useAuthStore((s) => s.user);
  const [overview, setOverview] = useState(null);
  const [tab, setTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [clans, setClans] = useState([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [modal, setModal] = useState(null);
  const [boostDraft, setBoostDraft] = useState({});
  const [boostMode, setBoostMode] = useState("set");

  useEffect(() => {
    if (!user?.isAdmin) return;
    api.get("/admin/overview").then(({ data }) => setOverview(data)).catch(() => {});
  }, [user?.isAdmin]);

  useEffect(() => {
    if (!user?.isAdmin) return;
    if (tab === "users") api.get("/admin/users").then(({ data }) => setUsers(data.users || []));
    if (tab === "posts") api.get("/admin/posts").then(({ data }) => setPosts(data.posts || []));
    if (tab === "clans") api.get("/admin/clans").then(({ data }) => setClans(data.clans || []));
  }, [tab, user?.isAdmin]);

  const filteredUsers = useMemo(() => {
    const q = query.toLowerCase();
    return users.filter((u) =>
      `${u.username} ${u.userTag} ${u.email}`.toLowerCase().includes(q)
    );
  }, [users, query]);

  const filteredPosts = useMemo(() => {
    const q = query.toLowerCase();
    return posts.filter((p) => (p.content || "").toLowerCase().includes(q));
  }, [posts, query]);

  const filteredClans = useMemo(() => {
    const q = query.toLowerCase();
    return clans.filter((c) => (c.name || "").toLowerCase().includes(q));
  }, [clans, query]);

  async function toggleAdmin(id, isAdmin) {
    const { data } = await api.post(`/admin/users/${id}/admin`, { isAdmin });
    setUsers((prev) => prev.map((u) => (u._id === id ? { ...u, isAdmin: data.user.isAdmin } : u)));
  }

  async function deleteUser(id) {
    await api.delete(`/admin/users/${id}`);
    setUsers((prev) => prev.filter((u) => u._id !== id));
  }

  async function deletePost(id) {
    await api.delete(`/admin/posts/${id}`);
    setPosts((prev) => prev.filter((p) => p._id !== id));
  }

  async function deleteClan(id) {
    await api.delete(`/admin/clans/${id}`);
    setClans((prev) => prev.filter((c) => c._id !== id));
  }

  async function applyBoost(postId) {
    const draft = boostDraft[postId] || {};
    const payload = {
      likes: draft.likes ?? 0,
      comments: draft.comments ?? 0,
      views: draft.views ?? 0,
      mode: boostMode
    };
    const { data } = await api.post(`/admin/posts/${postId}/boost`, payload);
    setPosts((prev) => prev.map((p) => (p._id === postId ? { ...p, boost: data.post.boost } : p)));
  }

  function setBoostField(postId, field, value) {
    const num = Number(value);
    setBoostDraft((prev) => ({
      ...prev,
      [postId]: {
        ...prev[postId],
        [field]: Number.isFinite(num) ? num : 0
      }
    }));
  }

  function quickBoost(postId, likes, comments, views) {
    setBoostDraft((prev) => ({
      ...prev,
      [postId]: {
        likes: likes ?? prev[postId]?.likes ?? 0,
        comments: comments ?? prev[postId]?.comments ?? 0,
        views: views ?? prev[postId]?.views ?? 0
      }
    }));
  }

  if (!user?.isAdmin) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
        <h2 className="text-lg font-semibold">Доступ запрещён</h2>
        <p className="text-sm text-slate-500">Эта страница доступна только администраторам.</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="max-w-5xl space-y-4"
    >
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
        <h2 className="text-xl font-semibold">Админ‑панель</h2>
        <p className="text-sm text-slate-500">Доступ только для администраторов.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-lg">
          <div className="text-xs text-slate-500">Пользователей</div>
          <div className="text-2xl font-semibold">{overview?.users ?? "—"}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-lg">
          <div className="text-xs text-slate-500">Постов</div>
          <div className="text-2xl font-semibold">{overview?.posts ?? "—"}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-lg">
          <div className="text-xs text-slate-500">Кланов</div>
          <div className="text-2xl font-semibold">{overview?.clans ?? "—"}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-lg">
          <div className="text-xs text-slate-500">Заявок в кланы</div>
          <div className="text-2xl font-semibold">{overview?.joinRequests ?? "—"}</div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-lg">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: "users", label: "Пользователи" },
            { id: "posts", label: "Посты" },
            { id: "clans", label: "Кланы" }
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-3 py-1.5 rounded-xl text-sm border ${
                tab === t.id
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-slate-50 text-slate-600 border-slate-200"
              }`}
            >
              {t.label}
            </button>
          ))}
          {tab === "posts" && (
            <div className="flex items-center gap-2 ml-2 text-xs text-slate-500">
              <span>Накрутка:</span>
              <button
                className={`px-2 py-1 rounded-lg border ${boostMode === "set" ? "bg-slate-900 text-white border-slate-900" : "border-slate-200"}`}
                onClick={() => setBoostMode("set")}
              >
                Set
              </button>
              <button
                className={`px-2 py-1 rounded-lg border ${boostMode === "inc" ? "bg-slate-900 text-white border-slate-900" : "border-slate-200"}`}
                onClick={() => setBoostMode("inc")}
              >
                Inc
              </button>
            </div>
          )}
          <input
            className="ml-auto w-56 rounded-xl bg-slate-50 border border-slate-200 focus:border-sky-400 focus:ring-0 text-sm"
            placeholder="Поиск..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {error && <div className="text-sm text-rose-600 mt-2">{error}</div>}

        {tab === "users" && (
          <div className="mt-4 overflow-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-slate-500">
                <tr>
                  <th className="text-left p-2">Пользователь</th>
                  <th className="text-left p-2">Юзернейм</th>
                  <th className="text-left p-2">Email</th>
                  <th className="text-left p-2">Клан</th>
                  <th className="text-left p-2">Админ</th>
                  <th className="text-right p-2">Действия</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u._id} className="border-t border-slate-200">
                    <td className="p-2">{u.username}</td>
                    <td className="p-2">@{u.userTag}</td>
                    <td className="p-2">{u.email}</td>
                    <td className="p-2">{u.clan || "—"}</td>
                    <td className="p-2">
                      <button
                        className={`px-2 py-1 rounded-lg text-xs ${
                          u.isAdmin ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
                        }`}
                        onClick={() => toggleAdmin(u._id, !u.isAdmin)}
                      >
                        {u.isAdmin ? "Да" : "Нет"}
                      </button>
                    </td>
                    <td className="p-2 text-right">
                      <button
                        className="text-xs px-2 py-1 rounded-lg border border-rose-200 text-rose-600"
                        onClick={() => setModal({ type: "user", id: u._id, label: u.username })}
                      >
                        Удалить
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === "posts" && (
          <div className="mt-4 space-y-3">
            {filteredPosts.map((p) => {
              const likeCount = (p.likes?.length || 0) + (p.boost?.likes || 0);
              const commentCount = (p.comments?.length || 0) + (p.boost?.comments || 0);
              const viewCount = (p.views || 0) + (p.boost?.views || 0);
              const draft = boostDraft[p._id] || { likes: 0, comments: 0, views: 0 };
              return (
                <div key={p._id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm text-slate-700">
                      <span className="font-semibold">{p.author?.username || "Автор"}</span>
                      <span className="text-xs text-slate-500 ml-2">{new Date(p.createdAt).toLocaleString()}</span>
                      <div className="text-xs text-slate-500 truncate max-w-[520px]">{p.content || "(без текста)"}</div>
                      <div className="mt-2 text-xs text-slate-500 flex items-center gap-3">
                        <span>👍 {likeCount}</span>
                        <span>💬 {commentCount}</span>
                        <span>👁 {viewCount}</span>
                        <span className="text-slate-400">boost: +{p.boost?.likes || 0}/+{p.boost?.comments || 0}/+{p.boost?.views || 0}</span>
                      </div>
                    </div>
                    <button
                      className="text-xs px-2 py-1 rounded-lg border border-rose-200 text-rose-600"
                      onClick={() => setModal({ type: "post", id: p._id, label: p.author?.username || "пост" })}
                    >
                      Удалить
                    </button>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                    <input
                      className="w-20 rounded-lg border border-slate-200 bg-white px-2 py-1"
                      type="number"
                      value={draft.likes}
                      onChange={(e) => setBoostField(p._id, "likes", e.target.value)}
                      placeholder="Лайки"
                    />
                    <input
                      className="w-20 rounded-lg border border-slate-200 bg-white px-2 py-1"
                      type="number"
                      value={draft.comments}
                      onChange={(e) => setBoostField(p._id, "comments", e.target.value)}
                      placeholder="Комм"
                    />
                    <input
                      className="w-24 rounded-lg border border-slate-200 bg-white px-2 py-1"
                      type="number"
                      value={draft.views}
                      onChange={(e) => setBoostField(p._id, "views", e.target.value)}
                      placeholder="Просм"
                    />
                    <button
                      className="px-3 py-1 rounded-lg bg-slate-900 text-white"
                      onClick={() => applyBoost(p._id)}
                    >
                      Применить
                    </button>
                    <button
                      className="px-2 py-1 rounded-lg border border-slate-200"
                      onClick={() => quickBoost(p._id, 10, 2, 50)}
                    >
                      Быстро +10/+2/+50
                    </button>
                    <button
                      className="px-2 py-1 rounded-lg border border-slate-200"
                      onClick={() => quickBoost(p._id, 100, 10, 500)}
                    >
                      Турбо +100/+10/+500
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {tab === "clans" && (
          <div className="mt-4 space-y-2">
            {filteredClans.map((c) => (
              <div key={c._id} className="rounded-xl border border-slate-200 bg-slate-50 p-3 flex items-center justify-between">
                <div className="text-sm text-slate-700">
                  <span className="font-semibold">{c.name}</span>
                  <span className="text-xs text-slate-500 ml-2">лидер: {c.leader?.username || "—"}</span>
                  <span className="text-xs text-slate-500 ml-2">{c.isPrivate ? "приватный" : "публичный"}</span>
                </div>
                <button
                  className="text-xs px-2 py-1 rounded-lg border border-rose-200 text-rose-600"
                  onClick={() => setModal({ type: "clan", id: c._id, label: c.name })}
                >
                  Удалить
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {modal?.type === "user" && (
          <Modal
            open
            title="Удалить пользователя"
            description={`Удалить пользователя ${modal.label}?`}
            confirmText="Удалить"
            danger
            onClose={() => setModal(null)}
            onConfirm={() => {
              deleteUser(modal.id);
              setModal(null);
            }}
          />
        )}
        {modal?.type === "post" && (
          <Modal
            open
            title="Удалить пост"
            description="Удалить пост без возможности восстановления?"
            confirmText="Удалить"
            danger
            onClose={() => setModal(null)}
            onConfirm={() => {
              deletePost(modal.id);
              setModal(null);
            }}
          />
        )}
        {modal?.type === "clan" && (
          <Modal
            open
            title="Удалить клан"
            description={`Удалить клан ${modal.label}?`}
            confirmText="Удалить"
            danger
            onClose={() => setModal(null)}
            onConfirm={() => {
              deleteClan(modal.id);
              setModal(null);
            }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
