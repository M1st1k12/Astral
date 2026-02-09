import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import api from "../api/http";
import PostComposer from "../components/PostComposer.jsx";
import PostCard from "../components/PostCard.jsx";
import { getSocket } from "../api/socket";
import useAuthStore from "../store/authStore";

export default function Feed() {
  const token = useAuthStore((s) => s.token);
  const [posts, setPosts] = useState([]);
  const [tab, setTab] = useState("for-you");
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState("");
  const refreshTimer = useRef(null);

  async function loadFeed(currentTab, { silent = false } = {}) {
    const endpoint = currentTab === "following" ? "/posts/following" : "/posts/global";
    if (!silent) setRefreshing(true);
    setError("");
    try {
      const { data } = await api.get(endpoint);
      setPosts(data.posts);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.response?.data?.message || "Failed to refresh feed");
    } finally {
      if (!silent) setRefreshing(false);
    }
  }

  useEffect(() => {
    loadFeed(tab);
  }, [tab]);

  useEffect(() => {
    if (refreshTimer.current) clearInterval(refreshTimer.current);
    refreshTimer.current = setInterval(() => {
      if (document.visibilityState !== "visible") return;
      loadFeed(tab, { silent: true });
    }, 20000);
    return () => {
      if (refreshTimer.current) clearInterval(refreshTimer.current);
    };
  }, [tab]);

  function handleCreated(post) {
    setPosts((prev) => [post, ...prev]);
  }

  function handleUpdatePost(post) {
    if (post?._hide) {
      setPosts((prev) => prev.filter((p) => p._id !== post._id));
      return;
    }
    setPosts((prev) => {
      const exists = prev.some((p) => p._id === post._id);
      return exists ? prev.map((p) => (p._id === post._id ? post : p)) : [post, ...prev];
    });
  }

  useEffect(() => {
    if (!token) return;
    const socket = getSocket();
    if (!socket) return;

    const handleNew = (post) => {
      if (!post?._id) return;
      setPosts((prev) => (prev.some((p) => p._id === post._id) ? prev : [post, ...prev]));
      setLastUpdated(new Date());
    };

    const handleUpdate = (post) => {
      if (!post?._id) return;
      handleUpdatePost(post);
      setLastUpdated(new Date());
    };

    const handleDelete = (payload) => {
      const postId = payload?._id || payload;
      if (!postId) return;
      setPosts((prev) => prev.filter((p) => p._id !== postId));
      setLastUpdated(new Date());
    };

    socket.on("post:new", handleNew);
    socket.on("post:update", handleUpdate);
    socket.on("post:delete", handleDelete);

    return () => {
      socket.off("post:new", handleNew);
      socket.off("post:update", handleUpdate);
      socket.off("post:delete", handleDelete);
    };
  }, [token]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="w-full md:max-w-2xl md:mx-auto space-y-4"
    >
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="rounded-2xl p-3 flex flex-wrap items-center gap-2 bg-white border border-slate-200 shadow-lg transition-shadow hover:shadow-xl"
      >
        <button
          className={`px-4 py-2 rounded-xl text-sm ${
            tab === "for-you" ? "bg-slate-100 text-slate-900" : "text-slate-500"
          }`}
          onClick={() => setTab("for-you")}
        >
          Popular
        </button>
        <button
          className={`px-4 py-2 rounded-xl text-sm ${
            tab === "following" ? "bg-slate-100 text-slate-900" : "text-slate-500"
          }`}
          onClick={() => setTab("following")}
        >
          Following
        </button>
        <div className="sm:ml-auto flex items-center gap-2 text-xs text-slate-400">
          <button
            className="px-2 py-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
            onClick={() => loadFeed(tab)}
            disabled={refreshing}
          >
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
          <span>
            {lastUpdated
              ? `Updated: ${lastUpdated.toLocaleTimeString()}`
              : "Updated just now"}
          </span>
        </div>
      </motion.div>

      <PostComposer onCreated={handleCreated} />

      {error && (
        <div className="rounded-2xl p-3 bg-rose-50 border border-rose-100 text-sm text-rose-600">
          {error}
        </div>
      )}

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
            <PostCard post={post} onUpdate={handleUpdatePost} />
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}

