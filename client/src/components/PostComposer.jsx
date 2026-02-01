import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import api from "../api/http";

export default function PostComposer({ onCreated }) {
  const [content, setContent] = useState("");
  const [media, setMedia] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef(null);
  const canvasRef = useRef(null);
  const [showDraw, setShowDraw] = useState(false);
  const [drawing, setDrawing] = useState(false);
  const [stroke, setStroke] = useState("#0f172a");
  const [lineWidth, setLineWidth] = useState(4);

  const quickEmojis = ["😀", "🔥", "💫", "💙", "🚀"];

  useEffect(() => {
    if (!showDraw || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, [showDraw]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!content.trim() && !media) return;
    setLoading(true);
    const form = new FormData();
    form.append("content", content);
    if (media) form.append("media", media);

    const { data } = await api.post("/posts", form, {
      headers: { "Content-Type": "multipart/form-data" }
    });

    setContent("");
    setMedia(null);
    onCreated?.(data.post);
    setLoading(false);
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      onSubmit={handleSubmit}
      className="rounded-2xl p-4 bg-white border border-slate-200 shadow-lg transition-shadow hover:shadow-xl"
    >
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-full bg-slate-200" />
        <textarea
          className="w-full rounded-2xl bg-slate-50 border border-slate-200 focus:border-sky-400 focus:ring-0 min-h-[90px] p-3"
          placeholder="Что нового?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </div>
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-500">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="h-9 w-9 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 transition flex items-center justify-center"
            title="Прикрепить файл"
          >
            📎
          </button>
          <button
            type="button"
            onClick={() => setShowDraw(true)}
            className="h-9 w-9 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 transition flex items-center justify-center"
            title="Открыть рисование"
          >
            🎨
          </button>

          <label className="px-2 py-1 rounded-md bg-slate-100 border border-slate-200 text-sm cursor-pointer hover:bg-slate-200 transition transform hover:-translate-y-0.5 active:translate-y-0">
            Выбрать файл
            <input
              ref={fileRef}
              type="file"
              className="hidden"
              onChange={(e) => setMedia(e.target.files?.[0] || null)}
            />
          </label>
          <span className="text-sm text-slate-500">{media?.name || "Файл не выбран"}</span>
        </div>
        <div className="hidden md:flex items-center gap-1 text-slate-500">
          {quickEmojis.map((e) => (
            <button
              key={e}
              type="button"
              className="h-8 w-8 rounded-full hover:bg-slate-100 transition"
              onClick={() => setContent((prev) => `${prev} ${e}`)}
              title="Добавить эмодзи"
            >
              {e}
            </button>
          ))}
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 rounded-full bg-sky-400 text-white font-semibold hover:bg-sky-500 transition transform hover:-translate-y-0.5 active:translate-y-0"
        >
          {loading ? "Публикую..." : "Опубликовать"}
        </button>
      </div>

      {showDraw && (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-3">
          <div className="flex items-center gap-2 mb-2">
            <label className="text-xs text-slate-500">Цвет</label>
            <input type="color" value={stroke} onChange={(e) => setStroke(e.target.value)} />
            <label className="text-xs text-slate-500 ml-2">Толщина</label>
            <input
              type="range"
              min="1"
              max="10"
              value={lineWidth}
              onChange={(e) => setLineWidth(Number(e.target.value))}
            />
            <button
              type="button"
              className="ml-auto px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 transition"
              onClick={() => {
                const canvas = canvasRef.current;
                const ctx = canvas.getContext("2d");
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = "#ffffff";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
              }}
            >
              Очистить
            </button>
            <button
              type="button"
              className="px-3 py-1 rounded-lg bg-sky-500 text-white hover:bg-sky-600 transition"
              onClick={() => {
                const canvas = canvasRef.current;
                canvas.toBlob((blob) => {
                  if (!blob) return;
                  const file = new File([blob], "drawing.png", { type: "image/png" });
                  setMedia(file);
                  setShowDraw(false);
                }, "image/png");
              }}
            >
              Добавить
            </button>
          </div>
          <canvas
            ref={canvasRef}
            width={640}
            height={280}
            className="w-full rounded-xl border border-slate-200 bg-white"
            onMouseDown={(e) => {
              setDrawing(true);
              const rect = e.currentTarget.getBoundingClientRect();
              const ctx = e.currentTarget.getContext("2d");
              ctx.beginPath();
              ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
            }}
            onMouseMove={(e) => {
              if (!drawing) return;
              const rect = e.currentTarget.getBoundingClientRect();
              const ctx = e.currentTarget.getContext("2d");
              ctx.strokeStyle = stroke;
              ctx.lineWidth = lineWidth;
              ctx.lineCap = "round";
              ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
              ctx.stroke();
            }}
            onMouseUp={() => setDrawing(false)}
            onMouseLeave={() => setDrawing(false)}
            onTouchStart={(e) => {
              e.preventDefault();
              setDrawing(true);
              const touch = e.touches[0];
              const rect = e.currentTarget.getBoundingClientRect();
              const ctx = e.currentTarget.getContext("2d");
              ctx.beginPath();
              ctx.moveTo(touch.clientX - rect.left, touch.clientY - rect.top);
            }}
            onTouchMove={(e) => {
              e.preventDefault();
              if (!drawing) return;
              const touch = e.touches[0];
              const rect = e.currentTarget.getBoundingClientRect();
              const ctx = e.currentTarget.getContext("2d");
              ctx.strokeStyle = stroke;
              ctx.lineWidth = lineWidth;
              ctx.lineCap = "round";
              ctx.lineTo(touch.clientX - rect.left, touch.clientY - rect.top);
              ctx.stroke();
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              setDrawing(false);
            }}
          />
        </div>
      )}
    </motion.form>
  );
}
