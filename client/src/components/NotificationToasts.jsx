import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import useNotificationStore from "../store/notificationStore";
import { resolveMediaUrl } from "../utils/media";

function getText(n) {
  const from = n?.from?.username || "Someone";
  switch (n.type) {
    case "like":
      return `${from} liked your post`;
    case "comment":
      return `${from} commented on your post`;
    case "follow":
      return `${from} followed you`;
    case "follow_request":
      return `${from} requested to follow you`;
    case "follow_approved":
      return `${from} approved your request`;
    case "repost":
      return `${from} reposted your post`;
    case "message":
      return `${from} sent you a message`;
    default:
      return "New notification";
  }
}

export default function NotificationToasts() {
  const notifications = useNotificationStore((s) => s.notifications);
  const [toasts, setToasts] = useState([]);
  const seenRef = useRef(new Set());
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      notifications.forEach((n) => n?._id && seenRef.current.add(n._id));
      initialized.current = true;
      return;
    }

    const fresh = notifications.filter((n) => n?._id && !seenRef.current.has(n._id));
    if (fresh.length === 0) return;

    fresh.forEach((n) => {
      seenRef.current.add(n._id);
      const toast = {
        id: n._id,
        text: getText(n),
        avatar: n?.from?.avatar || "",
        createdAt: n?.createdAt,
        userId: n?.from?._id
      };
      setToasts((prev) => [toast, ...prev].slice(0, 5));
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== n._id));
      }, 4500);
    });
  }, [notifications]);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="w-72 rounded-2xl border border-slate-200 bg-white shadow-lg p-3 flex items-center gap-3"
          >
            <Link
              to={t.userId ? `/user/${t.userId}` : "/profile"}
              className="h-10 w-10 rounded-full bg-slate-200 overflow-hidden"
            >
              {t.avatar && (
                <img
                  src={resolveMediaUrl(t.avatar)}
                  alt="avatar"
                  className="h-full w-full object-cover"
                />
              )}
            </Link>
            <div className="flex-1 min-w-0">
              <Link
                to={t.userId ? `/user/${t.userId}` : "/profile"}
                className="text-sm text-slate-900 hover:text-sky-600"
              >
                {t.text}
              </Link>
              <div className="text-xs text-slate-400">
                {t.createdAt ? new Date(t.createdAt).toLocaleTimeString() : ""}
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
