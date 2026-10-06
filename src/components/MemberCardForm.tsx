import React, { useState } from "react";
import { BatchConfig, CardMemberData, TemplateId } from "../types";
import { TEMPLATES } from "../templates";
import { ImageCropperModal } from "./ImageCropperModal";
import {
  Upload,
  Camera,
  Lock,
  Unlock,
  Sparkles,
  CheckCircle2,
  Eye,
  EyeOff,
} from "lucide-react";

interface MemberCardFormProps {
  batch: BatchConfig;
  member: CardMemberData;
  onChange: (updated: Partial<CardMemberData>) => void;
  onTemplateChange?: (t: TemplateId) => void;
}

export const MemberCardForm: React.FC<MemberCardFormProps> = ({
  batch,
  member,
  onChange,
  onTemplateChange,
}) => {
  const [cropperOpen, setCropperOpen] = useState(false);
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);
  const [excoCodeInput, setExcoCodeInput] = useState("");
  const [showExcoInput, setShowExcoInput] = useState(false);
  const [isExcoUnlocked, setIsExcoUnlocked] = useState(false);
  const [excoError, setExcoError] = useState(false);

  const activeTemplate =
    TEMPLATES[batch.templateId] || TEMPLATES["classic-wave"];

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setRawImageSrc(reader.result as string);
      setCropperOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCroppedPhoto = (croppedDataUrl: string) => {
    onChange({ photoUrl: croppedDataUrl });
  };

  const handleVerifyExcoCode = () => {
    // Basic frontend check for now (Convex server mutation will back this in Phase 2)
    if (excoCodeInput.trim().length >= 3) {
      setIsExcoUnlocked(true);
      setExcoError(false);
    } else {
      setExcoError(true);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 flex flex-col gap-6">
      {/* Header Info */}
      <div className="border-b border-slate-100 pb-5">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold mb-2">
          <span>{batch.batchName}</span>
          <span>•</span>
          <span>{batch.cdsName}</span>
        </div>
        <h2 className="text-2xl font-black text-slate-800">
          Create Your POP Card
        </h2>
        <p className="text-slate-500 text-sm mt-1">
          Fill in your details below. Your card updates in real-time as you
          type!
        </p>
      </div>

      {/* Template Selector (Optional switcher for member or preview) */}
      {onTemplateChange && (
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Card Style Template
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(Object.keys(TEMPLATES) as TemplateId[]).map((tid) => {
              const tmpl = TEMPLATES[tid];
              const isSelected = batch.templateId === tid;
              return (
                <button
                  key={tid}
                  type="button"
                  onClick={() => onTemplateChange(tid)}
                  className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                    isSelected
                      ? "border-emerald-600 bg-emerald-50/70 text-emerald-900"
                      : "border-slate-200 hover:border-slate-300 text-slate-600 bg-slate-50/50"
                  }`}
                >
                  <span className="font-bold text-xs">{tmpl.name}</span>
                  <span className="text-[10px] text-slate-400 mt-1 line-clamp-1">
                    {tmpl.recommendedCropShape}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 1. Photo Upload & Cropper Trigger */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center justify-between">
          <span>Portrait Photograph *</span>
          <span className="text-[11px] font-normal text-slate-400">
            NYSC Khaki / White recommended
          </span>
        </label>

        <div className="flex items-center gap-4">
          <div className="relative w-24 h-28 rounded-xl bg-slate-100 border-2 border-dashed border-slate-300 overflow-hidden flex items-center justify-center shrink-0">
            {member.photoUrl ? (
              <img
                src={member.photoUrl}
                alt="Portrait"
                className="w-full h-full object-cover"
              />
            ) : (
              <Camera className="w-8 h-8 text-slate-400" />
            )}
          </div>

          <div className="flex-1 flex flex-col gap-2">
            <label className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer transition">
              <Upload className="w-4 h-4 text-emerald-400" />
              <span>
                {member.photoUrl ? "Change Photo" : "Upload Portrait"}
              </span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageFileChange}
              />
            </label>

            {member.photoUrl && (
              <button
                type="button"
                onClick={() => setCropperOpen(true)}
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 text-left underline"
              >
                Re-crop / Adjust position
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Full Name Input */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
          Full Name *
        </label>
        <input
          type="text"
          value={member.fullName}
          maxLength={45}
          onChange={(e) => onChange({ fullName: e.target.value })}
          placeholder="e.g. ADESOKO DORCAS FERANMI"
          className="px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 text-slate-800 text-sm font-semibold outline-hidden transition"
        />
        <div className="flex justify-between text-[11px] text-slate-400 px-1">
          <span>Displayed prominently as the main card header</span>
          <span>{member.fullName.length}/45</span>
        </div>
      </div>

      {/* 3. CDS Role (with Exco Code Guard if configured) */}
      {batch.defaultFields.find((f) => f.key === "role")?.enabled && (
        <div className="flex flex-col gap-1.5 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
              CDS Role
            </label>
            {batch.hasExcoCode && !isExcoUnlocked && (
              <span className="text-[11px] font-semibold text-amber-600 flex items-center gap-1">
                <Lock className="w-3 h-3" /> Exco roles protected
              </span>
            )}
            {isExcoUnlocked && (
              <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                <Unlock className="w-3 h-3" /> Exco unlocked
              </span>
            )}
          </div>

          <select
            value={member.role || "Member"}
            onChange={(e) => onChange({ role: e.target.value })}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 text-slate-800 text-sm font-medium outline-hidden"
          >
            <option value="Member">Member</option>
            {batch.roleOptions
              .filter((r) => !r.isExco || isExcoUnlocked)
              .map((r) => (
                <option key={r.label} value={r.label}>
                  {r.label} {r.isExco ? "★" : ""}
                </option>
              ))}
          </select>

          {/* Exco Code Entry if user is an executive */}
          {batch.hasExcoCode && !isExcoUnlocked && (
            <div className="mt-2 pt-2 border-t border-slate-200 flex items-center gap-2">
              <div className="relative">
                <input
                  type={showExcoInput ? "text" : "password"}
                  value={excoCodeInput}
                  onChange={(e) => {
                    setExcoCodeInput(e.target.value);
                    setExcoError(false);
                  }}
                  placeholder="CDS Exco Code"
                  className="pl-3 pr-8 py-1.5 text-xs rounded-lg border border-slate-300 focus:border-emerald-600 outline-hidden w-38 uppercase font-mono"
                />
                {excoCodeInput && (
                  <button
                    type="button"
                    onClick={() => setShowExcoInput(!showExcoInput)}
                    className="absolute right-2 top-2 text-slate-400 hover:text-slate-600 transition p-0.5 cursor-pointer"
                    title={showExcoInput ? "Hide code" : "Show code"}
                  >
                    {showExcoInput ? (
                      <EyeOff className="w-3.5 h-3.5" />
                    ) : (
                      <Eye className="w-3.5 h-3.5" />
                    )}
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={handleVerifyExcoCode}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold transition cursor-pointer"
              >
                Unlock Exco
              </button>
              {excoError && (
                <span className="text-[11px] text-red-500">Invalid code</span>
              )}
            </div>
          )}
        </div>
      )}

      {/* 4. Skills (Max 5 items, comma separated) */}
      {batch.defaultFields.find((f) => f.key === "skills")?.enabled && (
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex justify-between">
            <span>Skills</span>
            <span className="text-[11px] font-normal text-slate-400">
              Comma separated (max 5)
            </span>
          </label>
          <input
            type="text"
            value={(member.skills || []).join(", ")}
            maxLength={60}
            onChange={(e) => {
              const items = e.target.value
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean)
                .slice(0, 5);
              onChange({ skills: items });
            }}
            placeholder="e.g. Graphic Design, Public Speaking, UI/UX"
            className="px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 text-slate-800 text-sm outline-hidden"
          />
        </div>
      )}

      {/* 5. Social Handles (Separate fields as requested) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {batch.defaultFields.find((f) => f.key === "tiktok")?.enabled && (
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold uppercase text-slate-600">
              TikTok
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-400 text-xs font-bold">
                @
              </span>
              <input
                type="text"
                value={member.tiktok?.replace(/^@/, "") || ""}
                maxLength={25}
                onChange={(e) =>
                  onChange({ tiktok: e.target.value.replace(/^@/, "") })
                }
                placeholder="username"
                className="w-full pl-7 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-emerald-600 outline-hidden font-medium"
              />
            </div>
          </div>
        )}

        {batch.defaultFields.find((f) => f.key === "instagram")?.enabled && (
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold uppercase text-slate-600">
              Instagram
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-400 text-xs font-bold">
                @
              </span>
              <input
                type="text"
                value={member.instagram?.replace(/^@/, "") || ""}
                maxLength={25}
                onChange={(e) =>
                  onChange({ instagram: e.target.value.replace(/^@/, "") })
                }
                placeholder="username"
                className="w-full pl-7 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-emerald-600 outline-hidden font-medium"
              />
            </div>
          </div>
        )}

        {batch.defaultFields.find((f) => f.key === "x")?.enabled && (
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold uppercase text-slate-600">
              X (Twitter)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-400 text-xs font-bold">
                @
              </span>
              <input
                type="text"
                value={member.x?.replace(/^@/, "") || ""}
                maxLength={25}
                onChange={(e) =>
                  onChange({ x: e.target.value.replace(/^@/, "") })
                }
                placeholder="username"
                className="w-full pl-7 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-emerald-600 outline-hidden font-medium"
              />
            </div>
          </div>
        )}
      </div>

      {/* 6. Hobbies */}
      {batch.defaultFields.find((f) => f.key === "hobbies")?.enabled && (
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex justify-between">
            <span>Hobbies</span>
            <span className="text-[11px] font-normal text-slate-400">
              Comma separated (max 5)
            </span>
          </label>
          <input
            type="text"
            value={(member.hobbies || []).join(", ")}
            maxLength={60}
            onChange={(e) => {
              const items = e.target.value
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean)
                .slice(0, 5);
              onChange({ hobbies: items });
            }}
            placeholder="e.g. Cooking, Traveling, Reading, Music"
            className="px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 text-slate-800 text-sm outline-hidden"
          />
        </div>
      )}

      {/* 7. After POP? */}
      {batch.defaultFields.find((f) => f.key === "afterPop")?.enabled && (
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
            After POP? (Next Chapter)
          </label>
          <input
            type="text"
            value={member.afterPop || ""}
            maxLength={85}
            onChange={(e) => onChange({ afterPop: e.target.value })}
            placeholder="e.g. Secure a great tech job, travel, and grow my startup"
            className="px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 text-slate-800 text-sm outline-hidden"
          />
          <div className="flex justify-between text-[11px] text-slate-400 px-1">
            <span>Keep it inspiring and concise</span>
            <span>{(member.afterPop || "").length}/85</span>
          </div>
        </div>
      )}

      {/* 8. Favorite Quote / Motto */}
      {batch.defaultFields.find((f) => f.key === "quote")?.enabled && (
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Favorite Quote / Bible Verse / Motto
          </label>
          <textarea
            rows={2}
            value={member.quote || ""}
            maxLength={115}
            onChange={(e) => onChange({ quote: e.target.value })}
            placeholder="e.g. I can do all things through Christ who strengthens me"
            className="px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 text-slate-800 text-sm outline-hidden resize-none"
          />
          <div className="flex justify-between text-[11px] text-slate-400 px-1">
            <span>Formatted in quotation marks on the card</span>
            <span>{(member.quote || "").length}/115</span>
          </div>
        </div>
      )}

      {/* 9. Custom Batch Fields (if any defined by admin) */}
      {batch.customFields.map((cf) => (
        <div key={cf.id} className="flex flex-col gap-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
            {cf.label} {cf.required && "*"}
          </label>
          <input
            type="text"
            value={member.customValues?.[cf.id] || ""}
            maxLength={cf.maxLength || 45}
            onChange={(e) =>
              onChange({
                customValues: {
                  ...(member.customValues || {}),
                  [cf.id]: e.target.value,
                },
              })
            }
            placeholder={cf.placeholder || `Enter ${cf.label}`}
            className="px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 text-slate-800 text-sm outline-hidden"
          />
        </div>
      ))}

      {/* Privacy Guarantee Note */}
      <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 flex items-start gap-3 text-xs text-emerald-800">
        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        <span>
          <strong>100% Privacy:</strong> Your photo and answers are generated
          directly inside your browser. No personal photos are stored on our
          servers.
        </span>
      </div>

      {/* Image Cropper Modal */}
      {rawImageSrc && (
        <ImageCropperModal
          imageSrc={rawImageSrc}
          aspect={activeTemplate.cropAspect}
          cropShape={activeTemplate.recommendedCropShape}
          isOpen={cropperOpen}
          onClose={() => setCropperOpen(false)}
          onCropComplete={handleCroppedPhoto}
        />
      )}
    </div>
  );
};
