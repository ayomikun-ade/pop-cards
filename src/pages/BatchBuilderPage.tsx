import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useNavigate, useParams, Link } from "react-router-dom";
import { PRESET_PALETTES } from "../utils/palettes";
import { TEMPLATES } from "../templates";
import { TemplateId } from "../types";
import { TemplateThumbnail } from "../components/TemplateThumbnail";
import {
  ArrowLeft,
  Save,
  Upload,
  Lock,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
} from "lucide-react";

export const BatchBuilderPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const isEditing = !!id && id !== "new";
  const existingBatch = useQuery(
    api.batches.getBatchById,
    isEditing ? { id: id as any } : "skip"
  );

  const saveBatch = useMutation(api.batches.saveBatch);
  const generateUploadUrl = useMutation(api.batches.generateUploadUrl);

  // Form State
  const [cdsName, setCdsName] = useState("");
  const [batchName, setBatchName] = useState("");
  const [slug, setSlug] = useState("");
  const [templateId, setTemplateId] = useState<TemplateId>("classic-wave");
  const [paletteId, setPaletteId] = useState("nysc-classic");
  const [isActive, setIsActive] = useState(true);
  const [closedMessage, setClosedMessage] = useState("");
  const [excoCode, setExcoCode] = useState("");
  const [showExcoCode, setShowExcoCode] = useState(false);

  // Logo file upload state
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [existingLogoUrl, setExistingLogoUrl] = useState<string | null>(null);

  // Default fields toggles
  const [defaultFields, setDefaultFields] = useState<
    { key: string; label: string; enabled: boolean; required: boolean; maxLength: number }[]
  >([
    { key: "role", label: "CDS Role", enabled: true, required: false, maxLength: 30 },
    { key: "skills", label: "Skills", enabled: true, required: false, maxLength: 60 },
    { key: "tiktok", label: "TikTok", enabled: true, required: false, maxLength: 25 },
    { key: "instagram", label: "Instagram", enabled: true, required: false, maxLength: 25 },
    { key: "x", label: "X (Twitter)", enabled: false, required: false, maxLength: 25 },
    { key: "hobbies", label: "Hobbies", enabled: true, required: false, maxLength: 60 },
    { key: "afterPop", label: "After POP?", enabled: true, required: false, maxLength: 85 },
    { key: "quote", label: "Fav Quote / Motto", enabled: true, required: false, maxLength: 115 },
  ]);

  // Custom fields
  const [customFields, setCustomFields] = useState<
    { id: string; label: string; required: boolean; maxLength: number }[]
  >([]);

  // Role options
  const [roleOptions, setRoleOptions] = useState<
    { label: string; isExco: boolean }[]
  >([
    { label: "President", isExco: true },
    { label: "Vice President", isExco: true },
    { label: "General Secretary", isExco: true },
    { label: "Welfare Director", isExco: true },
    { label: "PRO", isExco: true },
    { label: "Financial Secretary", isExco: true },
    { label: "Treasurer", isExco: true },
  ]);

  const [newRoleInput, setNewRoleInput] = useState("");
  const [newRoleIsExco, setNewRoleIsExco] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load existing batch values if editing
  useEffect(() => {
    if (existingBatch) {
      setCdsName(existingBatch.cdsName);
      setBatchName(existingBatch.batchName);
      setSlug(existingBatch.slug);
      setTemplateId(existingBatch.templateId as TemplateId);
      setPaletteId(existingBatch.paletteId);
      setIsActive(existingBatch.isActive);
      setClosedMessage(existingBatch.closedMessage || "");
      setExcoCode(existingBatch.excoCode || "");
      setDefaultFields(existingBatch.defaultFields);
      setCustomFields(existingBatch.customFields);
      setRoleOptions(existingBatch.roleOptions);
      if (existingBatch.logoUrl) {
        setExistingLogoUrl(existingBatch.logoUrl);
      }
    }
  }, [existingBatch]);

  // Auto-generate slug when CDS and batch name are typed (if new)
  const handleAutoSlug = (cds: string, batch: string) => {
    if (!isEditing) {
      const combined = `${cds} ${batch}`
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setSlug(combined);
    }
  };

  const handleAddCustomField = () => {
    if (customFields.length >= 5) {
      alert("Maximum 5 custom fields allowed per batch");
      return;
    }
    const newId = `custom_${Date.now()}`;
    setCustomFields([
      ...customFields,
      { id: newId, label: "State Code", required: false, maxLength: 40 },
    ]);
  };

  const handleAddRoleOption = () => {
    if (!newRoleInput.trim()) return;
    setRoleOptions([
      ...roleOptions,
      { label: newRoleInput.trim(), isExco: newRoleIsExco },
    ]);
    setNewRoleInput("");
    setNewRoleIsExco(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      let logoStorageId: any = undefined;

      // Handle CDS Logo upload if a new file was chosen
      if (logoFile) {
        const postUrl = await generateUploadUrl();
        const uploadResult = await fetch(postUrl, {
          method: "POST",
          headers: { "Content-Type": logoFile.type },
          body: logoFile,
        });
        const { storageId } = await uploadResult.json();
        logoStorageId = storageId;
      }

      await saveBatch({
        id: isEditing ? (id as any) : undefined,
        slug: slug.trim(),
        cdsName: cdsName.trim(),
        batchName: batchName.trim(),
        templateId,
        paletteId,
        logoStorageId,
        defaultFields,
        customFields,
        roleOptions,
        excoCode: excoCode.trim() || undefined,
        isActive,
        closedMessage: closedMessage.trim() || undefined,
      });

      navigate("/admin");
    } catch (err: any) {
      console.error("Save batch error:", err);
      setErrorMessage(err?.message || "Failed to save batch. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Live count of active fields
  // Socials (tiktok, instagram, x) render together under one single unified row on the card,
  // so having any social platform enabled counts as just 1 slot on the card canvas.
  const hasSocialsEnabled = defaultFields.some(
    (f) => (f.key === "tiktok" || f.key === "instagram" || f.key === "x") && f.enabled
  );
  const nonSocialDefaultFieldsActive = defaultFields.filter(
    (f) =>
      f.enabled &&
      f.key !== "role" &&
      f.key !== "tiktok" &&
      f.key !== "instagram" &&
      f.key !== "x"
  ).length;
  const isRoleActive = defaultFields.find((f) => f.key === "role")?.enabled ? 1 : 0;

  const activeFieldsCount =
    nonSocialDefaultFieldsActive +
    isRoleActive +
    (hasSocialsEnabled ? 1 : 0) +
    customFields.length;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Top Bar */}
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
              <h1 className="text-base font-black text-slate-900">
                {isEditing ? "Edit Batch" : "Create New Batch"}
              </h1>
              <p className="text-[11px] text-slate-400">Configure branding and fields</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSubmitting ? "Saving..." : "Save Batch"}</span>
          </button>
        </div>
      </header>

      {/* Main Builder Form */}
      <main className="max-w-5xl mx-auto px-4 py-8 flex-1 w-full flex flex-col gap-8">
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* 1. Basic Info & Slug */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 flex flex-col gap-6">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
            1. Batch Details & Link URL
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                CDS Group Name *
              </label>
              <input
                type="text"
                required
                value={cdsName}
                onChange={(e) => {
                  setCdsName(e.target.value);
                  handleAutoSlug(e.target.value, batchName);
                }}
                placeholder="e.g. TBC CDS"
                className="px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-600 text-sm font-semibold outline-hidden"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Batch Name / Title *
              </label>
              <input
                type="text"
                required
                value={batchName}
                onChange={(e) => {
                  setBatchName(e.target.value);
                  handleAutoSlug(cdsName, e.target.value);
                }}
                placeholder="e.g. 2026 Batch A Stream I"
                className="px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-600 text-sm font-semibold outline-hidden"
              />
            </div>
          </div>

          {/* Unique Slug */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex justify-between">
              <span>Shareable Link Slug *</span>
              <span className="text-[11px] font-normal text-slate-400">
                Accessible at /b/&lt;slug&gt;
              </span>
            </label>
            <div className="flex items-center">
              <span className="px-3.5 py-2.5 rounded-l-xl bg-slate-100 border border-r-0 border-slate-200 text-xs font-mono text-slate-500">
                cdscards.com/b/
              </span>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="tbc-cds-2026-batch-a"
                className="flex-1 px-4 py-2.5 rounded-r-xl border border-slate-200 focus:border-emerald-600 text-sm font-mono text-slate-800 outline-hidden"
              />
            </div>
          </div>

          {/* Active status & Closed message */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="activeToggle"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-5 h-5 rounded-md accent-emerald-600 cursor-pointer"
              />
              <label htmlFor="activeToggle" className="text-xs font-bold text-slate-800 cursor-pointer">
                Submissions Open (Accepting card entries)
              </label>
            </div>

            {!isActive && (
              <input
                type="text"
                value={closedMessage}
                onChange={(e) => setClosedMessage(e.target.value)}
                placeholder="Custom closed note: 'Submissions for 2026 Batch A are now closed.'"
                className="flex-1 px-3.5 py-2 rounded-xl border border-amber-200 bg-amber-50 text-xs text-amber-900 outline-hidden"
              />
            )}
          </div>
        </div>

        {/* 2. Visual Style & Template */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 flex flex-col gap-6">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
            2. Card Template & Colors
          </h2>

          {/* Template Choice */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Select Card Layout Template
              </label>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                Visual Live Sample
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {(Object.keys(TEMPLATES) as TemplateId[]).map((tid) => {
                const tmpl = TEMPLATES[tid];
                const isSelected = templateId === tid;
                return (
                  <button
                    key={tid}
                    type="button"
                    onClick={() => setTemplateId(tid)}
                    className={`p-3 rounded-2xl border text-left flex flex-col gap-3 transition cursor-pointer relative group ${
                      isSelected
                        ? "border-emerald-600 bg-emerald-50/50 shadow-md ring-2 ring-emerald-600/30"
                        : "border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/60 shadow-xs"
                    }`}
                  >
                    {/* Visual Card Preview */}
                    <div className="relative w-full rounded-xl overflow-hidden border border-slate-200/90 shadow-xs">
                      <TemplateThumbnail
                        templateId={tid}
                        paletteId={paletteId}
                        cdsName={cdsName || "NYSC CDS GROUP"}
                        batchName={batchName || "2026 BATCH A"}
                      />
                      {isSelected && (
                        <div className="absolute top-2 right-2 bg-emerald-600 text-white rounded-full p-1 shadow-md">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                      )}
                    </div>

                    {/* Template Info */}
                    <div className="flex flex-col gap-1 px-1">
                      <div className="flex items-center justify-between">
                        <span className={`font-bold text-xs ${isSelected ? "text-emerald-950 font-black" : "text-slate-800"}`}>
                          {tmpl.name}
                        </span>
                        {isSelected && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-1.5 py-0.5 rounded">
                            Selected
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500 leading-snug line-clamp-2">
                        {tmpl.description}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Palette Choice */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Color Theme Palette
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {PRESET_PALETTES.map((p) => {
                const isSelected = paletteId === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPaletteId(p.id)}
                    className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition cursor-pointer ${
                      isSelected
                        ? "border-emerald-600 bg-emerald-50/60 ring-1 ring-emerald-600"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex -space-x-1 shrink-0">
                      <div
                        className="w-5 h-5 rounded-full border border-slate-200"
                        style={{ backgroundColor: p.primary }}
                      />
                      <div
                        className="w-5 h-5 rounded-full border border-slate-200"
                        style={{ backgroundColor: p.accent }}
                      />
                    </div>
                    <span className="text-xs font-bold text-slate-800 truncate">
                      {p.name.split(" ")[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Optional CDS Logo Upload */}
          <div className="flex flex-col gap-2 pt-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex justify-between">
              <span>Optional CDS Emblem Logo</span>
              <span className="text-[11px] font-normal text-slate-400">
                Shown alongside official NYSC Crest
              </span>
            </label>
            <div className="flex items-center gap-4">
              {existingLogoUrl && (
                <img
                  src={existingLogoUrl}
                  alt="Existing Logo"
                  className="w-12 h-12 object-contain rounded-xl border border-slate-200 p-1"
                />
              )}
              <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 cursor-pointer transition">
                <Upload className="w-4 h-4 text-emerald-600" />
                <span>{logoFile ? logoFile.name : "Upload CDS Logo (PNG/SVG)"}</span>
                <input
                  type="file"
                  accept="image/png,image/svg+xml,image/jpeg"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) setLogoFile(f);
                  }}
                />
              </label>
            </div>
          </div>
        </div>

        {/* 3. Fields Configuration */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">3. Form Fields Builder</h2>
              <p className="text-xs text-slate-500">
                Toggle default fields or add custom fields. Max 7 total display rows per card.
              </p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                activeFieldsCount > 7
                  ? "bg-red-50 text-red-700"
                  : "bg-emerald-50 text-emerald-700"
              }`}
            >
              {activeFieldsCount} / 7 slots active
            </span>
          </div>

          {/* Default fields list */}
          <div className="flex flex-col gap-3">
            {defaultFields.map((df, idx) => (
              <div
                key={df.key}
                className="p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id={`df_${df.key}`}
                    checked={df.enabled}
                    onChange={(e) => {
                      const updated = [...defaultFields];
                      updated[idx].enabled = e.target.checked;
                      setDefaultFields(updated);
                    }}
                    className="w-4 h-4 rounded-md accent-emerald-600 cursor-pointer"
                  />
                  <label
                    htmlFor={`df_${df.key}`}
                    className="text-xs font-bold text-slate-800 cursor-pointer flex items-center gap-2"
                  >
                    <span>{df.label}</span>
                    {(df.key === "tiktok" || df.key === "instagram" || df.key === "x") && (
                      <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                        Shares Socials slot
                      </span>
                    )}
                  </label>
                </div>

                <div className="flex items-center gap-3">
                  <label className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={df.required}
                      disabled={!df.enabled}
                      onChange={(e) => {
                        const updated = [...defaultFields];
                        updated[idx].required = e.target.checked;
                        setDefaultFields(updated);
                      }}
                      className="w-3.5 h-3.5 accent-emerald-600"
                    />
                    <span>Required</span>
                  </label>
                </div>
              </div>
            ))}
          </div>

          {/* Custom Fields Section */}
          <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Custom Fields ({customFields.length}/5)
              </span>
              <button
                type="button"
                onClick={handleAddCustomField}
                disabled={customFields.length >= 5}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer disabled:opacity-40"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Custom Field</span>
              </button>
            </div>

            {customFields.map((cf, idx) => (
              <div
                key={cf.id}
                className="p-3 rounded-2xl border border-slate-200 bg-slate-50/50 flex items-center gap-3"
              >
                <input
                  type="text"
                  value={cf.label}
                  onChange={(e) => {
                    const updated = [...customFields];
                    updated[idx].label = e.target.value;
                    setCustomFields(updated);
                  }}
                  placeholder="Field label e.g. Nickname"
                  className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold outline-hidden"
                />
                <label className="text-[11px] font-semibold text-slate-500 flex items-center gap-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={cf.required}
                    onChange={(e) => {
                      const updated = [...customFields];
                      updated[idx].required = e.target.checked;
                      setCustomFields(updated);
                    }}
                    className="w-3.5 h-3.5 accent-emerald-600"
                  />
                  <span>Required</span>
                </label>
                <button
                  type="button"
                  onClick={() => setCustomFields(customFields.filter((_, i) => i !== idx))}
                  className="p-1.5 text-slate-400 hover:text-red-500 transition cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Roles & Exco Code Barricade */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 flex flex-col gap-6">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
            4. CDS Roles & Exco Protection
          </h2>

          {/* Exco Code */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex justify-between">
              <span>Optional Exco Secret Passcode</span>
              <span className="text-[11px] font-normal text-slate-400">
                Share only in your Exco WhatsApp group
              </span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type={showExcoCode ? "text" : "password"}
                value={excoCode}
                onChange={(e) => setExcoCode(e.target.value)}
                placeholder="e.g. TBC26X (leave blank if all roles are open)"
                className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-600 text-xs font-mono font-bold uppercase outline-hidden"
              />
              {excoCode && (
                <button
                  type="button"
                  onClick={() => setShowExcoCode(!showExcoCode)}
                  className="absolute right-3.5 top-2.5 text-slate-400 hover:text-slate-600 transition p-0.5 cursor-pointer"
                  title={showExcoCode ? "Hide passcode" : "Show passcode"}
                >
                  {showExcoCode ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Role list */}
          <div className="flex flex-col gap-2 pt-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Role Options in Dropdown
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {roleOptions.map((ro, idx) => (
                <span
                  key={ro.label}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800"
                >
                  <span>{ro.label}</span>
                  {ro.isExco && (
                    <span className="text-[10px] text-amber-600 font-extrabold">★ Exco</span>
                  )}
                  <button
                    type="button"
                    onClick={() => setRoleOptions(roleOptions.filter((_, i) => i !== idx))}
                    className="text-slate-400 hover:text-red-500 ml-1 cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            {/* Add Role input */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newRoleInput}
                onChange={(e) => setNewRoleInput(e.target.value)}
                placeholder="New role (e.g. Project Director)"
                className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold outline-hidden"
              />
              <label className="text-xs font-bold text-slate-600 flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newRoleIsExco}
                  onChange={(e) => setNewRoleIsExco(e.target.checked)}
                  className="w-4 h-4 accent-amber-500"
                />
                <span>Exco Role</span>
              </label>
              <button
                type="button"
                onClick={handleAddRoleOption}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer"
              >
                Add Role
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Save Bar */}
        <div className="flex justify-end pb-8">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSubmitting ? "Saving..." : "Save & Publish Batch"}</span>
          </button>
        </div>
      </main>
    </div>
  );
};
