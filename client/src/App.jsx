import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import useAuthStore from "./store/authStore";
import useSocketBinding from "./hooks/useSocketBinding";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Feed from "./pages/Feed.jsx";
import Messages from "./pages/Messages.jsx";
import Profile from "./pages/Profile.jsx";
import UserProfile from "./pages/UserProfile.jsx";
import Search from "./pages/Search.jsx";
import Notifications from "./pages/Notifications.jsx";
import Bookmarks from "./pages/Bookmarks.jsx";
import Hidden from "./pages/Hidden.jsx";
import FollowRequests from "./pages/FollowRequests.jsx";
import Clan from "./pages/Clan.jsx";
import Admin from "./pages/Admin.jsx";
import AuthLayout from "./layouts/AuthLayout.jsx";
import AppLayout from "./layouts/AppLayout.jsx";

function ProtectedRoute({ children }) {
  const user = useAuthStore((s) => s.user);
  const initialized = useAuthStore((s) => s.initialized);
  if (!initialized) return null;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  const loadUser = useAuthStore((s) => s.loadUser);
  useEffect(() => {
    loadUser();
  }, [loadUser]);

  useSocketBinding();

  return (
    <Routes>
      <Route
        path="/login"
        element={
          <AuthLayout>
            <Login />
          </AuthLayout>
        }
      />
      <Route
        path="/register"
        element={
          <AuthLayout>
            <Register />
          </AuthLayout>
        }
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Feed />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/messages"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Messages />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/search"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Search />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Notifications />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/bookmarks"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Bookmarks />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/hidden"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Hidden />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/follow-requests"
        element={
          <ProtectedRoute>
            <AppLayout>
              <FollowRequests />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Profile />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/clan"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Clan />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Admin />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/user/:id"
        element={
          <ProtectedRoute>
            <AppLayout>
              <UserProfile />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
