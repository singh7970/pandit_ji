"use client";
import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { PageHeader, Badge, LoadingSpinner, EmptyState } from "@/components/ui";
import { endpoints } from "@/lib/api";

interface Puja { id: string; name_en: string; name_hi: string; base_price: number; duration_hrs: number; deity: string; is_active: boolean; tier_required: string }

export default function PujasPage() {
  const [pujas, setPujas] = useState<Puja[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    endpoints.pujas()
      .then(r => setPujas(r.data.items || r.data))
      .catch(() => setPujas([]))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const toggleActive = async (puja: Puja) => {
    await endpoints.updatePuja(puja.id, { is_active: !puja.is_active });
    load();
  };

  const del = async (id: string) => {
    if (!confirm("Delete this puja?")) return;
    await endpoints.deletePuja(id);
    load();
  };

  return (
    <div>
      <PageHeader
        title="Puja Catalogue"
        subtitle={`${pujas.length} pujas`}
        action={
          <button className="flex items-center gap-2 px-4 py-2.5 bg-saffron-500 text-white rounded-xl text-sm font-medium hover:bg-saffron-600 transition-colors shadow-md shadow-orange-100">
            <Plus size={16} /> Add Puja
          </button>
        }
      />

      {loading ? <LoadingSpinner /> : pujas.length === 0 ? <EmptyState message="No pujas in catalogue yet" /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pujas.map(p => (
            <div key={p.id} className={`bg-white rounded-2xl shadow-sm border ${p.is_active ? "border-gray-50" : "border-gray-100 opacity-60"} p-5`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-heading font-semibold text-gray-900">{p.name_en}</p>
                  {p.name_hi && <p className="text-sm text-gray-400">{p.name_hi}</p>}
                </div>
                <Badge color={p.is_active ? "green" : "gray"}>{p.is_active ? "Active" : "Inactive"}</Badge>
              </div>
              <div className="space-y-1 text-sm text-gray-500 mb-4">
                <p>💰 ₹{p.base_price?.toLocaleString("en-IN")} · ⏱ {p.duration_hrs}hrs</p>
                {p.deity && <p>🕉️ {p.deity}</p>}
                {p.tier_required && <p>🏅 {p.tier_required}+ pandit</p>}
              </div>
              <div className="flex items-center gap-2 pt-3 border-t border-gray-50">
                <button onClick={() => toggleActive(p)} className="flex items-center gap-1 text-xs text-gray-500 hover:text-saffron-600 transition-colors">
                  {p.is_active ? <ToggleRight size={16} className="text-saffron-500" /> : <ToggleLeft size={16} />}
                  {p.is_active ? "Deactivate" : "Activate"}
                </button>
                <button className="ml-auto flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700">
                  <Pencil size={13} /> Edit
                </button>
                <button onClick={() => del(p.id)} className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600">
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
