import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getBookmarks } from "../api/extra";
import PostCard from "../components/PostCard.jsx";

export default function Bookmarks() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    getBookmarks().then(setPosts);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-2xl space-y-4"
    >
      <div className="rounded-2xl p-4 bg-white border border-slate-200 shadow-lg">
        <h2 className="text-lg font-semibold">Закладки</h2>
        <p className="text-sm text-slate-500">Сохраненные посты</p>
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

