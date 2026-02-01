import { create } from "zustand";
import { fetchNotifications, markNotificationsRead } from "../api/extra";

const useNotificationStore = create((set) => ({
  notifications: [],
  load: async () => {
    const notifications = await fetchNotifications();
    set({ notifications });
  },
  add: (notification) => set((state) => ({ notifications: [notification, ...state.notifications] })),
  markAllRead: async () => {
    await markNotificationsRead();
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true }))
    }));
  }
}));

export default useNotificationStore;
