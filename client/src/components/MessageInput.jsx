import { useState } from "react";
import useConversationStore from "../store/conversationStore";
import { AnimatePresence, motion } from "framer-motion";

const EMOJIS = ["😀", "😂", "😍", "🔥", "👍", "🙏", "✨", "💫", "😎", "🤍"];

export default function MessageInput({ conversationId, disabled }) {
  const sendMessage = useConversationStore((s) => s.sendMessage);
  const emitTyping = useConversationStore((s) => s.emitTyping);
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [showEmoji, setShowEmoji] = useState(false);

  async function handleSend(e) {
    e.preventDefault();
    if (!text.trim() && !file) return;
    await sendMessage({ conversationId, content: text, file });
    setText("");
    setFile(null);
    setShowEmoji(false);
    emitTyping(conversationId, false);
  }

  function handleTyping(e) {
    setText(e.target.value);
    emitTyping(conversationId, e.target.value.length > 0);
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      onSubmit={handleSend}
      className="mt-4 flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm"
    >
      <input
        className="flex-1 min-w-[200px] rounded-xl bg-slate-50 border border-slate-200 focus:border-sky-400 focus:ring-0"
        placeholder="Написать сообщение..."
        value={text}
        onChange={handleTyping}
        disabled={disabled}
      />
      <div className="relative">
        <button
          type="button"
          className="px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs hover:bg-slate-200"
          onClick={() => setShowEmoji((v) => !v)}
        >
          😊
        </button>
        <AnimatePresence>
          {showEmoji && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-12 right-0 w-48 rounded-xl border border-slate-200 bg-white shadow-lg p-2 grid grid-cols-5 gap-2 z-20"
            >
              {EMOJIS.map((e) => (
                <motion.button
                  key={e}
                  type="button"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="h-8 w-8 rounded-lg hover:bg-slate-100"
                  onClick={() => setText((prev) => `${prev} ${e}`)}
                >
                  {e}
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <input
        type="file"
        className="hidden"
        id="fileUpload"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />
      <label
        htmlFor="fileUpload"
        className="cursor-pointer px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs hover:bg-slate-200"
      >
        {file ? "Файл" : "Прикрепить"}
      </label>
      <button
        type="submit"
        disabled={disabled}
        className="px-4 py-2 rounded-xl bg-slate-900 text-white font-semibold hover:bg-black"
      >
        Отправить
      </button>
    </motion.form>
  );
}
