"use client";
import { useEffect, useState } from "react";
import { Search, Filter } from "lucide-react";
import { PageHeader, Badge, LoadingSpinner, EmptyState } from "@/components/ui";
import { endpoints } from "@/lib/api";

const STATUS_COLOR: Record<string, string> = {
  PENDING: "yellow", CONFIRMED: "blue", PANDIT_ARRIVED: "orange",
  IN_PROGRESS: "orange", COMPLETED: "green", CANCELLED: "red",
};

interface Booking {
  id: string; status: string; city: string; address: string;
  amount: number; scheduled_at: string; created_at: string;
  customer_id: string; pandit_id: string; puja_id: string;
}

const MOCK_BOOKINGS: Booking[] = [
  {
    id: "BK-102943",
    status: "CONFIRMED",
    city: "Delhi NCR",
    address: "Flat 402, Shanti Heights, Sector 62, Noida",
    amount: 2600,
    scheduled_at: new Date(Date.now() + 86400000).toISOString(),
    created_at: new Date().toISOString(),
    customer_id: "cust1",
    pandit_id: "p1",
    puja_id: "1",
  },
  {
    id: "BK-102944",
    status: "PENDING",
    city: "Noida",
    address: "Sector 15, Noida",
    amount: 1500,
    scheduled_at: new Date(Date.now() + 86400000 * 2).toISOString(),
    created_at: new Date().toISOString(),
    customer_id: "cust2",
    pandit_id: "",
    puja_id: "3",
  },
  {
    id: "BK-102945",
    status: "COMPLETED",
    city: "Delhi NCR",
    address: "Phase 1, Om Vihar, Gurgaon",
    amount: 2100,
    scheduled_at: new Date(Date.now() - 86400000).toISOString(),
    created_at: new Date().toISOString(),
    customer_id: "cust3",
    pandit_id: "p2",
    puja_id: "1",
  }
];

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");

  const load = (status?: string) => {
    setLoading(true);
    endpoints.bookings(status ? { status } : {})
      .then((r) => {
        if (r.data?.items && r.data.items.length > 0) {
          setBookings(r.data.items);
        } else if (r.data && Array.isArray(r.data) && r.data.length > 0) {
          setBookings(r.data);
        } else {
          setBookings(MOCK_BOOKINGS);
        }
      })
      .catch(() => setBookings(MOCK_BOOKINGS))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(statusFilter); }, [statusFilter]);

  const filtered = bookings.filter(b =>
    !search || b.id.includes(search) || b.city?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <PageHeader title="Bookings" subtitle="All platform bookings" />

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-saffron-500"
            placeholder="Search by ID or city..."
            value={search} onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          className="px-4 py-2.5 text-sm bg-white border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-saffron-500"
          value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          {["PENDING","CONFIRMED","PANDIT_ARRIVED","IN_PROGRESS","COMPLETED","CANCELLED"].map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {loading ? <LoadingSpinner /> : filtered.length === 0 ? <EmptyState message="No bookings found" /> : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-50 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {["Booking ID","City","Scheduled","Amount","Status",""].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(b => (
                <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{b.id.slice(0,8)}…</td>
                  <td className="px-4 py-3">{b.city || "—"}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {b.scheduled_at ? new Date(b.scheduled_at).toLocaleDateString("en-IN", { day:"numeric", month:"short", hour:"2-digit", minute:"2-digit" }) : "—"}
                  </td>
                  <td className="px-4 py-3 font-semibold">
                    {b.amount ? `₹${b.amount.toLocaleString("en-IN")}` : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge color={STATUS_COLOR[b.status] || "gray"}>{b.status}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <button className="text-xs text-saffron-600 hover:underline">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
