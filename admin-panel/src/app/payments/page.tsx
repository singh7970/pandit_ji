"use client";
import { useEffect, useState } from "react";
import { Search, CreditCard, CheckCircle, XCircle, RefreshCw, Landmark } from "lucide-react";
import { PageHeader, Badge, LoadingSpinner, EmptyState, StatCard } from "@/components/ui";
import { endpoints } from "@/lib/api";

interface PaymentRecord {
  id: string;
  booking_id: string;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  razorpay_refund_id: string | null;
  amount: number;
  refund_amount: number | null;
  status: string; // CREATED | PAID | FAILED | REFUNDED | PARTIALLY_REFUNDED
  created_at: string;
}

const STATUS_COLOR: Record<string, string> = {
  CREATED: "yellow",
  PAID: "green",
  FAILED: "red",
  REFUNDED: "blue",
  PARTIALLY_REFUNDED: "orange",
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const load = () => {
    setLoading(true);
    endpoints.paymentsList()
      .then((r) => {
        setPayments(r.data || []);
      })
      .catch((err) => {
        console.error("Failed to load payments:", err);
        setPayments([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = payments.filter(p => {
    const query = search.toLowerCase();
    const idMatch = p.id.toLowerCase().includes(query);
    const bookingMatch = p.booking_id.toLowerCase().includes(query);
    const statusMatch = p.status.toLowerCase().includes(query);
    return !search || idMatch || bookingMatch || statusMatch;
  });

  // Calculate metrics
  const totalVolume = payments
    .filter(p => p.status === "PAID")
    .reduce((sum, p) => sum + p.amount, 0);

  const totalRefunded = payments
    .filter(p => p.status === "REFUNDED")
    .reduce((sum, p) => sum + (p.refund_amount || p.amount), 0);

  const successfulCount = payments.filter(p => p.status === "PAID").length;

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <PageHeader title="Payments" subtitle="Track platform transactions & Razorpay logs" />

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard 
          title="Gross Volume" 
          value={`₹${totalVolume.toLocaleString("en-IN")}`} 
          subtitle="Cleared payments" 
          icon={<Landmark size={20} />} 
          color="saffron" 
        />
        <StatCard 
          title="Refunded Volume" 
          value={`₹${totalRefunded.toLocaleString("en-IN")}`} 
          subtitle="Processed refunds" 
          icon={<RefreshCw size={20} />} 
          color="blue" 
        />
        <StatCard 
          title="Paid Transactions" 
          value={successfulCount} 
          subtitle={`${payments.length} orders total`} 
          icon={<CheckCircle size={20} />} 
          color="green" 
        />
      </div>

      {/* Filter / Search Bar */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-saffron-500 transition-all"
            placeholder="Search transactions by Payment ID or Booking ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState message="No payment transactions found matching your search." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-orange-50/40 border-b border-orange-50/50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Transaction Details</th>
                  <th className="px-6 py-4">Booking ID</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-orange-50/10 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-orange-50 text-saffron-600">
                          <CreditCard size={18} />
                        </div>
                        <div>
                          <p className="font-mono font-medium text-gray-900">{p.id}</p>
                          {p.razorpay_order_id && (
                            <p className="text-xs text-gray-400 font-mono">Order ID: {p.razorpay_order_id}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs text-gray-500">{p.booking_id}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-gray-900">₹{p.amount.toLocaleString("en-IN")}</span>
                      {p.refund_amount && (
                        <p className="text-xs text-blue-500">Refunded: ₹{p.refund_amount.toLocaleString("en-IN")}</p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500">
                      {new Date(p.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <Badge color={STATUS_COLOR[p.status] || "gray"}>{p.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
