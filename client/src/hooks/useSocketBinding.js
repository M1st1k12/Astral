import { useEffect } from "react";
import useConversationStore from "../store/conversationStore";
import useAuthStore from "../store/authStore";
import useNotificationStore from "../store/notificationStore";
import { getSocket } from "../api/socket";

export default function useSocketBinding() {
  const bindSocket = useConversationStore((s) => s.bindSocket);
  const token = useAuthStore((s) => s.token);
  const addNotification = useNotificationStore((s) => s.add);

  useEffect(() => {
    if (!token) return;
    bindSocket();
    const socket = getSocket();
    if (!socket) return;
    const handler = (n) => addNotification(n);
    socket.on("notification:new", handler);
    return () => socket.off("notification:new", handler);
  }, [token, bindSocket, addNotification]);
}
