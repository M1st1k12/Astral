import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import useAuthStore from "../store/authStore";
import api from "../api/http";
import PostCard from "../components/PostCard.jsx";
import { getClan } from "../api/extra";

export default function Profile() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const [username, setUsername] = useState(user?.username || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [clan, setClan] = useState(user?.clan || "");
  const [userTag, setUserTag] = useState(user?.userTag || "");
  const [isPrivate, setIsPrivate] = useState(!!user?.isPrivate);
  const [avatar, setAvatar] = useState(null);
  const [cover, setCover] = useState(null);
  const [status, setStatus] = useState("");
  const [posts, setPosts] = useState([]);
  const [tab, setTab] = useState("posts");
  const [isLeader, setIsLeader] = useState(false);

  useEffect(() => {
    if (!user?._id) return;
    api.get(`/posts/user/${user._id}`).then(({ data }) => setPosts(data.posts));
    if (user?.clan) {
      getClan(user.clan)
        .then((res) => setIsLeader(!!res.isLeader))
        .catch(() => setIsLeader(false));
    }
  }, [user?._id]);

  async function saveProfile() {
    const { data } = await api.put("/users/me", { username, userTag, bio, isPrivate, clan });
    setUser?.(data.user);
    setStatus("Профиль обновлен");
  }

  async function uploadAvatar() {
    if (!avatar) return;
    const form = new FormData();
    form.append("avatar", avatar);
    const { data } = await api.put("/users/me/avatar", form, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    setUser?.(data.user);
    setStatus("Аватар обновлен");
  }

  async function uploadCover() {
    if (!cover) return;
    const form = new FormData();
    form.append("cover", cover);
    const { data } = await api.put("/users/me/cover", form, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    setUser?.(data.user);
    setStatus("Обложка обновлена");
  }

  const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const reposts = useMemo(() => posts.filter((p) => p.repostOf), [posts]);

  const tabs = [
    { id: "posts", label: "Мои", count: posts.length },
    { id: "reposts", label: "Репосты", count: reposts.length }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-4xl space-y-4"
    >
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="rounded-2xl bg-white border border-slate-200 shadow-lg overflow-hidden"
      >
        <div className="h-36 bg-gradient-to-r from-sky-100 via-slate-100 to-indigo-100 relative">
          {user?.cover && (
            <img
              src={baseUrl + user.cover}
              alt="cover"
              className="h-full w-full object-cover"
            />
          )}
          <div className="absolute -bottom-10 left-6 h-20 w-20 rounded-full border-4 border-white bg-slate-200 overflow-hidden">
            {user?.avatar && (
              <img src={baseUrl + user.avatar} alt="avatar" className="h-full w-full object-cover" />
            )}
          </div>
        </div>
        <div className="pt-12 px-6 pb-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-semibold">{user?.username || "User"}</h2>
              <p className="text-sm text-slate-500">@{user?.userTag || "astral"}</p>
              {user?.clan && (
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center text-xs px-2 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-100">
                    Клан: {user.clan}
                  </span>
                  {isLeader && (
                    <span className="inline-flex items-center text-xs px-2 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                      Лидер клана
                    </span>
                  )}
                </div>
              )}
              {bio && <p className="text-sm text-slate-600 mt-2">{bio}</p>}
            </div>
            <div className="flex gap-4 text-center">
              <div>
                <p className="text-lg font-semibold">{user?.followers?.length || 0}</p>
                <p className="text-xs text-slate-500">Подписчики</p>
              </div>
              <div>
                <p className="text-lg font-semibold">{user?.following?.length || 0}</p>
                <p className="text-xs text-slate-500">Подписки</p>
              </div>
              <div>
                <p className="text-lg font-semibold">{posts.length}</p>
                <p className="text-xs text-slate-500">Посты</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="rounded-2xl p-6 bg-white border border-slate-200 shadow-lg"
      >
        <h3 className="text-lg font-semibold">Настройки</h3>
        <p className="text-sm text-slate-500">Публичные данные и приватность.</p>

        <div className="mt-6 space-y-4">
          <div>
            <label className="text-xs text-slate-500">Юзернейм</label>
            <input
              className="w-full rounded-xl bg-slate-50 border border-slate-200 focus:border-sky-400 focus:ring-0"
              value={userTag}
              onChange={(e) => setUserTag(e.target.value.toLowerCase())}
            />
          </div>
          <div>
            <label className="text-xs text-slate-500">Ник</label>
            <input
              className="w-full rounded-xl bg-slate-50 border border-slate-200 focus:border-sky-400 focus:ring-0"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs text-slate-500">О себе</label>
            <textarea
              className="w-full rounded-xl bg-slate-50 border border-slate-200 focus:border-sky-400 focus:ring-0"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs text-slate-500">Клан</label>
            <input
              className="w-full rounded-xl bg-slate-50 border border-slate-200 focus:border-sky-400 focus:ring-0"
              value={clan}
              onChange={(e) => setClan(e.target.value)}
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
            />
            Приватный профиль
          </label>
          <button className="px-4 py-2 rounded-xl bg-sky-500 text-white hover:bg-sky-600 transition transform hover:-translate-y-0.5 active:translate-y-0" onClick={saveProfile}>
            Сохранить
          </button>

          <div>
            <label className="text-xs text-slate-500">Аватар</label>
            <div className="mt-2 flex items-center gap-3">
              <label className="px-3 py-2 rounded-lg bg-slate-100 border border-slate-200 text-sm cursor-pointer hover:bg-slate-200 transition transform hover:-translate-y-0.5 active:translate-y-0">
                Выбрать файл
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => setAvatar(e.target.files?.[0] || null)}
                />
              </label>
              <span className="text-sm text-slate-500">
                {avatar?.name || "Файл не выбран"}
              </span>
              <button
                className="ml-auto px-4 py-2 rounded-xl bg-sky-500 text-white hover:bg-sky-600 transition transform hover:-translate-y-0.5 active:translate-y-0"
                onClick={uploadAvatar}
              >
                Загрузить
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-500">Обложка</label>
            <div className="mt-2 flex items-center gap-3">
              <label className="px-3 py-2 rounded-lg bg-slate-100 border border-slate-200 text-sm cursor-pointer hover:bg-slate-200 transition transform hover:-translate-y-0.5 active:translate-y-0">
                Выбрать файл
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => setCover(e.target.files?.[0] || null)}
                />
              </label>
              <span className="text-sm text-slate-500">
                {cover?.name || "Файл не выбран"}
              </span>
              <button
                className="ml-auto px-4 py-2 rounded-xl bg-sky-500 text-white hover:bg-sky-600 transition transform hover:-translate-y-0.5 active:translate-y-0"
                onClick={uploadCover}
              >
                Загрузить
              </button>
            </div>
          </div>

          {status && <p className="text-sm text-sky-600">{status}</p>}
        </div>
      </motion.div>

      <div className="rounded-2xl p-4 bg-white border border-slate-200 shadow-lg">
        <div className="flex flex-wrap gap-2">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-3 py-1.5 rounded-xl text-sm border ${
                tab === t.id
                  ? "bg-sky-500 text-white border-sky-500"
                  : "bg-slate-50 text-slate-600 border-slate-200"
              }`}
            >
              {t.label}
              <span className="ml-2 text-xs opacity-80">{t.count}</span>
            </button>
          ))}
        </div>
      </div>

      {tab === "reposts" && (
        <div className="space-y-4">
          {reposts.length === 0 ? (
            <div className="rounded-2xl p-4 bg-white border border-slate-200 shadow-lg text-slate-500">
              Нет репостов
            </div>
          ) : (
            reposts.map((post) => <PostCard key={post._id} post={post} />)
          )}
        </div>
      )}

      {tab === "posts" && (
        <div className="space-y-4">
          {posts.length === 0 ? (
            <div className="rounded-2xl p-4 bg-white border border-slate-200 shadow-lg text-slate-500">
              Пока нет постов
            </div>
          ) : (
            posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                onUpdate={(p) => setPosts((prev) => prev.map((x) => (x._id === p._id ? p : x)))}
              />
            ))
          )}
        </div>
      )}
    </motion.div>
  );
}

