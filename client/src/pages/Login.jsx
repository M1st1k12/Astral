import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const login = useAuthStore((s) => s.login);
  const error = useAuthStore((s) => s.error);
  const loading = useAuthStore((s) => s.loading);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ok = await login(form);
    if (ok) navigate("/");
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold">Sign in to Astral</h1>
      <p className="text-slate-500 text-sm">Welcome back.</p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button
          disabled={loading}
          className="w-full py-2 rounded-xl bg-sky-500 text-white font-semibold"
          type="submit"
        >
          {loading ? "Loading..." : "Sign in"}
        </button>
      </form>
      <p className="text-sm text-slate-500 mt-4">
        Don't have an account? <Link className="text-sky-600" to="/register">Create</Link>
      </p>
    </div>
  );
}

