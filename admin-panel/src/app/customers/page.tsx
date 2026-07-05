"use client";
import { useEffect, useState } from "react";
import { Search, Mail, Phone, MapPin, Calendar, ShieldCheck, ShieldAlert } from "lucide-react";
import { PageHeader, Badge, LoadingSpinner, EmptyState } from "@/components/ui";
import { endpoints } from "@/lib/api";

interface Customer {
  id: string;
  phone: string;
  name: string | null;
  city: string | null;
  role: string;
  is_active: boolean;
  created_at: string;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const load = () => {
    setLoading(true);
    endpoints.customers()
      .then((r) => {
        setCustomers(r.data || []);
      })
      .catch((err) => {
        console.error("Failed to load customers:", err);
        setCustomers([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = customers.filter(c => {
    const query = search.toLowerCase();
    const nameMatch = c.name?.toLowerCase().includes(query) || false;
    const phoneMatch = c.phone.includes(query);
    const cityMatch = c.city?.toLowerCase().includes(query) || false;
    return !search || nameMatch || phoneMatch || cityMatch;
  });

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <PageHeader 
        title="Customers" 
        subtitle={`Total registered users: ${customers.length}`} 
      />

      {/* Filter / Search Bar */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-saffron-500 transition-all"
            placeholder="Search by name, phone number, or city..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState message="No customers found matching your search." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-orange-50/40 border-b border-orange-50/50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Phone Number</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4">Member Since</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-orange-50/10 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-saffron-100 text-saffron-700 flex items-center justify-center font-heading font-bold text-sm">
                          {getInitials(c.name)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{c.name || "Unnamed Devotee"}</p>
                          <p className="text-xs text-gray-400">ID: {c.id.substring(0, 8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-gray-700">
                        <Phone size={14} className="text-gray-400" />
                        {c.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-gray-700">
                        <MapPin size={14} className="text-gray-400" />
                        {c.city || "Not Provided"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                        <Calendar size={14} className="text-gray-400" />
                        {new Date(c.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {c.is_active ? (
                        <Badge color="green">Active</Badge>
                      ) : (
                        <Badge color="red">Inactive</Badge>
                      )}
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
