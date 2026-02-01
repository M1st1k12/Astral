import { motion } from "framer-motion";
import ConversationList from "../components/ConversationList.jsx";
import MessageThread from "../components/MessageThread.jsx";

export default function Messages() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-2rem)] md:h-[calc(100vh-3rem)]"
    >
      <ConversationList />
      <MessageThread />
    </motion.div>
  );
}
