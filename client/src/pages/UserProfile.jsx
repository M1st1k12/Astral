import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useParams } from "react-router-dom";
import api from "../api/http";
import PostCard from "../components/PostCard.jsx";
import { getSocket } from "../api/socket";
import { resolveMediaUrl } from "../utils/media";

export default function UserProfile() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [privateBlocked, setPrivateBlocked] = useState(false);
  const [requested, setRequested] = useState(false);

  useEffect(() => {
    api.get(`/users/${id}`).then(({ data }) => {
      setUser(data.user);
      setIsFollowing(data.isFollowing);
    });
    api.get(`/posts/user/${id}`)
      .then(({ data }) => setPosts(data.posts))
      .catch((err) => {
        if (err.response?.status === 403) setPrivateBlocked(true);
        setPosts([]);
      });
  }, [id]);
  useEffect(() => {
    if (!id || privateBlocked) return;
    const socket = getSocket();
    if (!socket) return;

    const handleNew = (post) => {
      if (!post?._id || post.author?._id !== id) return;
      setPosts((prev) => (prev.some((p) => p._id === post._id) ? prev : [post, ...prev]));
    };

    const handleUpdate = (post) => {
      if (!post?._id) return;
      setPosts((prev) => prev.map((p) => (p._id === post._id ? post : p)));
    };

    const handleDelete = (payload) => {
      const postId = payload?._id || payload;
      if (!postId) return;
      setPosts((prev) => prev.filter((p) => p._id !== postId));
    };

    socket.on("post:new", handleNew);
    socket.on("post:update", handleUpdate);
    socket.on("post:delete", handleDelete);

    return () => {
      socket.off("post:new", handleNew);
      socket.off("post:update", handleUpdate);
      socket.off("post:delete", handleDelete);
    };
  }, [id, privateBlocked]);

  async function toggleFollow() {
    if (isFollowing) {
      await api.post(`/users/${id}/unfollow`);
      setIsFollowing(false);
      setRequested(false);
    } else {
      const { data } = await api.post(`/users/${id}/follow`);
      if (data.requested) {
        setRequested(true);
        setPrivateBlocked(true);
      } else {
        setIsFollowing(true);
      }
    }
  }

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
            <img src={resolveMediaUrl(user.cover)} alt="cover" className="h-full w-full object-cover" />
          )}
          <div className="absolute -bottom-10 left-6 h-20 w-20 rounded-full border-4 border-white bg-slate-200 overflow-hidden">
            {user?.avatar && (
              <img
                src={resolveMediaUrl(user.avatar)}
                alt="avatar"
                className="h-full w-full object-cover"
              />
            )}
          </div>
        </div>
        <div className="pt-12 px-6 pb-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-semibold">{user?.username}</h2>
              <p className="text-sm text-slate-500">@{user?.userTag || user?.username}</p>
              {user?.clan && (
                <span className="inline-flex items-center mt-2 text-xs px-2 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-100">
                  Clan: {user.clan}
                </span>
              )}
              <p className="text-sm text-slate-600 mt-2">{user?.bio}</p>
            </div>
            <div className="flex gap-4 text-center">
              <div>
                <p className="text-lg font-semibold">{user?.followers?.length || 0}</p>
                <p className="text-xs text-slate-500">Followers</p>
              </div>
              <div>
                <p className="text-lg font-semibold">{user?.following?.length || 0}</p>
                <p className="text-xs text-slate-500">Following</p>
              </div>
              <div>
                <p className="text-lg font-semibold">{posts.length}</p>
                <p className="text-xs text-slate-500">Posts</p>
              </div>
            </div>
            <button
              onClick={toggleFollow}
              className="px-4 py-2 rounded-xl bg-sky-500 text-white"
            >
              {requested ? "Requested" : isFollowing ? "Unfollow" : "Follow"}
            </button>
          </div>
        </div>
      </motion.div>

      {privateBlocked ? (
        <div className="rounded-2xl p-4 bg-white border border-slate-200 shadow-lg text-slate-500">
          This profile is private. Await approval.
        </div>
      ) : (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Posts</h3>
          {posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              onUpdate={(p) => setPosts((prev) => prev.map((x) => (x._id === p._id ? p : x)))}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}








