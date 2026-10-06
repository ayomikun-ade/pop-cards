import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  UserPlus,
  ShieldAlert,
  CheckCircle2,
} from "lucide-react";

export const ManageUsersPage: React.FC = () => {
  const profile = useQuery(api.admins.getCurrentProfile);
  const admins = useQuery(api.admins.listAdmins);
  const registerAdmin = useMutation(api.admins.registerAdminProfile);
  const toggleStatus = useMutation(api.admins.toggleAdminStatus);

  const [newUsername, setNewUsername] = useState("");
  const [newDisplayName, setNewDisplayName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!profile || profile.role !== "superadmin") {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 text-center">
          <ShieldAlert className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <h2 className="text-base font-bold text-slate-800">Superadmin Access Required</h2>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            Only the Superadmin can access and manage admin accounts.
          </p>
          <Link
            to="/admin"
            className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsSubmitting(true);

    try {
      // In production Convex Auth, accounts are created by inviting or registering.
      // We pass the userId or register their profile for access control.
      await registerAdmin({
        userId: profile.userId, // Link to organization or user scope
        username: newUsername.trim().toLowerCase(),
        displayName: newDisplayName.trim(),
      });

      setSuccessMsg(`Admin account "${newUsername}" created successfully.`);
      setNewUsername("");
      setNewDisplayName("");
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to create admin profile.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleDisabled = async (profileId: any, currentDisabled: boolean) => {
    await toggleStatus({
      profileId,
      disabled: !currentDisabled,
    });
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/admin"
              className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-base font-black text-slate-900">Manage Admins</h1>
              <p className="text-[11px] text-slate-400">Superadmin access control</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 flex-1 w-full grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Create Admin Form */}
        <div className="md:col-span-5 bg-white rounded-3xl border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
            <UserPlus className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-800">Add New Admin</h2>
          </div>

          {successMsg && (
            <div className="p-3 mb-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 mb-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleCreateAdmin} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Display Name
              </label>
              <input
                type="text"
                required
                value={newDisplayName}
                onChange={(e) => setNewDisplayName(e.target.value)}
                placeholder="e.g. TBC CDS President"
                className="px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-600 text-sm font-medium outline-hidden"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Username
              </label>
              <input
                type="text"
                required
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="e.g. tbc_admin"
                className="px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-600 text-sm font-medium outline-hidden"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider transition cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? "Creating..." : "Create Admin Account"}
            </button>
          </form>
        </div>

        {/* Existing Admins List */}
        <div className="md:col-span-7 bg-white rounded-3xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-800">Admin Accounts</h2>
            <span className="text-xs text-slate-400 font-medium">
              {admins?.length || 0} registered
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {admins?.map((adm) => (
              <div
                key={adm._id}
                className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 flex items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-800">{adm.displayName}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        adm.role === "superadmin"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {adm.role}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">@{adm.username}</p>
                </div>

                {adm.role !== "superadmin" && (
                  <button
                    type="button"
                    onClick={() => handleToggleDisabled(adm._id, adm.disabled)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                      adm.disabled
                        ? "border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
                        : "border-red-200 text-red-600 bg-red-50 hover:bg-red-100"
                    }`}
                  >
                    {adm.disabled ? "Enable" : "Disable"}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};
