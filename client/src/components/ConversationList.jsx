import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import useAuthStore from "../store/authStore";
import useConversationStore from "../store/conversationStore";
import api from "../api/http";
import { blockUser, deleteConversation } from "../api/extra";

export default function ConversationList() {
  const user = useAuthStore((s) => s.user);
  const conversations = useConversationStore((s) => s.conversations);
  const loadConversations = useConversationStore((s) => s.loadConversations);
  const setActiveConversation = useConversationStore((s) => s.setActiveConversation);
  const createConversation = useConversationStore((s) => s.createConversation);
  const removeConversation = useConversationStore((s) => s.removeConversation);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  async function handleSearch(e) {
    const value = e.target.value;
    setQuery(value);
    if (value.trim().length < 2) return setResults([]);
    const { data } = await api.get(`/users/search?query=${encodeURIComponent(value)}`);
    setResults(data.users.filter((u) => u._id !== user?._id));
  }

  async function startConversation(userId) {
    const convo = await createConversation(userId);
    setResults([]);
    setQuery("");
    setActiveConversation(convo);
  }

  async function handleDeleteConversation(id) {
    await deleteConversation(id);
    removeConversation(id);
  }

  async function handleBlockUser(id) {
    await blockUser(id);
    loadConversations();
  }

  return (
    <motion.aside
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full md:w-80 rounded-2xl border border-slate-200 bg-white p-4 shadow-lg"
    >
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-slate-900 text-white grid place-items-center">💬</div>
        <div>
          <p className="text-sm text-slate-500">Сообщения</p>
          <p className="text-lg font-semibold">Диалоги</p>
        </div>
      </div>

      <div className="mt-4">
        <input
          className="w-full rounded-xl bg-slate-50 border border-slate-200 focus:border-sky-400 focus:ring-0"
          placeholder="Поиск пользователей..."
          value={query}
          onChange={handleSearch}
        />
        {results.length > 0 && (
          <div className="mt-3 space-y-2 max-h-48 overflow-auto">
            {results.map((u) => (
              <button
                key={u._id}
                onClick={() => startConversation(u._id)}
                className="w-full text-left p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200"
              >
                <p className="text-sm font-medium">{u.username}</p>
                <p className="text-xs text-slate-400">@{u.userTag || u.email}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6">
        <p className="text-xs uppercase tracking-widest text-slate-400">Диалоги</p>
        <div className="mt-3 space-y-2">
          {conversations.map((conversation) => {
            const other = conversation.participants.find((p) => p._id !== user?._id);
            return (
              <motion.div
                key={conversation._id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="w-full text-left p-3 rounded-2xl bg-slate-50 hover:bg-white border border-slate-200 transition"
              >
                <button
                  className="w-full text-left"
                  onClick={() => setActiveConversation(conversation)}
                >
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-slate-900">{other?.username || "Unknown"}</p>
                    <span
                      className={`text-xs ${
                        other?.status === "online" ? "text-emerald-600" : "text-slate-400"
                      }`}
                    >
                      {other?.status === "online" ? "в сети" : "офлайн"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 truncate">
                    {conversation.lastMessage?.content || "Нет сообщений"}
                  </p>
                </button>
                <div className="mt-2 flex items-center gap-2">
                  <button
                    className="text-xs px-2 py-1 rounded-lg border border-slate-200"
                    onClick={() => handleDeleteConversation(conversation._id)}
                  >
                    Удалить
                  </button>
                  {other?._id && (
                    <button
                      className="text-xs px-2 py-1 rounded-lg border border-rose-200 text-rose-600"
                      onClick={() => handleBlockUser(other._id)}
                    >
                      Блокировать
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.aside>
  );
}
