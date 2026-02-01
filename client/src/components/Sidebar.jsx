import { useEffect } from "react";
import { Link } from "react-router-dom";
import useAuthStore from "../store/authStore";
import useNotificationStore from "../store/notificationStore";
import logo from "../assets/astral-logo.svg";

const baseNav = [
  { to: "/", label: "Лента", icon: "home" },
  { to: "/search", label: "Поиск", icon: "search" },
  { to: "/notifications", label: "Уведомления", icon: "bell" },
  { to: "/messages", label: "Чат", icon: "mail" },
  { to: "/profile", label: "Профиль", icon: "star" },
  { to: "/clan", label: "Клан", icon: "clan" }
];

function Icon({ name }) {
  const cls = "h-5 w-5";
  switch (name) {
    case "home":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M3 11.5 12 4l9 7.5" />
          <path d="M5 10.5V20h14v-9.5" />
        </svg>
      );
    case "search":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
      );
    case "bell":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M6 9a6 6 0 1 1 12 0c0 6 2 6 2 6H4s2 0 2-6" />
          <path d="M9.5 19a2.5 2.5 0 0 0 5 0" />
        </svg>
      );
    case "mail":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="3" y="6" width="18" height="12" rx="2" />
          <path d="m3 7 9 6 9-6" />
        </svg>
      );
    case "star":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="m12 3 2.7 5.7 6.3.8-4.6 4.4 1.2 6.1L12 17l-5.6 3 1.2-6.1-4.6-4.4 6.3-.8z" />
        </svg>
      );
    case "clan":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="6" cy="7" r="2.2" />
          <circle cx="18" cy="6" r="2" />
          <circle cx="12" cy="17" r="2.4" />
          <path d="M7.8 8.4 10.2 14" />
          <path d="M16.2 7.5 13.8 14" />
          <path d="M8.2 7 15.6 6" />
        </svg>
      );
    case "admin":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M12 3 5 6v6c0 5 3.5 8 7 9 3.5-1 7-4 7-9V6z" />
          <path d="M9 12h6" />
          <path d="M12 9v6" />
        </svg>
      );
    default:
      return null;
  }
}

export default function Sidebar({ open = false, onClose }) {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const loadNotifications = useNotificationStore((s) => s.load);
  const notifications = useNotificationStore((s) => s.notifications);
  const unread = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    if (user?._id) loadNotifications();
  }, [user?._id, loadNotifications]);

  const nav = user?.isAdmin ? [...baseNav, { to: "/admin", label: "Админ", icon: "admin" }] : baseNav;

  return (
    <>
      <button
        onClick={onClose}
        className={`fixed inset-0 bg-slate-900/30 z-30 transition-opacity md:hidden ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        aria-label="Close menu"
      />
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 p-4 transition-transform duration-300 md:static md:w-24 md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="rounded-[28px] p-3 h-full flex flex-col items-center gap-6 bg-white border border-slate-200 shadow-lg">
          <div className="w-full flex items-center justify-between md:justify-center">
            <img src={logo} alt="Astral" className="h-12 w-12 object-contain" />
            <button
              onClick={onClose}
              className="md:hidden h-9 w-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600"
              aria-label="Close menu"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 6l12 12" />
                <path d="M18 6l-12 12" />
              </svg>
            </button>
          </div>

          <nav className="flex flex-col items-center gap-4 w-full">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={onClose}
                className="flex md:flex-col items-center gap-3 md:gap-1 text-sm md:text-[10px] text-slate-600 hover:text-slate-900 w-full md:w-auto"
              >
                <span className="relative h-11 w-11 rounded-full border border-slate-200 flex items-center justify-center bg-white text-slate-700">
                  <Icon name={item.icon} />
                  {item.to === "/notifications" && unread > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-sky-500 text-white text-[10px] flex items-center justify-center px-1">
                      {unread}
                    </span>
                  )}
                </span>
                <span className="md:block">{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="mt-auto flex flex-col items-center gap-2 w-full">
            <div className="h-12 w-12 rounded-full bg-slate-200 overflow-hidden">
              {user?.avatar && (
                <img
                  src={(import.meta.env.VITE_API_URL || "http://localhost:5000") + user.avatar}
                  alt="avatar"
                  className="h-full w-full object-cover"
                />
              )}
            </div>
            <button className="text-xs text-slate-500 hover:text-slate-900" onClick={logout}>
              Logout
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
