import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import useAuthStore from "../store/authStore";
import {
  acceptClanInvite,
  denyClanInvite,
  getClan,
  getClanInvites,
  inviteToClan,
  kickClanMember,
  leaveClan,
  updateClan,
  updateClanRole
} from "../api/extra";
import api from "../api/http";
import { resolveMediaUrl } from "../utils/media";

const fade = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 }
};

function Modal({ open, title, description, confirmText, onClose, onConfirm, danger }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-md rounded-2xl bg-white border border-slate-200 shadow-xl p-5"
      >
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="mt-2 text-sm text-slate-600">{description}</p>
        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            className="px-4 py-2 rounded-xl border border-slate-200 text-sm"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className={`px-4 py-2 rounded-xl text-sm text-white ${
              danger ? "bg-rose-600 hover:bg-rose-700" : "bg-slate-900 hover:bg-black"
            }`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function Clan() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const [name, setName] = useState(user?.clan || "");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [motto, setMotto] = useState("");
  const [announcement, setAnnouncement] = useState("");
  const [saving, setSaving] = useState(false);
  const [kickingId, setKickingId] = useState(null);
  const [modal, setModal] = useState(null);
  const [openRoleId, setOpenRoleId] = useState(null);
  const [inviteName, setInviteName] = useState("");
  const [invites, setInvites] = useState([]);
  const [joinRequests, setJoinRequests] = useState([]);
  const [isPrivate, setIsPrivate] = useState(false);

  useEffect(() => {
    if (user?.clan) loadClan(user.clan);
    loadInvites();
  }, [user?.clan]);

  useEffect(() => {
    setMotto(data?.motto || "");
    setAnnouncement(data?.announcement || "");
    setIsPrivate(!!data?.isPrivate);
    setJoinRequests(data?.joinRequests || []);
  }, [data?.motto, data?.announcement, data?.isPrivate, data?.joinRequests]);

  async function loadClan(value) {
    const clanName = value.trim();
    if (!clanName) return;
    setLoading(true);
    setError("");
    try {
      const res = await getClan(clanName);
      setData(res);
    } catch (err) {
      setError("Failed to load clan");
    } finally {
      setLoading(false);
    }
  }

  async function loadInvites() {
    try {
      const list = await getClanInvites();
      setInvites(list);
    } catch {
      setInvites([]);
    }
  }

  async function saveClanMeta() {
    if (!data?.clan) return;
    setSaving(true);
    try {
      const res = await updateClan(data.clan, { motto, announcement, isPrivate });
      setData((prev) => ({ ...prev, ...res }));
    } finally {
      setSaving(false);
    }
  }

  async function handleKick(memberId) {
    if (!data?.clan) return;
    setKickingId(memberId);
    try {
      await kickClanMember(data.clan, memberId);
      setData((prev) => ({
        ...prev,
        members: prev.members.filter((m) => m._id !== memberId),
        count: Math.max(0, (prev.count || 1) - 1)
      }));
    } finally {
      setKickingId(null);
    }
  }

  async function handleLeave() {
    try {
      await leaveClan();
      setUser?.({ ...user, clan: "", clanRole: "" });
      setData(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to leave clan");
    }
  }

  async function handleRoleChange(memberId, role) {
    if (!data?.clan) return;
    try {
      await updateClanRole(data.clan, memberId, role);
      setData((prev) => ({
        ...prev,
        members: prev.members.map((m) => (m._id === memberId ? { ...m, clanRole: role } : m))
      }));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to change role");
    }
  }

  async function handleInvite() {
    if (!data?.clan || !inviteName.trim()) return;
    try {
      await inviteToClan(data.clan, inviteName.trim());
      setInviteName("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send invite");
    }
  }

  async function handleAcceptInvite(id) {
    const res = await acceptClanInvite(id);
    setUser?.({ ...user, clan: res.clan, clanRole: res.clanRole });
    setInvites((prev) => prev.filter((i) => i._id !== id));
    loadClan(res.clan);
  }

  async function handleDenyInvite(id) {
    await denyClanInvite(id);
    setInvites((prev) => prev.filter((i) => i._id !== id));
  }

  async function handleJoinRequest() {
    if (!name.trim()) return;
    await api.post(`/users/clan/${encodeURIComponent(name.trim())}/request`);
    setError("Request sent");
  }

  async function handleApproveRequest(id) {
    await api.post(`/users/clan/${encodeURIComponent(data.clan)}/requests/${id}/approve`);
    setJoinRequests((prev) => prev.filter((r) => r._id !== id));
    loadClan(data.clan);
  }

  async function handleDenyRequest(id) {
    await api.post(`/users/clan/${encodeURIComponent(data.clan)}/requests/${id}/deny`);
    setJoinRequests((prev) => prev.filter((r) => r._id !== id));
  }

  const members = data?.members || [];
  const isConstellation = !!data?.isConstellation;
  const progress = Math.min(100, Math.round(((data?.count || 0) / 5) * 100));
  const starCount = Math.min(24, data?.count || 0);
  const leader = data?.leader || members[0] || null;
  const showHeader = !!data || !!user?.clan;

  const stars = Array.from({ length: starCount }, (_, i) => {
    const angle = (i / starCount) * Math.PI * 2;
    const radius = 28 + (i % 5) * 3;
    const top = 50 + Math.sin(angle) * radius;
    const left = 50 + Math.cos(angle) * radius;
    const size = 8 + ((i * 3) % 4);
    const opacity = 0.55 + ((i * 7) % 5) / 10;
    return { top, left, size, opacity };
  });

  return (
    <motion.div {...fade} className="max-w-4xl space-y-4">
      {invites.length > 0 && (
        <motion.div {...fade} className="rounded-2xl border border-slate-200 bg-white shadow-lg p-4">
          <h3 className="text-lg font-semibold">Clan invites</h3>
          <div className="mt-3 space-y-2">
            {invites.map((i) => (
              <div key={i._id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                <div className="text-sm text-slate-700">
                  {i.clan}
                  <span className="text-xs text-slate-500 ml-2">from {i.from?.username || "member"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button className="text-xs px-3 py-1 rounded-lg bg-slate-900 text-white" onClick={() => handleAcceptInvite(i._id)}>
                    Accept
                  </button>
                  <button className="text-xs px-3 py-1 rounded-lg border border-slate-200" onClick={() => handleDenyInvite(i._id)}>
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {showHeader && (
        <motion.div {...fade} className="rounded-2xl border border-slate-200 bg-white shadow-lg overflow-hidden">
          <div className="relative h-44 overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.18)_0,transparent_40%),radial-gradient(circle_at_80%_30%,rgba(167,139,250,0.2)_0,transparent_45%)]" />
            <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.2)_0,transparent_55%)]" />

            {stars.map((s, idx) => (
              <span
                key={idx}
                className="absolute -translate-x-1/2 -translate-y-1/2 twinkle"
                style={{
                  top: `${s.top}%`,
                  left: `${s.left}%`,
                  width: s.size + 6,
                  height: s.size + 6,
                  opacity: s.opacity,
                  animationDelay: `${(idx % 7) * 0.3}s`,
                  animationDuration: `${2.6 + (idx % 5) * 0.4}s`
                }}
              >
                <svg viewBox="0 0 24 24" className="h-full w-full text-white drop-shadow-[0_0_6px_rgba(255,255,255,0.6)]">
                  <path
                    fill="currentColor"
                    d="M12 2.5l2.3 4.9 5.4.7-3.9 3.8.9 5.3L12 15.8l-4.7 2.4.9-5.3-3.9-3.8 5.4-.7L12 2.5z"
                  />
                </svg>
              </span>
            ))}

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                <div className="h-20 w-20 rounded-full bg-slate-200 shadow-[0_0_50px_rgba(226,232,240,0.7)] overflow-hidden border border-white/40">
                  {leader?.avatar ? (
                    <img
                      src={resolveMediaUrl(leader.avatar)}
                      alt="leader"
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                </div>
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-slate-200/90">
                  Leader
                </div>
              </div>
            </div>

            <div className="absolute bottom-4 left-6">
              <div className="text-xs uppercase tracking-[0.25em] text-slate-300">Astral Clan</div>
              <div className="text-2xl font-semibold text-white">
                {data?.clan || name || "Clan"}
              </div>
              <div className="mt-2 text-sm text-slate-300">
                {isConstellation ? "Constellation complete ✨" : "Building the constellation"}
              </div>
              {data?.motto && (
                <div className="mt-2 text-xs text-slate-200/90">{data.motto}</div>
              )}
            </div>
            <div className="absolute bottom-4 right-6 text-right">
              <div className="text-xs text-slate-300">Stars in the clan</div>
              <div className="text-2xl font-semibold text-white">{data?.count || 0}</div>
            </div>
          </div>
          <div className="p-6">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex-1">
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-sky-500" style={{ width: `${progress}%` }} />
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  {isConstellation
                    ? "Constellation activated — the clan shines"
                    : `Need ${data?.needed || 0} more stars for the constellation`}
                </p>
              </div>
              <div className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-600">
                A star is a user
              </div>
            </div>
          </div>
        </motion.div>
      )}

      <motion.div {...fade} className="rounded-2xl border border-slate-200 bg-white shadow-lg p-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h3 className="text-lg font-semibold">Clan members</h3>
          <div className="flex items-center gap-2 flex-wrap">
            {user?.clan && (
              <button
                className="px-3 py-2 rounded-xl border border-rose-200 text-rose-600 text-sm hover:bg-rose-50"
                onClick={() => setModal({ type: "leave" })}
              >
                Leave
              </button>
            )}
            {(data?.isLeader || user?.clanRole === "officer") && (
              <div className="flex items-center gap-2">
                <input
                  className="w-40 rounded-xl bg-slate-50 border border-slate-200 focus:border-sky-400 focus:ring-0 text-sm"
                  placeholder="Username to invite"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value.toLowerCase())}
                />
                <button
                  className="px-3 py-2 rounded-xl bg-slate-900 text-white text-sm hover:bg-black transition"
                  onClick={handleInvite}
                >
                  Invite
                </button>
              </div>
            )}
            {!user?.clan && (
              <button
                className="px-3 py-2 rounded-xl bg-slate-900 text-white text-sm hover:bg-black transition"
                onClick={handleJoinRequest}
              >
                Apply to join
              </button>
            )}
            <input
              className="w-48 rounded-xl bg-slate-50 border border-slate-200 focus:border-sky-400 focus:ring-0 text-sm"
              placeholder="Clan name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <button
              className="px-3 py-2 rounded-xl bg-slate-900 text-white text-sm hover:bg-black transition"
              onClick={() => loadClan(name)}
            >
              Open
            </button>
          </div>
        </div>

        {!user?.clan && !data && (
          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            You don't have a clan yet. Set it in your profile or find a clan by name.
            <Link to="/profile" className="ml-2 text-sky-600 hover:text-sky-700">
              Go to profile
            </Link>
          </div>
        )}

        {loading && <div className="mt-4 text-sm text-slate-500">Loading...</div>}
        {error && <div className="mt-4 text-sm text-rose-500">{error}</div>}

        {data?.announcement && (
          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            {data.announcement}
          </div>
        )}

        {joinRequests.length > 0 && (
          <div className="mt-4 rounded-xl border border-slate-200 bg-white p-3">
            <p className="text-sm font-semibold">Clan requests</p>
            <div className="mt-2 space-y-2">
              {joinRequests.map((r) => (
                <div key={r._id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                  <div className="text-sm text-slate-700">@{r.user?.userTag || r.user?.username}</div>
                  <div className="flex items-center gap-2">
                    <button className="text-xs px-3 py-1 rounded-lg bg-slate-900 text-white" onClick={() => handleApproveRequest(r._id)}>
                      Accept
                    </button>
                    <button className="text-xs px-3 py-1 rounded-lg border border-slate-200" onClick={() => handleDenyRequest(r._id)}>
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && members.length > 0 && (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {members.map((m, idx) => {
              const isLeader = data?.leader?._id === m._id;
              const roleStars = isLeader ? 3 : m.clanRole === "officer" ? 2 : 1;
              const roleTitle = isLeader
                ? "North Star"
                : m.clanRole === "officer"
                  ? "Double Star"
                  : "Small Star";
              return (
                <motion.div
                  key={m._id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(idx * 0.03, 0.3), duration: 0.25 }}
                  whileHover={{ y: -2 }}
                  className="group flex flex-col sm:flex-row sm:items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm hover:shadow-md transition"
                >
                  <Link
                    to={`/user/${m._id}`}
                    className="flex items-center gap-3 flex-1 min-w-0"
                  >
                    <div className="h-12 w-12 rounded-full bg-slate-200 overflow-hidden ring-1 ring-slate-200">
                      {m.avatar ? (
                        <img
                          src={resolveMediaUrl(m.avatar)}
                          alt={m.username}
                          className="h-full w-full object-cover"
                        />
                      ) : null}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-slate-900 truncate">{m.username}</div>
                      <div className="text-xs text-slate-500">@{m.userTag || m.username}</div>
                      <div className="text-xs text-slate-500">
                        Followers: {m.followers?.length || 0}
                      </div>
                    </div>
                  </Link>
                  <div className="flex flex-wrap items-center gap-2 justify-end">
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 px-2 py-1 text-xs">
                      <span className="tracking-tight">
                        {Array.from({ length: roleStars }).map((_, i) => (
                          <span key={i}>★</span>
                        ))}
                      </span>
                      <span className="text-amber-700/80">{roleTitle}</span>
                    </span>
                    {data?.isLeader && !isLeader && m._id !== user?._id && (
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setOpenRoleId(openRoleId === m._id ? null : m._id)}
                            className="text-xs rounded-lg border border-slate-200 bg-white px-2 py-1 w-[160px] flex items-center justify-between hover:border-slate-300"
                          >
                            <span>{roleTitle}</span>
                            <svg className="h-3 w-3 text-slate-500" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.06l3.71-3.83a.75.75 0 1 1 1.08 1.04l-4.24 4.38a.75.75 0 0 1-1.08 0L5.21 8.27a.75.75 0 0 1 .02-1.06z" clipRule="evenodd" />
                            </svg>
                          </button>
                          <AnimatePresence>
                            {openRoleId === m._id && (
                              <motion.div
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 6 }}
                                className="absolute right-0 mt-2 w-[180px] rounded-xl border border-slate-200 bg-white shadow-lg p-1 z-20"
                              >
                                {[
                                  { value: "member", label: "Small Star" },
                                  { value: "officer", label: "Double Star" }
                                ].map((role) => (
                                  <button
                                    key={role.value}
                                    type="button"
                                    onClick={() => {
                                      handleRoleChange(m._id, role.value);
                                      setOpenRoleId(null);
                                    }}
                                    className={`w-full text-left text-xs px-3 py-2 rounded-lg hover:bg-slate-50 ${
                                      (m.clanRole || "member") === role.value ? "bg-slate-100 text-slate-900" : "text-slate-700"
                                    }`}
                                  >
                                    {role.label}
                                  </button>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                        <button
                          onClick={() => setModal({ type: "kick", member: m })}
                          disabled={kickingId === m._id}
                          className="text-xs px-2 py-1 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50"
                        >
                          {kickingId === m._id ? "..." : "Kick"}
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {!loading && members.length === 0 && data && (
          <div className="mt-4 text-sm text-slate-500">No stars in the clan yet.</div>
        )}
      </motion.div>

      {data?.isLeader && (
        <motion.div {...fade} className="rounded-2xl border border-slate-200 bg-white shadow-lg p-4">
          <h3 className="text-lg font-semibold">Clan management</h3>
          <p className="text-sm text-slate-500">Visible to all members.</p>
          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-3">
              <label className="text-xs text-slate-500">Private clan</label>
              <input
                type="checkbox"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
              />
            </div>
            <div>
              <label className="text-xs text-slate-500">Motto</label>
              <input
                className="w-full rounded-xl bg-slate-50 border border-slate-200 focus:border-sky-400 focus:ring-0"
                value={motto}
                onChange={(e) => setMotto(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-slate-500">Announcement</label>
              <textarea
                className="w-full rounded-xl bg-slate-50 border border-slate-200 focus:border-sky-400 focus:ring-0"
                rows={3}
                value={announcement}
                onChange={(e) => setAnnouncement(e.target.value)}
              />
            </div>
            <button
              onClick={saveClanMeta}
              disabled={saving}
              className="px-4 py-2 rounded-xl bg-slate-900 text-white text-sm hover:bg-black transition"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </motion.div>
      )}

      <AnimatePresence>
        {modal?.type === "kick" && (
          <Modal
            open
            title="Kick member"
            description={`Are you sure you want to remove ${modal.member?.username}?`}
            confirmText="Kick"
            danger
            onClose={() => setModal(null)}
            onConfirm={() => {
              handleKick(modal.member._id);
              setModal(null);
            }}
          />
        )}
        {modal?.type === "leave" && (
          <Modal
            open
            title="Leave clan"
            description="Are you sure you want to leave the clan?"
            confirmText="Leave"
            danger
            onClose={() => setModal(null)}
            onConfirm={() => {
              handleLeave();
              setModal(null);
            }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

