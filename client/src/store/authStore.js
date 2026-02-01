import { create } from "zustand";
import api from "../api/http";
import { connectSocket, disconnectSocket } from "../api/socket";

const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem("astral_token"),
  loading: false,
  initialized: false,
  error: null,

  setError: (error) => set({ error }),
  setUser: (user) => set({ user }),

  register: async (payload) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.post("/auth/register", payload);
      localStorage.setItem("astral_token", data.token);
      connectSocket(data.token);
      set({ user: data.user, token: data.token, loading: false, initialized: true });
      return true;
    } catch (err) {
      set({ error: err.response?.data?.message || "Register failed", loading: false });
      return false;
    }
  },

  login: async (payload) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.post("/auth/login", payload);
      localStorage.setItem("astral_token", data.token);
      connectSocket(data.token);
      set({ user: data.user, token: data.token, loading: false, initialized: true });
      return true;
    } catch (err) {
      set({ error: err.response?.data?.message || "Login failed", loading: false });
      return false;
    }
  },

  loadUser: async () => {
    const token = localStorage.getItem("astral_token");
    if (!token) {
      set({ initialized: true });
      return;
    }
    set({ loading: true });
    try {
      const { data } = await api.get("/auth/me");
      connectSocket(token);
      set({ user: data.user, token, loading: false, initialized: true });
    } catch (err) {
      localStorage.removeItem("astral_token");
      disconnectSocket();
      set({ user: null, token: null, loading: false, initialized: true });
    }
  },

  logout: () => {
    localStorage.removeItem("astral_token");
    disconnectSocket();
    set({ user: null, token: null, initialized: true });
  }
}));

export default useAuthStore;
