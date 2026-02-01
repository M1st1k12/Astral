import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getHidden } from "../api/extra";
import PostCard from "../components/PostCard.jsx";

export default function Hidden() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    getHidden().then(setPosts);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-2xl space-y-4"
    >
      <div className="rounded-2xl p-4 bg-white border border-slate-200 shadow-lg">
        <h2 className="text-lg font-semibold">Скрытые</h2>
        <p className="text-sm text-slate-500">Посты, которые вы скрыли</p>
      </div>
      {posts.length === 0 && (
        <div className="rounded-2xl p-4 bg-white border border-slate-200 shadow-lg text-slate-500">
          Пусто
        </div>
      )}
      {posts.map((post) => (
        <PostCard key={post._id} post={post} />
      ))}
    </motion.div>
  );
}

