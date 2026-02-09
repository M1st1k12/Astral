import { useState } from "react";
import { editMessage, deleteMessage } from "../api/extra";

export default function MessageActions({ message }) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(message.content || "");

  async function save() {
    await editMessage(message._id, text);
    setEditing(false);
  }

  async function remove() {
    await deleteMessage(message._id);
  }

  return (
    <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
      {editing ? (
        <>
          <input
            className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button className="text-sky-600" onClick={save}>Save</button>
        </>
      ) : (
        <>
          <button onClick={() => setEditing(true)}>Edit</button>
          <button onClick={remove}>Delete</button>
        </>
      )}
    </div>
  );
}
