import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import useAuthStore from "../store/authStore";
import MessageActions from "./MessageActions.jsx";

export default function MessageItem({ message }) {
  const user = useAuthStore((s) => s.user);
  const isOwn = message.sender?._id === user?._id;
  const prevContentRef = useRef(message.content);
  const [editedPulse, setEditedPulse] = useState(false);
  const [reactPulse, setReactPulse] = useState(false);

  useEffect(() => {
    if (message.content && message.content !== prevContentRef.current) {
      prevContentRef.current = message.content;
      setEditedPulse(true);
      const t = setTimeout(() => setEditedPulse(false), 600);
      return () => clearTimeout(t);
    }
  }, [message.content]);

  useEffect(() => {
    if (message.reactions?.length) {
      setReactPulse(true);
      const t = setTimeout(() => setReactPulse(false), 500);
      return () => clearTimeout(t);
    }
  }, [message.reactions?.length]);

  if (message.deletedAt) return null;
  const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const fileUrl = message.fileUrl?.startsWith("/uploads")
    ? `${baseUrl}${message.fileUrl}`
    : message.fileUrl;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6, scale: 0.98 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
    >
      <motion.div
        animate={editedPulse ? { boxShadow: "0 0 0 3px rgba(56,189,248,0.25)" } : { boxShadow: "0 0 0 0 rgba(0,0,0,0)" }}
        transition={{ duration: 0.4 }}
        className={`max-w-sm rounded-2xl px-4 py-2 shadow-sm ${
          isOwn
            ? "bg-sky-100 border border-sky-200"
            : "bg-white border border-slate-200"
        }`}
      >
        <div className="text-xs text-slate-500 mb-1">
          {message.sender?.username || "Unknown"}
        </div>
        {message.type !== "text" && message.fileUrl && (
          <div className="mb-2">
            {message.type === "image" ? (
              <img src={fileUrl} alt={message.fileName} className="rounded-xl max-h-56" />
            ) : (
              <a className="text-sky-600 underline" href={fileUrl} target="_blank" rel="noreferrer">
                {message.fileName}
              </a>
            )}
          </div>
        )}
        <p className="text-sm text-slate-900">
          {message.content || (message.deletedAt ? "Сообщение удалено" : "")}
        </p>
        <div className="mt-1 flex items-center justify-between text-xs text-slate-400">
          <span>{new Date(message.createdAt).toLocaleTimeString()}</span>
          {isOwn && <span>{message.seen ? "Прочитано" : "Отправлено"}</span>}
        </div>
        {message.reactions?.length > 0 && (
          <motion.div
            animate={reactPulse ? { scale: 1.08 } : { scale: 1 }}
            transition={{ duration: 0.25 }}
            className="mt-1 text-xs text-slate-500"
          >
            {message.reactions.map((r) => r.emoji).join(" ")}
          </motion.div>
        )}
        {isOwn && <MessageActions message={message} />}
      </motion.div>
    </motion.div>
  );
}
