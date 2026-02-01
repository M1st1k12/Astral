import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "../api/http";
import PostComposer from "../components/PostComposer.jsx";
import PostCard from "../components/PostCard.jsx";

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [tab, setTab] = useState("for-you");

  async function loadFeed(currentTab) {
    const endpoint = currentTab === "following" ? "/posts/following" : "/posts/global";
    const { data } = await api.get(endpoint);
    setPosts(data.posts);
  }

  useEffect(() => {
    loadFeed(tab);
  }, [tab]);

  function handleCreated(post) {
    setPosts((prev) => [post, ...prev]);
  }

  function handleUpdate(post) {
    if (post?._hide) {
      setPosts((prev) => prev.filter((p) => p._id !== post._id));
      return;
    }
    setPosts((prev) => {
      const exists = prev.some((p) => p._id === post._id);
      return exists ? prev.map((p) => (p._id === post._id ? post : p)) : [post, ...prev];
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="max-w-2xl mx-auto space-y-4"
    >
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="rounded-2xl p-3 flex items-center gap-2 bg-white border border-slate-200 shadow-lg transition-shadow hover:shadow-xl"
      >
        <button
          className={`px-4 py-2 rounded-xl text-sm ${
            tab === "for-you" ? "bg-slate-100 text-slate-900" : "text-slate-500"
          }`}
          onClick={() => setTab("for-you")}
        >
          Популярное
        </button>
        <button
          className={`px-4 py-2 rounded-xl text-sm ${
            tab === "following" ? "bg-slate-100 text-slate-900" : "text-slate-500"
          }`}
          onClick={() => setTab("following")}
        >
          Подписки
        </button>
        <span className="ml-auto text-xs text-slate-400">Обновлено сейчас</span>
      </motion.div>

      <PostComposer onCreated={handleCreated} />

      <motion.div
        initial="hidden"
        animate="show"
        variants={{
          hidden: { opacity: 0 },
          show: { opacity: 1, transition: { staggerChildren: 0.06 } }
        }}
        className="space-y-4"
      >
        {posts.map((post) => (
          <motion.div
            key={post._id}
            variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}
            transition={{ duration: 0.25 }}
          >
            <PostCard post={post} onUpdate={handleUpdate} />
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}

