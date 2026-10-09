import React from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheck,
  Zap,
  CheckCircle,
  ArrowRight,
  Palette,
  Smartphone,
} from "lucide-react";
import { TEMPLATES } from "../templates";
import { TemplateThumbnail } from "../components/TemplateThumbnail";
import { TemplateId } from "../types";

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-emerald-500 selection:text-white">
      {/* 1. Header / Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-white font-black text-xl shadow-xs">
              P
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-slate-900 text-lg tracking-tight">
                  POPCards
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider">
                  NYSC
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Passing-Out Profile Cards for Nigerian Corps Members
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition"
            >
              Exco Admin Login
            </Link>
            <Link
              to="/login"
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 sm:pt-24 sm:pb-28 border-b border-slate-200 bg-linear-to-b from-white via-slate-50 to-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mx-auto text-center flex flex-col items-center">
            {/* Headline */}
            <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
              Passing-Out Profile Cards Made for{" "}
              <span className="text-emerald-600 underline decoration-emerald-200 decoration-wavy decoration-2">
                Every NYSC CDS
              </span>
            </h1>

            {/* Subheading */}
            <p className="mt-6 text-base sm:text-lg text-slate-600 leading-relaxed font-medium">
              Eliminate costly graphic designers and endless WhatsApp
              back-and-forths. CDS Excos set up a custom batch link in 60
              seconds — corps members fill their details and export HD
              commemorative POP cards right on their phones.
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <Link
                to="/login"
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2 transition shadow-md"
              >
                <span>Create CDS Batch Link</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#templates"
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl border border-slate-300 hover:border-slate-400 bg-white text-slate-700 font-bold text-sm flex items-center justify-center gap-2 transition"
              >
                <Palette className="w-4 h-4 text-emerald-600" />
                <span>Explore Card Templates</span>
              </a>
            </div>

            {/* Trust bullet badges */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 font-semibold">
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Zero Server Storage Fees</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>100% Client-Side Canvas Engine</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Instant High-DPI PNG Exports</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Showcase Templates Section */}
      <section
        id="templates"
        className="py-20 border-b border-slate-200 bg-white"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-600">
              Handcrafted Layouts
            </span>
            <h2 className="text-3xl font-black text-slate-900 mt-2">
              Authentic Passing-Out Card Templates
            </h2>
            <p className="mt-3 text-slate-600 text-sm">
              Tailored specifically to the NYSC aesthetic with clean editorial
              balance, authentic physical ink stamps, and custom CDS emblems.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {(Object.keys(TEMPLATES) as TemplateId[]).map((tid) => {
              const tmpl = TEMPLATES[tid];
              return (
                <div
                  key={tid}
                  className="bg-slate-50 rounded-3xl p-4 border border-slate-200 flex flex-col justify-between hover:shadow-md transition"
                >
                  <div className="rounded-2xl overflow-hidden border border-slate-200 bg-white mb-4 shadow-2xs">
                    <TemplateThumbnail
                      templateId={tid}
                      paletteId="nysc-classic"
                      cdsName="EDITORIAL CDS"
                      batchName="2026 BATCH A"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="font-extrabold text-sm text-slate-900">
                      {tmpl.name}
                    </span>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {tmpl.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. How It Works Section */}
      <section className="py-20 border-b border-slate-200 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-600">
              Streamlined Process
            </span>
            <h2 className="text-3xl font-black text-slate-900 mt-2">
              How POPCards Works
            </h2>
            <p className="mt-3 text-slate-600 text-sm">
              Zero hassle for CDS Executives. Direct instant delivery for Corps
              Members.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 flex flex-col gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 font-black text-xl flex items-center justify-center">
                1
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Excos Create the Batch
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Log into the Admin Portal, pick a card template, choose color
                accents, upload the CDS group logo, and choose which form
                questions members answer.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 flex flex-col gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 font-black text-xl flex items-center justify-center">
                2
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Share Link on WhatsApp
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Copy your customized batch URL (e.g.{" "}
                <span className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded text-emerald-700 font-bold">
                  {window.location.host}/b/your-cds
                </span>
                ) and paste it into your CDS WhatsApp group.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 flex flex-col gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 font-black text-xl flex items-center justify-center">
                3
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Members Generate & Download
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Corps members upload their portrait, crop it with our intuitive
                touch tool, fill their memories, and immediately download their
                1080×1350px PNG card.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Key Highlights / Benefits */}
      <section className="py-20 border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl border border-slate-200 bg-slate-50/50 flex flex-col gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-base">
                Client-Side Canvas Engine
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Cards are generated directly inside the user's mobile browser.
                No server image rendering queues, no latency, no bandwidth
                costs.
              </p>
            </div>

            <div className="p-6 rounded-3xl border border-slate-200 bg-slate-50/50 flex flex-col gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-base">
                Exco PIN Verification
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Prevent ordinary members from claiming executive titles. Exco
                roles require a secret PIN set by the CDS leadership.
              </p>
            </div>

            <div className="p-6 rounded-3xl border border-slate-200 bg-slate-50/50 flex flex-col gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                <Smartphone className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-base">
                Mobile Touch Image Cropper
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Members crop and zoom their photos effortlessly on Android and
                iPhone with touch gestures, guaranteeing perfect framing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Call to Action Banner */}
      <section className="py-16 bg-slate-900 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center flex flex-col items-center">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
            Ready to set up your CDS POP cards?
          </h2>
          <p className="mt-4 text-slate-300 text-sm max-w-xl">
            Create an admin account, configure your batch in minutes, and let
            your corps members celebrate their passing-out service year in
            style.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Link
              to="/login"
              className="px-8 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-sm transition flex items-center justify-center gap-2 shadow-lg"
            >
              <span>Get Started as Admin</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 7. Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white font-black flex items-center justify-center text-xs">
              P
            </div>
            <span className="font-bold text-slate-800">POPCards</span>
            <span>• Built with pride for NYSC Corps Members</span>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/login" className="hover:text-slate-800 transition">
              Admin Portal
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
