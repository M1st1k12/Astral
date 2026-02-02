import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import useAuthStore from "../store/authStore";
import useConversationStore from "../store/conversationStore";
import { resolveMediaUrl } from "../utils/media";
import MessageItem from "./MessageItem.jsx";
import MessageInput from "./MessageInput.jsx";

export default function MessageThread() {
  const user = useAuthStore((s) => s.user);
  const activeConversation = useConversationStore((s) => s.activeConversation);
  const messages = useConversationStore((s) => s.messages);
  const loadMessages = useConversationStore((s) => s.loadMessages);
  const markSeen = useConversationStore((s) => s.markSeen);
  const typing = useConversationStore((s) => s.typing);

  const [ready, setReady] = useState(false);
  const bottomRef = useRef(null);

  const conversationMessages = useMemo(() => {
    if (!activeConversation) return [];
    return messages[activeConversation._id] || [];
  }, [messages, activeConversation]);

  useEffect(() => {
    if (!activeConversation) return;
    loadMessages(activeConversation._id).then(() => setReady(true));
  }, [activeConversation, loadMessages]);

  useEffect(() => {
    if (!activeConversation) return;
    const unseen = conversationMessages
      .filter((m) => !m.seen && m.sender?._id !== user?._id)
      .map((m) => m._id);
    if (unseen.length > 0) markSeen(activeConversation._id, unseen);
  }, [conversationMessages, activeConversation, user, markSeen]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversationMessages.length, typing[activeConversation?._id]]);

  if (!activeConversation) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="flex-1 rounded-2xl p-6 flex items-center justify-center bg-white border border-slate-200 shadow-lg"
      >
        <p className="text-slate-500">Выберите диалог, чтобы начать</p>
      </motion.div>
    );
  }

  const other = activeConversation.participants.find((p) => p._id !== user?._id);
  const otherProfile = other?._id ? `/user/${other._id}` : "/profile";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex-1 rounded-2xl p-4 flex flex-col bg-white border border-slate-200 shadow-lg"
    >
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <Link to={otherProfile} className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-slate-200 overflow-hidden">
            {other?.avatar && (
              <img
                src={resolveMediaUrl(other.avatar)}
                alt="avatar"
                className="h-full w-full object-cover"
              />
            )}
          </div>
          <div>
            <p className="font-semibold hover:text-sky-600 transition">{other?.username}</p>
            <p className="text-xs text-slate-400">
              {other?.status === "online"
                ? "В сети"
                : `Был(а) ${new Date(other?.lastSeen || Date.now()).toLocaleString()}`}
            </p>
          </div>
        </Link>
        <span className="text-xs text-sky-600">Личные сообщения</span>
      </div>

      <div className="flex-1 overflow-auto mt-4 space-y-3">
        <AnimatePresence>
          {conversationMessages.map((message) => (
            <MessageItem key={message._id} message={message} />
          ))}
        </AnimatePresence>
        {typing[activeConversation._id] && (
          <p className="text-xs text-slate-400">Печатает...</p>
        )}
        <div ref={bottomRef} />
      </div>

      <MessageInput conversationId={activeConversation._id} disabled={!ready} />
    </motion.div>
  );
}
