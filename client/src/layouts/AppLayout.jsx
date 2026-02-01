import { useState } from "react";
import Sidebar from "../components/Sidebar.jsx";
import NotificationToasts from "../components/NotificationToasts.jsx";
import logo from "../assets/astral-logo.svg";

export default function AppLayout({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      <header className="md:hidden sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-slate-200">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => setMenuOpen(true)}
            className="h-10 w-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-700 active:scale-95 transition"
            aria-label="Open menu"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 6h16" />
              <path d="M4 12h16" />
              <path d="M4 18h16" />
            </svg>
          </button>
          <img src={logo} alt="Astral" className="h-8 w-8 object-contain" />
          <div className="w-10" />
        </div>
      </header>

      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />

      <main className="flex-1 p-4 md:p-6 w-full max-w-full md:max-w-3xl md:mx-auto overflow-x-hidden">
        {children}
      </main>
      <NotificationToasts />
    </div>
  );
}
