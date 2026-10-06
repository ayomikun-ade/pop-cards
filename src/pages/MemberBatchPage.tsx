import React, { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { BatchConfig, CardMemberData, TemplateId } from "../types";
import { PRESET_PALETTES, DEFAULT_PALETTE } from "../utils/palettes";
import { formatDisplayFields } from "../utils/formatDisplayFields";
import { CardPreview } from "../components/CardPreview";
import { MemberCardForm } from "../components/MemberCardForm";
import { Eye, Edit3, Lock, AlertCircle } from "lucide-react";

export const MemberBatchPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const batchData = useQuery(
    api.batches.getBatchBySlug,
    slug ? { slug } : "skip",
  );

  const [mobileTab, setMobileTab] = useState<"form" | "preview">("form");

  // Member form state
  const [member, setMember] = useState<CardMemberData>({
    fullName: "",
    photoUrl: null,
    role: "Member",
    skills: [],
    tiktok: "",
    instagram: "",
    x: "",
    hobbies: [],
    afterPop: "",
    quote: "",
    customValues: {},
  });

  const handleMemberChange = (updated: Partial<CardMemberData>) => {
    setMember((prev) => ({ ...prev, ...updated }));
  };

  // Convert Convex batch data to local BatchConfig format
  const activeBatch: BatchConfig | null = useMemo(() => {
    if (!batchData) return null;
    const matchedPalette =
      PRESET_PALETTES.find((p) => p.id === batchData.paletteId) ||
      DEFAULT_PALETTE;

    return {
      slug: batchData.slug,
      cdsName: batchData.cdsName,
      batchName: batchData.batchName,
      templateId: (batchData.templateId as TemplateId) || "classic-wave",
      palette: matchedPalette,
      logoUrl: batchData.logoUrl,
      defaultFields: batchData.defaultFields as any,
      customFields: batchData.customFields as any,
      roleOptions: batchData.roleOptions,
      hasExcoCode: batchData.hasExcoCode,
      isActive: batchData.isActive,
      closedMessage: batchData.closedMessage,
    };
  }, [batchData]);

  // Compute active display fields for card rendering
  const displayFields = useMemo(() => {
    if (!activeBatch) return [];
    return formatDisplayFields(activeBatch, member);
  }, [activeBatch, member]);

  // Loading state
  if (batchData === undefined) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="text-slate-500 font-semibold text-sm">
          Loading batch details...
        </div>
      </div>
    );
  }

  // Not found
  if (batchData === null || !activeBatch) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 max-w-md w-full text-center">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-800">Batch Not Found</h2>
          <p className="text-xs text-slate-500 mt-1 mb-6">
            The link "/b/{slug}" is either expired or does not exist. Please
            check the URL with your CDS executives.
          </p>
          <Link
            to="/"
            className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold"
          >
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  // Closed submissions page
  if (!activeBatch.isActive) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 max-w-md w-full text-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-800">
            Submissions Closed
          </h2>
          <p className="text-xs font-semibold text-emerald-700 mt-1">
            {activeBatch.cdsName} • {activeBatch.batchName}
          </p>
          <p className="text-xs text-slate-500 mt-3 mb-6">
            {activeBatch.closedMessage ||
              "Card submissions for this batch have closed. Please contact your CDS executives for inquiries."}
          </p>
          <Link
            to="/"
            className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold"
          >
            Create Personal Card
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-black text-lg">
              P
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 text-base">
                  {activeBatch.cdsName}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-black uppercase">
                  POP Card
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {activeBatch.batchName}
              </p>
            </div>
          </div>
        </div>

        {/* Mobile Tab Switcher */}
        <div className="sm:hidden flex border-t border-slate-200 bg-white">
          <button
            type="button"
            onClick={() => setMobileTab("form")}
            className={`flex-1 py-3 text-xs font-bold flex items-center justify-center gap-1.5 border-b-2 transition ${
              mobileTab === "form"
                ? "border-emerald-600 text-emerald-700 bg-emerald-50/50"
                : "border-transparent text-slate-500"
            }`}
          >
            <Edit3 className="w-4 h-4" />
            Edit Info
          </button>
          <button
            type="button"
            onClick={() => setMobileTab("preview")}
            className={`flex-1 py-3 text-xs font-bold flex items-center justify-center gap-1.5 border-b-2 transition ${
              mobileTab === "preview"
                ? "border-emerald-600 text-emerald-700 bg-emerald-50/50"
                : "border-transparent text-slate-500"
            }`}
          >
            <Eye className="w-4 h-4" />
            Live Preview
          </button>
        </div>
      </header>

      {/* Main Form & Preview Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div
            className={`lg:col-span-7 ${
              mobileTab === "form" ? "block" : "hidden lg:block"
            }`}
          >
            <MemberCardForm
              batch={activeBatch}
              member={member}
              onChange={handleMemberChange}
            />
          </div>

          <div
            className={`lg:col-span-5 lg:sticky lg:top-24 ${
              mobileTab === "preview" ? "block" : "hidden lg:block"
            }`}
          >
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 flex flex-col items-center">
              <div className="w-full flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Live Card Preview
                </span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                  {displayFields.length} / 7 slots
                </span>
              </div>

              <CardPreview
                batch={activeBatch}
                member={member}
                displayFields={displayFields}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
