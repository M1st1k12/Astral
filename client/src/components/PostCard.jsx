import { useState } from "react";
import { motion } from "framer-motion";
import api from "../api/http";
import useAuthStore from "../store/authStore";
import PostActions from "./PostActions.jsx";

export default function PostCard({ post, onUpdate }) {
  const user = useAuthStore((s) => s.user);
  const [comment, setComment] = useState("");
  const clans = ["Lyra", "Orion", "Draco", "Phoenix"];
  const clan = clans[(post.author?.username?.length || 0) % clans.length];
  const isConstellation = (post.likes?.length || 0) >= 3;
  const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const mediaUrl = post.mediaUrl?.startsWith("/uploads")
    ? `${baseUrl}${post.mediaUrl}`
    : post.mediaUrl;

  const liked = post.likes?.some((id) => id === user?._id || id?._id === user?._id);

  async function toggleLike() {
    const { data } = await api.post(`/posts/${post._id}/like`);
    onUpdate?.(data.post);
  }

  async function addComment(e) {
    e.preventDefault();
    if (!comment.trim()) return;
    const { data } = await api.post(`/posts/${post._id}/comment`, { text: comment });
    onUpdate?.(data.post);
    setComment("");
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="rounded-2xl p-4 bg-white border border-slate-200 shadow-lg transition-shadow hover:shadow-xl"
    >
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-slate-200 overflow-hidden">
          {post.author?.avatar && (
            <img src={`${baseUrl}${post.author.avatar}`} alt="avatar" className="h-full w-full object-cover" />
          )}
        </div>
        <div>
          <p className="font-semibold">{post.author?.username}</p>
          <p className="text-xs text-slate-400">{new Date(post.createdAt).toLocaleString()}</p>
          <p className="text-xs text-slate-500">
            Клан: {clan} {isConstellation ? "• Созвездие собрано ✨" : "• звезда в пути"}
          </p>
        </div>
      </div>

      {post.repostOf && (
        <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-sm">
          Репост от {post.repostOf?.author?.username || "unknown"}
          {post.repostOf?.content && <p className="mt-2">{post.repostOf.content}</p>}
        </div>
      )}

      {post.content && <p className="mt-3 text-sm">{post.content}</p>}

      {post.mediaUrl && (
        <div className="mt-3">
          {post.mediaType === "image" ? (
            <img src={mediaUrl} alt="media" className="rounded-xl max-h-96" />
          ) : (
            <a className="text-sky-600 underline" href={mediaUrl} target="_blank" rel="noreferrer">
              Скачать файл
            </a>
          )}
        </div>
      )}

      <div className="mt-3 flex items-center gap-4 text-sm text-slate-500">
        <button className={liked ? "text-sky-600" : ""} onClick={toggleLike}>
          ❤ {post.likes?.length || 0}
        </button>
        <span>💬 {post.comments?.length || 0}</span>
        <span>👁 {post.views || 0}</span>
      </div>

      <PostActions post={post} onUpdate={onUpdate} />

      <form onSubmit={addComment} className="mt-3 flex gap-2">
        <input
          className="flex-1 rounded-xl bg-slate-50 border border-slate-200 focus:border-sky-400 focus:ring-0"
          placeholder="Добавить комментарий"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <button className="px-3 py-1 rounded-xl bg-slate-100" type="submit">
          Отправить
        </button>
      </form>

      {post.comments?.length > 0 && (
        <div className="mt-3 space-y-2">
          {post.comments.slice(-3).map((c) => (
            <div key={c._id} className="text-xs text-slate-600">
              <span className="text-slate-900">{c.user?.username}:</span> {c.text}
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

