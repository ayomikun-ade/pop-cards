import React, { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Lock, User, Sparkles, ShieldCheck, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const LoginPage: React.FC = () => {
  const { signIn } = useAuthActions();
  const navigate = useNavigate();

  const isInitialized = useQuery(api.admins.isSystemInitialized);
  const initSuperadmin = useMutation(api.admins.initSuperadmin);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // If system not initialized, we show a clean "Setup Master Account" flow
  const isSetupMode = isInitialized === false;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const cleanUsername = username.trim().toLowerCase();
      // In @convex-dev/auth Password provider, we can pass email or username as the identifier
      // Use cleanUsername + "@popcards.local" or direct identifier
      const emailIdentifier = cleanUsername.includes("@") ? cleanUsername : `${cleanUsername}@popcards.local`;

      if (isSetupMode) {
        // Step 1: Sign up new master account
        await signIn("password", {
          email: emailIdentifier,
          password,
          flow: "signUp",
        });

        // Step 2: Initialize superadmin profile
        await initSuperadmin({
          username: cleanUsername,
          displayName: displayName.trim() || "Master Admin",
        });

        navigate("/admin");
      } else {
        // Standard Sign In
        await signIn("password", {
          email: emailIdentifier,
          password,
          flow: "signIn",
        });

        navigate("/admin");
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      setError(err?.message || "Failed to sign in. Please verify your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-white font-black text-xl">
            P
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900">POPCards Admin</h1>
            <p className="text-xs text-slate-500">
              {isSetupMode ? "Setup Superadmin Account" : "Sign in to manage batches"}
            </p>
          </div>
        </div>

        {isSetupMode && (
          <div className="p-3.5 mb-5 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-2.5 text-xs text-amber-800">
            <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              <strong>First Time Setup:</strong> You are setting up the Superadmin (master) account for POPCards.
            </span>
          </div>
        )}

        {error && (
          <div className="p-3.5 mb-5 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {isSetupMode && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Your Full Name / Title
              </label>
              <div className="relative">
                <Sparkles className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Master Executive"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-600 text-sm font-medium outline-hidden"
                />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Username
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. superadmin"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-600 text-sm font-medium outline-hidden"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-600 text-sm font-medium outline-hidden"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer"
          >
            <span>{isLoading ? "Processing..." : isSetupMode ? "Create Superadmin" : "Sign In"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-100 text-center">
          <a
            href="/"
            className="text-xs text-slate-500 hover:text-slate-800 font-semibold transition"
          >
            ← Return to Card Generator
          </a>
        </div>
      </div>
    </div>
  );
};
