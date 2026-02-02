import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import api from "../api/http";
import useAuthStore from "../store/authStore";
import { resolveMediaUrl } from "../utils/media";
import PostActions from "./PostActions.jsx";

export default function PostCard({ post, onUpdate }) {
  const user = useAuthStore((s) => s.user);
  const [comment, setComment] = useState("");
  const inputRef = useRef(null);
  const clans = ["Lyra", "Orion", "Draco", "Phoenix"];
  const clan = clans[(post.author?.username?.length || 0) % clans.length];
  const isConstellation = (post.likes?.length || 0) >= 3;
  const mediaUrl = resolveMediaUrl(post.mediaUrl);
  const authorProfile = post.author?._id ? `/user/${post.author._id}` : "/profile";

  const liked = post.likes?.some((id) => id === user?._id || id?._id === user?._id);
  const likeCount = (post.likes?.length || 0) + (post.boost?.likes || 0);
  const commentCount = (post.comments?.length || 0) + (post.boost?.comments || 0);
  const viewCount = (post.views || 0) + (post.boost?.views || 0);

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

  function handleReply(username) {
    if (!username) return;
    const next = comment.includes(`@${username}`) ? comment : `@${username} ${comment}`.trim();
    setComment(next.endsWith(" ") ? next : `${next} `);
    inputRef.current?.focus();
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="rounded-2xl p-4 bg-white border border-slate-200 shadow-lg transition-shadow hover:shadow-xl"
    >
      <div className="flex items-center gap-3">
        <Link to={authorProfile} className="h-10 w-10 rounded-full bg-slate-200 overflow-hidden">
          {post.author?.avatar && (
            <img
              src={resolveMediaUrl(post.author.avatar)}
              alt="avatar"
              className="h-full w-full object-cover"
            />
          )}
        </Link>
        <div>
          <Link to={authorProfile} className="font-semibold hover:text-sky-600 transition">
            {post.author?.username}
          </Link>
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
            <img src={mediaUrl} alt="media" className="rounded-xl max-h-96 w-full object-cover" />
          ) : (
            <a className="text-sky-600 underline" href={mediaUrl} target="_blank" rel="noreferrer">
              Скачать файл
            </a>
          )}
        </div>
      )}

      <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
        <button
          className={`px-2.5 py-1.5 rounded-full border text-xs flex items-center gap-1.5 transition ${
            liked ? "border-sky-300 text-sky-600 bg-sky-50" : "border-slate-200 hover:bg-slate-50"
          }`}
          onClick={toggleLike}
          title="Лайк"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M12 20s-7-4.35-7-9a4 4 0 0 1 7-2.65A4 4 0 0 1 19 11c0 4.65-7 9-7 9z" />
          </svg>
          <span>{likeCount}</span>
        </button>
        <div className="px-2.5 py-1.5 rounded-full border border-slate-200 text-xs flex items-center gap-1.5">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M21 12a8 8 0 0 1-8 8H7l-4 3 1.2-4.5A8 8 0 1 1 21 12z" />
          </svg>
          <span>{commentCount}</span>
        </div>
        <div className="px-2.5 py-1.5 rounded-full border border-slate-200 text-xs flex items-center gap-1.5">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6-10-6-10-6z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          <span>{viewCount}</span>
        </div>
      </div>

      <PostActions post={post} onUpdate={onUpdate} />

      <form onSubmit={addComment} className="mt-3 flex flex-col sm:flex-row gap-2">
        <input
          ref={inputRef}
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
            <div key={c._id} className="text-xs text-slate-600 flex items-start gap-2">
              <Link
                to={c.user?._id ? `/user/${c.user._id}` : "/profile"}
                className="text-slate-900 font-semibold hover:text-sky-600"
              >
                {c.user?.username}:
              </Link>
              <span className="flex-1">{c.text}</span>
              <button
                className="text-[11px] text-slate-400 hover:text-sky-600"
                onClick={() => handleReply(c.user?.username)}
                type="button"
              >
                Ответить
              </button>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
