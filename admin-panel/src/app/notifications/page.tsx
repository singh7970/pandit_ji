"use client";
import { useState } from "react";
import { Send, Users, User } from "lucide-react";
import { PageHeader } from "@/components/ui";
import { endpoints } from "@/lib/api";

export default function NotificationsPage() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [role, setRole] = useState("ALL");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState<{ message: string } | null>(null);

  const send = async () => {
    if (!title || !body) return;
    setSending(true);
    try {
      const r = await endpoints.broadcast(title, body, role);
      setSent(r.data);
      setTitle(""); setBody("");
    } catch { setSent({ message: "Failed to send" }); }
    finally { setSending(false); }
  };

  return (
    <div>
      <PageHeader title="Broadcast Notification" subtitle="Send push notifications to users" />

      <div className="max-w-2xl bg-white rounded-2xl shadow-sm border border-gray-50 p-6 space-y-5">
        {/* Target */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Target Audience</label>
          <div className="flex gap-3">
            {[["ALL","All Users"],["CUSTOMER","Customers"],["PANDIT","Pandits"]].map(([v, l]) => (
              <button key={v} onClick={() => setRole(v)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm border transition-all ${role === v ? "bg-saffron-500 text-white border-saffron-500 shadow-md" : "bg-white text-gray-600 border-gray-100 hover:border-saffron-300"}`}>
                {v === "ALL" ? <Users size={15} /> : <User size={15} />} {l}
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Notification Title</label>
          <input
            value={title} onChange={e => setTitle(e.target.value)}
            placeholder="e.g. Festival Offer — 20% off this Navratri!"
            className="w-full px-4 py-3 text-sm bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-saffron-400"
          />
        </div>

        {/* Body */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Message Body</label>
          <textarea
            value={body} onChange={e => setBody(e.target.value)} rows={4}
            placeholder="Write your notification message here..."
            className="w-full px-4 py-3 text-sm bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-saffron-400 resize-none"
          />
          <p className="text-xs text-gray-400 mt-1">{body.length}/200 characters</p>
        </div>

        {sent && (
          <div className="flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-100 rounded-xl text-sm text-green-700">
            ✅ {sent.message}
          </div>
        )}

        <button
          onClick={send} disabled={sending || !title || !body}
          className="flex items-center gap-2 px-6 py-3 bg-saffron-500 text-white rounded-xl font-medium hover:bg-saffron-600 disabled:opacity-50 transition-colors shadow-md shadow-orange-100"
        >
          <Send size={16} /> {sending ? "Sending…" : "Send Notification"}
        </button>
      </div>
    </div>
  );
}
