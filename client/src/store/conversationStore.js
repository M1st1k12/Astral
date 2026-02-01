import { create } from "zustand";
import api from "../api/http";
import { getSocket } from "../api/socket";

const useConversationStore = create((set, get) => ({
  conversations: [],
  messages: {},
  activeConversation: null,
  typing: {},

  loadConversations: async () => {
    const { data } = await api.get("/conversations");
    set({ conversations: data.conversations });
  },

  createConversation: async (userId) => {
    const { data } = await api.post("/conversations/create", { userId });
    set((state) => {
      const exists = state.conversations.find((c) => c._id === data.conversation._id);
      return {
        conversations: exists ? state.conversations : [data.conversation, ...state.conversations],
        activeConversation: data.conversation
      };
    });
    getSocket()?.emit("conversation:join", data.conversation._id);
    return data.conversation;
  },

  setActiveConversation: (conversation) => {
    set({ activeConversation: conversation });
    if (conversation?._id) getSocket()?.emit("conversation:join", conversation._id);
  },

  removeConversation: (conversationId) => {
    set((state) => {
      const nextConvos = state.conversations.filter((c) => c._id !== conversationId);
      const { [conversationId]: _, ...rest } = state.messages;
      const active = state.activeConversation?._id === conversationId ? null : state.activeConversation;
      return { conversations: nextConvos, messages: rest, activeConversation: active };
    });
  },

  loadMessages: async (conversationId) => {
    const { data } = await api.get(`/messages/${conversationId}`);
    set((state) => ({
      messages: { ...state.messages, [conversationId]: data.messages }
    }));
  },

  sendMessage: async (payload) => {
    const form = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== undefined && value !== null) form.append(key, value);
    });
    const { data } = await api.post("/messages", form, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    set((state) => {
      const conversationId = data.message.conversation;
      const prev = state.messages[conversationId] || [];
      const exists = prev.some((m) => m._id === data.message._id);
      return {
        messages: {
          ...state.messages,
          [conversationId]: exists ? prev : [...prev, data.message]
        },
        conversations: state.conversations.map((c) =>
          c._id === conversationId ? { ...c, lastMessage: data.message } : c
        )
      };
    });
  },

  emitTyping: (conversationId, isTyping) => {
    getSocket()?.emit("typing", { conversationId, isTyping });
  },

  markSeen: (conversationId, messageIds) => {
    getSocket()?.emit("message:seen", { conversationId, messageIds });
  },

  bindSocket: () => {
    const socket = getSocket();
    if (!socket) return;

    socket.on("message:new", (message) => {
      set((state) => {
        const conversationId = message.conversation;
        const prev = state.messages[conversationId] || [];
        const exists = prev.some((m) => m._id === message._id);
        return {
          messages: {
            ...state.messages,
            [conversationId]: exists ? prev : [...prev, message]
          },
          conversations: state.conversations.map((c) =>
            c._id === conversationId ? { ...c, lastMessage: message } : c
          )
        };
      });
    });

    socket.on("message:edit", (message) => {
      set((state) => {
        const conversationId = message.conversation;
        const prev = state.messages[conversationId] || [];
        return {
          messages: {
            ...state.messages,
            [conversationId]: prev.map((m) => (m._id === message._id ? message : m))
          }
        };
      });
    });

    socket.on("message:delete", ({ id }) => {
      set((state) => {
        if (!state.activeConversation) return {};
        const conversationId = state.activeConversation._id;
        const prev = state.messages[conversationId] || [];
        return {
          messages: {
            ...state.messages,
            [conversationId]: prev.filter((m) => m._id !== id)
          }
        };
      });
    });

    socket.on("message:reaction", ({ id, reactions }) => {
      set((state) => {
        if (!state.activeConversation) return {};
        const conversationId = state.activeConversation._id;
        const prev = state.messages[conversationId] || [];
        return {
          messages: {
            ...state.messages,
            [conversationId]: prev.map((m) => (m._id === id ? { ...m, reactions } : m))
          }
        };
      });
    });

    socket.on("typing", ({ conversationId, userId, isTyping }) => {
      set((state) => ({
        typing: { ...state.typing, [conversationId]: isTyping ? userId : null }
      }));
    });

    socket.on("message:seen", ({ messageIds, conversationId }) => {
      set((state) => {
        const prev = state.messages[conversationId] || [];
        return {
          messages: {
            ...state.messages,
            [conversationId]: prev.map((m) =>
              messageIds.includes(m._id) ? { ...m, seen: true } : m
            )
          }
        };
      });
    });

    socket.on("presence:update", ({ userId, status }) => {
      set((state) => ({
        conversations: state.conversations.map((conversation) => ({
          ...conversation,
          participants: conversation.participants.map((p) =>
            p._id === userId ? { ...p, status } : p
          )
        }))
      }));
    });
  }
}));

export default useConversationStore;
