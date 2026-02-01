import { useEffect } from "react";
import { motion } from "framer-motion";
import useNotificationStore from "../store/notificationStore";

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

      {notifications.map((n) => (
        <div key={n._id} className="rounded-2xl p-4 bg-white border border-slate-200 shadow-lg">
          <p className="text-sm">
            {n.from?.username || "System"} — {labels[n.type] || n.type}
          </p>
          {!n.read && <span className="text-xs text-sky-600">Новое</span>}
        </div>
      ))}
    </motion.div>
  );
}

