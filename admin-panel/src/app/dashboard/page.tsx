"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { IndianRupee, Users, CalendarCheck, Star, TrendingUp, Clock } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { StatCard, PageHeader, LoadingSpinner } from "@/components/ui";
import { endpoints } from "@/lib/api";

const MOCK_TREND = [
  { month: "Jan", gmv: 42000 }, { month: "Feb", gmv: 67000 },
  { month: "Mar", gmv: 55000 }, { month: "Apr", gmv: 89000 },
  { month: "May", gmv: 112000 }, { month: "Jun", gmv: 134000 },
];

const PUJA_MIX = [
  { name: "Satyanarayan Puja", value: 35 },
  { name: "Griha Pravesh", value: 25 },
  { name: "Ganesh Puja", value: 20 },
  { name: "Others", value: 20 },
];

const COLORS = ["#FF9933", "#8B0000", "#22C55E", "#6366F1"];

interface Analytics {
  gmv: number; revenue: number; total_bookings: number;
  completed_bookings: number; total_customers: number;
  active_pandits: number; pending_pandits: number; completion_rate: number;
  avg_rating: number;
  gmv_trend: { month: string; gmv: number }[];
  puja_mix: { name: string; value: number }[];
}

export default function DashboardPage() {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    endpoints.analytics()
      .then((r) => setData(r.data))
      .catch(() => {
        // Fallback mock data for development
        setData({
          gmv: 134000, revenue: 24120, total_bookings: 248,
          completed_bookings: 201, total_customers: 183,
          active_pandits: 32, pending_pandits: 7, completion_rate: 81.0,
          avg_rating: 4.7,
          gmv_trend: MOCK_TREND,
          puja_mix: PUJA_MIX,
        });
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  const fmt = (n: number) =>
    n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : `₹${n.toLocaleString("en-IN")}`;

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle={`Welcome back! Here's your platform overview · ${new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}`}
      />

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total GMV" value={fmt(data!.gmv)} subtitle="All time" icon={<IndianRupee size={20} />} trend={18} color="saffron" />
        <StatCard title="Platform Revenue" value={fmt(data!.revenue)} subtitle="18% of GMV" icon={<TrendingUp size={20} />} trend={22} color="green" />
        <StatCard title="Total Bookings" value={data!.total_bookings} subtitle={`${data!.completion_rate}% completion rate`} icon={<CalendarCheck size={20} />} trend={12} color="blue" />
        <StatCard title="Active Pandits" value={data!.active_pandits} subtitle={`${data!.pending_pandits} pending review`} icon={<Users size={20} />} color="maroon" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* GMV Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 shadow-sm border border-gray-50">
          <h2 className="font-heading font-semibold text-gray-800 mb-4">GMV Trend</h2>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data!.gmv_trend}>
              <defs>
                <linearGradient id="gmvGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF9933" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#FF9933" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `₹${v / 1000}k`} />
              <Tooltip formatter={(v: number) => [`₹${v.toLocaleString("en-IN")}`, "GMV"]} />
              <Area type="monotone" dataKey="gmv" stroke="#FF9933" strokeWidth={2.5} fill="url(#gmvGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Puja Mix */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-50">
          <h2 className="font-heading font-semibold text-gray-800 mb-4">Puja Mix</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={data!.puja_mix} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                dataKey="value" paddingAngle={3}>
                {data!.puja_mix.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Legend iconType="circle" iconSize={8} formatter={(v) => <span className="text-xs text-gray-600">{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Customers", value: data!.total_customers, icon: "👤", href: "/customers" },
          { label: "Completed Pujas", value: data!.completed_bookings, icon: "🕉️", href: "/bookings" },
          { label: "Avg Rating", value: `${data!.avg_rating} ★`, icon: "⭐", href: "/pandits" },
        ].map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="bg-white rounded-2xl p-5 shadow-sm border border-gray-50 flex items-center gap-4 hover:shadow-md hover:bg-orange-50/20 transition-all cursor-pointer"
          >
            <span className="text-3xl">{s.icon}</span>
            <div>
              <p className="text-2xl font-heading font-bold text-gray-900">{s.value}</p>
              <p className="text-sm text-gray-400">{s.label}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
