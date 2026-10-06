import React, { useState, useMemo } from 'react';
import { BatchConfig, CardMemberData, TemplateId } from '../types';
import { INITIAL_BATCH_CONFIG, INITIAL_MEMBER_DATA } from '../utils/initialData';
import { PRESET_PALETTES } from '../utils/palettes';
import { formatDisplayFields } from '../utils/formatDisplayFields';
import { CardPreview } from '../components/CardPreview';
import { MemberCardForm } from '../components/MemberCardForm';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Palette,
  Eye,
  Edit3,
  Sliders,
  Check,
  Lock,
} from 'lucide-react';

export const GeneratorHomePage: React.FC = () => {
  const [batch, setBatch] = useState<BatchConfig>(INITIAL_BATCH_CONFIG);
  const [member, setMember] = useState<CardMemberData>(INITIAL_MEMBER_DATA);
  const [mobileTab, setMobileTab] = useState<'form' | 'preview'>('form');
  const [showStylePanel, setShowStylePanel] = useState(false);

  // Compute active 7-item display fields
  const displayFields = useMemo(() => {
    return formatDisplayFields(batch, member);
  }, [batch, member]);

  const handleMemberChange = (updated: Partial<CardMemberData>) => {
    setMember((prev) => ({ ...prev, ...updated }));
  };

  const handleTemplateChange = (t: TemplateId) => {
    setBatch((prev) => ({ ...prev, templateId: t }));
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-black text-lg">
              P
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-slate-900 text-lg tracking-tight">POPCards</h1>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider">
                  NYSC Yearbook
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Free Passing-Out Profile Card Generator • 100% Client-side
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowStylePanel(!showStylePanel)}
              className="px-3.5 py-2 rounded-xl border border-slate-200 hover:border-slate-300 bg-white text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Palette className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">Theme Colors</span>
            </button>

            <Link
              to="/login"
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 transition"
            >
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Admin Portal</span>
            </Link>
          </div>
        </div>

        {/* Slide-down Palette Drawer */}
        {showStylePanel && (
          <div className="bg-slate-50 border-b border-slate-200 px-4 py-4 animate-in slide-in-from-top duration-200">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-emerald-600" />
                  Preset Color Themes
                </span>
                <span className="text-xs text-slate-400">Theme applies instantly to your card</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                {PRESET_PALETTES.map((p) => {
                  const isSelected = batch.palette.id === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setBatch((prev) => ({ ...prev, palette: p }))}
                      className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition ${
                        isSelected
                          ? 'border-emerald-600 bg-white'
                          : 'border-slate-200 hover:border-slate-300 bg-white/70'
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
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate">{p.name}</p>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Mobile Tab Switcher */}
        <div className="sm:hidden flex border-t border-slate-200 bg-white">
          <button
            type="button"
            onClick={() => setMobileTab('form')}
            className={`flex-1 py-3 text-xs font-bold flex items-center justify-center gap-1.5 border-b-2 transition ${
              mobileTab === 'form'
                ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50'
                : 'border-transparent text-slate-500'
            }`}
          >
            <Edit3 className="w-4 h-4" />
            Edit Info
          </button>
          <button
            type="button"
            onClick={() => setMobileTab('preview')}
            className={`flex-1 py-3 text-xs font-bold flex items-center justify-center gap-1.5 border-b-2 transition ${
              mobileTab === 'preview'
                ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50'
                : 'border-transparent text-slate-500'
            }`}
          >
            <Eye className="w-4 h-4" />
            Live Preview
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex-1 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Form Area */}
          <div
            className={`lg:col-span-7 ${
              mobileTab === 'form' ? 'block' : 'hidden lg:block'
            }`}
          >
            <MemberCardForm
              batch={batch}
              member={member}
              onChange={handleMemberChange}
              onTemplateChange={handleTemplateChange}
            />
          </div>

          {/* Right Card Preview Area (Sticky on Desktop) */}
          <div
            className={`lg:col-span-5 lg:sticky lg:top-24 ${
              mobileTab === 'preview' ? 'block' : 'hidden lg:block'
            }`}
          >
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 flex flex-col items-center">
              <div className="w-full flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Live Card Preview
                </span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                  {displayFields.length} / 7 slots
                </span>
              </div>

              <CardPreview
                batch={batch}
                member={member}
                displayFields={displayFields}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500">
          <p>
            POPCards • Designed for National Youth Service Corps (NYSC) CDS Groups across Nigeria.
          </p>
          <p className="mt-1 text-[11px] text-slate-400">
            100% Client-Side Engine • Zero storage fees • Instant high-DPI social media exports
          </p>
        </div>
      </footer>
    </div>
  );
};
