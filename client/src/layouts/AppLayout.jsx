import Sidebar from "../components/Sidebar.jsx";
import NotificationToasts from "../components/NotificationToasts.jsx";

export default function AppLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <Sidebar />
      <main className="flex-1 p-4 md:p-6 max-w-3xl mx-auto w-full">
        {children}
      </main>
      <NotificationToasts />
    </div>
  );
}
