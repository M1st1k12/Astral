import { motion } from "framer-motion";
import useAuthStore from "../store/authStore";
import { deletePost, repost } from "../api/extra";

export default function PostActions({ post, onUpdate }) {
  const user = useAuthStore((s) => s.user);
  const isOwner = post.author?._id === user?._id;

  async function handleRepost() {
    const newPost = await repost(post._id);
    onUpdate?.(newPost);
  }

  async function handleDelete() {
    if (!isOwner) return;
    await deletePost(post._id);
    onUpdate?.({ _id: post._id, _hide: true });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="mt-3 flex items-center gap-2 text-sm text-slate-500"
    >
      <button className="h-8 w-8 rounded-full hover:bg-slate-100 transition flex items-center justify-center" onClick={handleRepost} title="Repost">
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M7 7h10v6" />
          <path d="M17 7 14 4" />
          <path d="M17 17H7v-6" />
          <path d="M7 17l3 3" />
        </svg>
      </button>
      {isOwner && (
        <>
          <button className="h-8 w-8 rounded-full hover:bg-rose-50 text-rose-600 transition flex items-center justify-center" onClick={handleDelete} title="Delete">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M4 7h16" />
              <path d="M9 7V5h6v2" />
              <rect x="6" y="7" width="12" height="13" rx="2" />
            </svg>
          </button>
        </>
      )}
    </motion.div>
  );
}
