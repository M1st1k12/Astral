import { motion } from "framer-motion";
import logo from "../assets/astral-logo.svg";

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md p-8 rounded-2xl bg-white border border-slate-200 shadow-xl"
      >
        <div className="flex items-center justify-center mb-6">
          <img src={logo} alt="Astral" className="h-16 w-16 object-contain" />
        </div>
        {children}
      </motion.div>
    </div>
  );
}
