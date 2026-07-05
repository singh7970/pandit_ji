"use client";
import { useEffect, useState } from "react";
import { CheckCircle, XCircle, FileText, ChevronDown } from "lucide-react";
import { PageHeader, Badge, LoadingSpinner, EmptyState } from "@/components/ui";
import { endpoints } from "@/lib/api";

interface PanditApplication {
  profile: {
    id: string; user_id: string; sampraday: string; specialisations: string[];
    languages: string[]; experience_years: number; bio: string;
    document_urls: string[]; created_at: string;
    status?: string;
    tier?: string;
  };
  user: { id: string; name: string; phone: string; city: string };
}

export default function PanditsPage() {
  const [apps, setApps] = useState<PanditApplication[]>([]);
  const [allPandits, setAllPandits] = useState<PanditApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [expandedAll, setExpandedAll] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    Promise.all([endpoints.panditQueue(), endpoints.allPandits()])
      .then(([queueRes, allRes]) => {
        setApps(queueRes.data || []);
        setAllPandits(allRes.data || []);
      })
      .catch((err) => {
        console.error("Failed to load pandits:", err);
      })
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const approve = async (userId: string, tier: string) => {
    setActionLoading(userId);
    try {
      await endpoints.approvePandit(userId, tier);
      load();
    } catch (err) {
      console.error(err);
    } finally { setActionLoading(null); }
  };

  const reject = async (userId: string) => {
    const reason = prompt("Rejection reason:");
    if (!reason) return;
    setActionLoading(userId);
    try {
      await endpoints.rejectPandit(userId, reason);
      load();
    } catch (err) {
      console.error(err);
    } finally { setActionLoading(null); }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <PageHeader
        title="Pandit Applications"
        subtitle={`${apps.length} pending review`}
      />

      {apps.length === 0 ? (
        <EmptyState message="No pending applications — all caught up! 🎉" />
      ) : (
        <div className="space-y-4 mb-10">
          {apps.map((app) => (
            <div key={app.user.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Header row */}
              <div
                className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setExpanded(expanded === app.user.id ? null : app.user.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center font-heading font-bold text-orange-600">
                    {app.user.name?.[0] || "P"}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{app.user.name || "—"}</p>
                    <p className="text-sm text-gray-400">{app.user.phone} · {app.user.city}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge color="yellow">Pending</Badge>
                  <span className="text-xs text-gray-400">{app.profile.experience_years}yr exp</span>
                  <ChevronDown size={16} className={`text-gray-400 transition-transform ${expanded === app.user.id ? "rotate-180" : ""}`} />
                </div>
              </div>

              {/* Expanded details */}
              {expanded === app.user.id && (
                <div className="border-t border-gray-50 px-6 py-5 space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400 mb-1">Sampraday</p>
                      <p className="font-medium">{app.profile.sampraday || "—"}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 mb-1">Languages</p>
                      <p className="font-medium">{app.profile.languages?.join(", ") || "—"}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 mb-1">Specialisations</p>
                      <p className="font-medium text-xs">{app.profile.specialisations?.join(", ") || "—"}</p>
                    </div>
                  </div>
                  {app.profile.bio && (
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Bio</p>
                      <p className="text-sm text-gray-700 leading-relaxed">{app.profile.bio}</p>
                    </div>
                  )}

                  {/* Documents */}
                  {app.profile.document_urls?.length > 0 && (
                    <div>
                      <p className="text-gray-400 text-sm mb-2">Documents</p>
                      <div className="flex flex-wrap gap-2">
                        {app.profile.document_urls.map((url, i) => (
                          <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-lg text-xs text-blue-600 hover:bg-blue-50 transition-colors border border-gray-100">
                            <FileText size={12} /> Document {i + 1}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-3 pt-2">
                    {["VERIFIED", "SILVER", "GOLD"].map((tier) => (
                      <button
                        key={tier}
                        onClick={() => approve(app.user.id, tier)}
                        disabled={actionLoading === app.user.id}
                        className="flex items-center gap-1.5 px-4 py-2 bg-saffron-500 text-white rounded-xl text-sm font-medium hover:bg-saffron-600 disabled:opacity-50 transition-colors"
                      >
                        <CheckCircle size={14} /> Approve as {tier}
                      </button>
                    ))}
                    <button
                      onClick={() => reject(app.user.id)}
                      disabled={actionLoading === app.user.id}
                      className="flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-500 rounded-xl text-sm font-medium hover:bg-red-100 disabled:opacity-50 transition-colors"
                    >
                      <XCircle size={14} /> Reject
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* All Registered Pandits Section */}
      <div className="mt-12">
        <PageHeader
          title="Registered Pandits"
          subtitle={`${allPandits.length} total pandit profiles`}
        />

        {allPandits.length === 0 ? (
          <EmptyState message="No registered pandits found." />
        ) : (
          <div className="space-y-4">
            {allPandits.map((p) => {
              const profile = p.profile;
              const user = p.user;
              const isExpanded = expandedAll === user.id;

              return (
                <div key={user.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  {/* Header row */}
                  <div
                    className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => setExpandedAll(isExpanded ? null : user.id)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center font-heading font-bold text-orange-600">
                        {user.name?.[0] || "P"}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{user.name || "—"}</p>
                        <p className="text-sm text-gray-400">{user.phone} · {user.city}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {profile.status === "ACTIVE" ? (
                        <Badge color="green">Active ({profile.tier || "VERIFIED"})</Badge>
                      ) : profile.status === "REJECTED" ? (
                        <Badge color="red">Rejected</Badge>
                      ) : (
                        <Badge color="yellow">Pending</Badge>
                      )}
                      <span className="text-xs text-gray-400">{profile.experience_years}yr exp</span>
                      <ChevronDown size={16} className={`text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                    </div>
                  </div>

                  {/* Expanded details */}
                  {isExpanded && (
                    <div className="border-t border-gray-50 px-6 py-5 space-y-4">
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-400 mb-1">Sampraday</p>
                          <p className="font-medium">{profile.sampraday || "—"}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 mb-1">Languages</p>
                          <p className="font-medium">{profile.languages?.join(", ") || "—"}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 mb-1">Specialisations</p>
                          <p className="font-medium text-xs">{profile.specialisations?.join(", ") || "—"}</p>
                        </div>
                      </div>
                      {profile.bio && (
                        <div>
                          <p className="text-gray-400 text-sm mb-1">Bio</p>
                          <p className="text-sm text-gray-700 leading-relaxed">{profile.bio}</p>
                        </div>
                      )}

                      {/* Documents */}
                      {profile.document_urls?.length > 0 && (
                        <div>
                          <p className="text-gray-400 text-sm mb-2">Documents</p>
                          <div className="flex flex-wrap gap-2">
                            {profile.document_urls.map((url, i) => (
                              <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-lg text-xs text-blue-600 hover:bg-blue-50 transition-colors border border-gray-100">
                                <FileText size={12} /> Document {i + 1}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {profile.status !== "ACTIVE" && (
                        <div className="flex items-center gap-3 pt-2">
                          {["VERIFIED", "SILVER", "GOLD"].map((tier) => (
                            <button
                              key={tier}
                              onClick={() => approve(user.id, tier)}
                              disabled={actionLoading === user.id}
                              className="flex items-center gap-1.5 px-4 py-2 bg-saffron-500 text-white rounded-xl text-sm font-medium hover:bg-saffron-600 disabled:opacity-50 transition-colors"
                            >
                              <CheckCircle size={14} /> Approve as {tier}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
