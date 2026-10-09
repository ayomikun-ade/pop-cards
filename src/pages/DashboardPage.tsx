import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "../../convex/_generated/api";
import { Link, useNavigate, Navigate } from "react-router-dom";
import {
  Plus,
  ExternalLink,
  Edit2,
  Trash2,
  Users,
  LogOut,
  Layers,
  Copy,
  Check,
  Shield,
} from "lucide-react";

export const DashboardPage: React.FC = () => {
  const profile = useQuery(api.admins.getCurrentProfile);
  const batches = useQuery(api.batches.listMyBatches);
  const deleteBatch = useMutation(api.batches.deleteBatch);
  const { signOut } = useAuthActions();
  const navigate = useNavigate();

  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  const handleCopyLink = (slug: string) => {
    const fullUrl = `${window.location.origin}/b/${slug}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2500);
  };

  const handleDeleteBatch = async (id: any, name: string) => {
    if (window.confirm(`Are you sure you want to delete batch "${name}"? This cannot be undone.`)) {
      await deleteBatch({ id });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  if (profile === undefined || batches === undefined) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="text-slate-500 font-semibold text-sm">Loading dashboard...</div>
      </div>
    );
  }

  if (profile === null) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-black text-lg">
              P
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 text-base">POPCards Admin</span>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold uppercase">
                  {profile.role}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Welcome back, {profile.displayName}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {profile.role === "superadmin" && (
              <Link
                to="/admin/users"
                className="px-3.5 py-2 rounded-xl border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition"
              >
                <Users className="w-4 h-4 text-emerald-600" />
                <span className="hidden sm:inline">Manage Admins</span>
              </Link>
            )}

            <button
              type="button"
              onClick={handleSignOut}
              className="p-2 sm:px-3.5 sm:py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full">
        {/* Header Title & Create Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-black text-slate-900">Batches & Share Links</h2>
            <p className="text-sm text-slate-500 mt-1">
              Create and manage CDS passing-out batches and their custom form links.
            </p>
          </div>

          <Link
            to="/admin/batches/new"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Batch</span>
          </Link>
        </div>

        {/* Batches Grid */}
        {batches.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center flex flex-col items-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
              <Layers className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">No batches created yet</h3>
            <p className="text-sm text-slate-500 max-w-sm mt-1 mb-6">
              Get started by creating your first batch for your CDS group to generate a shareable member link.
            </p>
            <Link
              to="/admin/batches/new"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Create Your First Batch</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {batches.map((b) => (
              <div
                key={b._id}
                className="bg-white rounded-3xl border border-slate-200 p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        b.isActive
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {b.isActive ? "Active / Open" : "Closed"}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      Template: {b.templateId}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 leading-snug">
                    {b.batchName}
                  </h3>
                  <p className="text-xs font-semibold text-emerald-700 mt-0.5">
                    {b.cdsName}
                  </p>

                  {/* Slug / Share Link preview */}
                  <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-2">
                    <div className="truncate text-xs font-mono text-slate-600">
                      /b/{b.slug}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyLink(b.slug)}
                      className="p-1.5 hover:bg-white rounded-lg text-slate-500 hover:text-slate-800 transition shrink-0 cursor-pointer"
                      title="Copy public link"
                    >
                      {copiedSlug === b.slug ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Exco Code indicator */}
                  {b.excoCode && (
                    <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                      <Shield className="w-3 h-3 text-amber-500" />
                      <span>Exco Code: <strong className="font-mono text-slate-600">{b.excoCode}</strong></span>
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <a
                    href={`/b/${b.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-emerald-700 transition"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open Form</span>
                  </a>

                  <div className="flex items-center gap-1.5">
                    <Link
                      to={`/admin/batches/${b._id}`}
                      className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition"
                      title="Edit Batch Settings"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDeleteBatch(b._id, b.batchName)}
                      className="p-2 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-600 transition cursor-pointer"
                      title="Delete Batch"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
