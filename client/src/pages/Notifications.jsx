import { useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import useNotificationStore from "../store/notificationStore";
import { resolveMediaUrl } from "../utils/media";

const labels = {
  like: "поставил(а) лайк",
  comment: "оставил(а) комментарий",
  follow: "подписался(лась) на вас",
  follow_request: "запросил(а) подписку",
  follow_approved: "подтвердил(а) подписку",
  repost: "сделал(а) репост",
  message: "написал(а) сообщение"
};

export default function Notifications() {
  const notifications = useNotificationStore((s) => s.notifications);
  const load = useNotificationStore((s) => s.load);
  const markAllRead = useNotificationStore((s) => s.markAllRead);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-2xl space-y-4"
    >
      <div className="rounded-2xl p-4 bg-white border border-slate-200 shadow-lg flex items-center justify-between">
        <h2 className="text-lg font-semibold">Уведомления</h2>
        <button className="text-sm text-sky-600" onClick={markAllRead}>Отметить прочитанным</button>
      </div>

      {notifications.length === 0 && (
        <div className="rounded-2xl p-6 bg-white border border-slate-200 shadow-lg text-slate-500">
          Нет уведомлений
        </div>
      )}

      {notifications.map((n) => {
        const profile = n.from?._id ? `/user/${n.from._id}` : "/profile";
        return (
          <div key={n._id} className="rounded-2xl p-4 bg-white border border-slate-200 shadow-lg flex items-start gap-3">
            <Link to={profile} className="h-11 w-11 rounded-full bg-slate-200 overflow-hidden">
              {n.from?.avatar && (
                <img
                  src={resolveMediaUrl(n.from.avatar)}
                  alt="avatar"
                  className="h-full w-full object-cover"
                />
              )}
            </Link>
            <div className="flex-1">
              <Link to={profile} className="text-sm hover:text-sky-600">
                {n.from?.username || "System"} — {labels[n.type] || n.type}
              </Link>
              <div className="text-xs text-slate-400">
                {n.createdAt ? new Date(n.createdAt).toLocaleString() : ""}
              </div>
              {!n.read && <span className="text-xs text-sky-600">Новое</span>}
            </div>
          </div>
        );
      })}
    </motion.div>
  );
}
