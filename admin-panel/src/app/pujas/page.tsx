"use client";
import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, X } from "lucide-react";
import { PageHeader, Badge, LoadingSpinner, EmptyState } from "@/components/ui";
import { endpoints } from "@/lib/api";

interface Puja {
  id: string;
  name_en: string;
  name_hi?: string;
  base_price: number;
  duration_hrs: number;
  deity?: string;
  is_active: boolean;
  tier_required: string;
  description?: string;
}

export default function PujasPage() {
  const [pujas, setPujas] = useState<Puja[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPuja, setEditingPuja] = useState<Puja | null>(null);

  // Form States
  const [nameEn, setNameEn] = useState("");
  const [nameHi, setNameHi] = useState("");
  const [basePrice, setBasePrice] = useState<number>(1000);
  const [durationHrs, setDurationHrs] = useState<number>(1.5);
  const [deity, setDeity] = useState("");
  const [tierRequired, setTierRequired] = useState("VERIFIED");
  const [description, setDescription] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);

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

  const openCreateModal = () => {
    setEditingPuja(null);
    setNameEn("");
    setNameHi("");
    setBasePrice(1000);
    setDurationHrs(1.5);
    setDeity("");
    setTierRequired("VERIFIED");
    setDescription("");
    setIsModalOpen(true);
  };

  const openEditModal = (puja: Puja) => {
    setEditingPuja(puja);
    setNameEn(puja.name_en || "");
    setNameHi(puja.name_hi || "");
    setBasePrice(puja.base_price || 1000);
    setDurationHrs(puja.duration_hrs || 1.5);
    setDeity(puja.deity || "");
    setTierRequired(puja.tier_required || "VERIFIED");
    setDescription(puja.description || "");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    const payload = {
      name_en: nameEn,
      name_hi: nameHi || null,
      base_price: Number(basePrice),
      duration_hrs: Number(durationHrs),
      deity: deity || null,
      tier_required: tierRequired,
      description: description || null,
    };

    try {
      if (editingPuja) {
        await endpoints.updatePuja(editingPuja.id, payload);
      } else {
        await endpoints.createPuja(payload);
      }
      setIsModalOpen(false);
      load();
    } catch (err) {
      alert("Failed to save puja. Please check your connection and try again.");
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Puja Catalogue"
        subtitle={`${pujas.length} pujas`}
        action={
          <button 
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-saffron-500 text-white rounded-xl text-sm font-medium hover:bg-saffron-600 transition-colors shadow-md shadow-orange-100"
          >
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
                <button 
                  onClick={() => openEditModal(p)}
                  className="ml-auto flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700"
                >
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

      {/* Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-xl border border-gray-100 flex flex-col max-h-[90vh] overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <h3 className="text-lg font-bold font-heading text-gray-900">
                {editingPuja ? "Edit Puja Details" : "Create New Puja"}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form Content */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-4 pr-1">
              
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                  English Name *
                </label>
                <input 
                  type="text" 
                  required
                  value={nameEn}
                  onChange={e => setNameEn(e.target.value)}
                  placeholder="e.g. Satyanarayan Puja"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-saffron-500/20 focus:border-saffron-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                  Hindi Name
                </label>
                <input 
                  type="text" 
                  value={nameHi}
                  onChange={e => setNameHi(e.target.value)}
                  placeholder="e.g. सत्यनारायण पूजा"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-saffron-500/20 focus:border-saffron-500 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                    Base Price (₹)
                  </label>
                  <input 
                    type="number" 
                    min="0"
                    value={basePrice}
                    onChange={e => setBasePrice(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-saffron-500/20 focus:border-saffron-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                    Duration (Hours)
                  </label>
                  <input 
                    type="number" 
                    step="0.5"
                    min="0.5"
                    value={durationHrs}
                    onChange={e => setDurationHrs(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-saffron-500/20 focus:border-saffron-500 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                    Deity
                  </label>
                  <input 
                    type="text" 
                    value={deity}
                    onChange={e => setDeity(e.target.value)}
                    placeholder="e.g. Lord Vishnu"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-saffron-500/20 focus:border-saffron-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                    Required Pandit Tier
                  </label>
                  <select 
                    value={tierRequired}
                    onChange={e => setTierRequired(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-saffron-500/20 focus:border-saffron-500 text-sm bg-white"
                  >
                    <option value="VERIFIED">VERIFIED</option>
                    <option value="SILVER">SILVER</option>
                    <option value="GOLD">GOLD</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea 
                  rows={3}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Provide details about the Puja..."
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-saffron-500/20 focus:border-saffron-500 text-sm"
                />
              </div>

              {/* Modal Footer Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 bg-gray-50 text-gray-500 rounded-xl text-sm font-medium hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={submitLoading}
                  className="px-5 py-2.5 bg-saffron-500 text-white rounded-xl text-sm font-medium hover:bg-saffron-600 transition-colors disabled:opacity-50"
                >
                  {submitLoading ? "Saving..." : editingPuja ? "Save Changes" : "Add Puja"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}
