import { useState } from "react";
import { motion } from "framer-motion";
import { searchAll } from "../api/extra";
import { Link } from "react-router-dom";
import PostCard from "../components/PostCard.jsx";

const fadeUp = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35 },
};

export default function Search() {
  const [query, setQuery] = useState("");
  const [data, setData] = useState({ users: [], posts: [], hashtags: [] });

  async function handleSearch(e) {
    const value = e.target.value;
    setQuery(value);
    if (value.trim().length < 2) return;
    const res = await searchAll(value);
    setData(res);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-3xl space-y-4"
    >
      <motion.div {...fadeUp} className="rounded-2xl p-4 bg-white border border-slate-200 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-slate-900 text-white grid place-items-center">??</div>
          <input
            className="w-full rounded-xl bg-slate-50 border border-slate-200 focus:border-sky-400 focus:ring-0"
            placeholder="Поиск пользователей и хэштегов"
            value={query}
            onChange={handleSearch}
          />
        </div>
      </motion.div>

      {data.hashtags.length > 0 && (
        <motion.div {...fadeUp} className="rounded-2xl p-4 bg-white border border-slate-200 shadow-lg">
          <h3 className="text-lg font-semibold">Популярные хэштеги</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {data.hashtags.map((h) => (
              <div
                key={h._id}
                className="px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-sm text-slate-700"
              >
                {h._id}
                <span className="ml-2 text-slate-500">{h.count}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {data.users.length > 0 && (
        <motion.div {...fadeUp} className="rounded-2xl p-4 bg-white border border-slate-200 shadow-lg">
          <h3 className="text-lg font-semibold">Пользователи</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {data.users.map((u) => (
              <Link
                key={u._id}
                to={`/user/${u._id}`}
                className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 hover:bg-white hover:border-slate-300 transition"
              >
                <img
                  src={u.avatar || "https://i.pravatar.cc/80?img=5"}
                  alt={u.username}
                  className="h-11 w-11 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="text-sm font-semibold text-slate-900 group-hover:text-slate-950">
                    {u.username}
                  </div>
                  <div className="text-xs text-slate-500">Перейти в профиль</div>
                </div>
                <div className="text-xs text-slate-500">→</div>
              </Link>
            ))}
          </div>
        </motion.div>
      )}

      {data.posts.map((post) => (
        <PostCard key={post._id} post={post} />
      ))}
    </motion.div>
  );
}


