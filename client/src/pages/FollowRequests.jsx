import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getFollowRequests, approveFollow, denyFollow } from "../api/extra";

export default function FollowRequests() {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    getFollowRequests().then(setRequests);
  }, []);

  async function approve(id) {
    await approveFollow(id);
    setRequests((prev) => prev.filter((r) => r._id !== id));
  }

  async function deny(id) {
    await denyFollow(id);
    setRequests((prev) => prev.filter((r) => r._id !== id));
  }

  const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-2xl space-y-4"
    >
      <div className="rounded-2xl p-4 bg-white border border-slate-200 shadow-lg">
        <h2 className="text-lg font-semibold">Запросы на подписку</h2>
        <p className="text-sm text-slate-500">Кому разрешить доступ к вашему профилю</p>
      </div>

      {requests.length === 0 && (
        <div className="rounded-2xl p-4 bg-white border border-slate-200 shadow-lg text-slate-500">
          Нет запросов
        </div>
      )}

      {requests.map((r) => (
        <div key={r._id} className="rounded-2xl p-4 bg-white border border-slate-200 shadow-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-slate-200 overflow-hidden">
              {r.avatar && <img src={baseUrl + r.avatar} alt="avatar" className="h-full w-full object-cover" />}
            </div>
            <div>
              <p className="font-medium">{r.username}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 rounded-xl bg-sky-500 text-white" onClick={() => approve(r._id)}>
              Принять
            </button>
            <button className="px-3 py-1 rounded-xl bg-slate-100" onClick={() => deny(r._id)}>
              Отклонить
            </button>
          </div>
        </div>
      ))}
    </motion.div>
  );
}

