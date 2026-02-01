import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";

export default function Register() {
  const [form, setForm] = useState({ username: "", userTag: "", email: "", password: "" });
  const register = useAuthStore((s) => s.register);
  const error = useAuthStore((s) => s.error);
  const loading = useAuthStore((s) => s.loading);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ok = await register(form);
    if (ok) navigate("/");
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold">Создать Astral ID</h1>
      <p className="text-slate-500 text-sm">Присоединяйся к созвездию.</p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <input
          type="text"
          className="w-full rounded-xl bg-slate-50 border border-slate-200 focus:border-sky-400 focus:ring-0"
          placeholder="Юзернейм (без @)"
          value={form.userTag}
          onChange={(e) => setForm({ ...form, userTag: e.target.value.toLowerCase() })}
        />
        <input
          type="text"
          className="w-full rounded-xl bg-slate-50 border border-slate-200 focus:border-sky-400 focus:ring-0"
          placeholder="Имя"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
        />
        <input
          type="email"
          className="w-full rounded-xl bg-slate-50 border border-slate-200 focus:border-sky-400 focus:ring-0"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          type="password"
          className="w-full rounded-xl bg-slate-50 border border-slate-200 focus:border-sky-400 focus:ring-0"
          placeholder="Пароль"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button
          disabled={loading}
          className="w-full py-2 rounded-xl bg-sky-500 text-white font-semibold"
          type="submit"
        >
          {loading ? "Загрузка..." : "Создать"}
        </button>
      </form>
      <p className="text-sm text-slate-500 mt-4">
        Уже есть аккаунт? <Link className="text-sky-600" to="/login">Войти</Link>
      </p>
    </div>
  );
}
