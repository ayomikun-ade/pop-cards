import React, { useEffect, useRef, useState } from 'react';
import { BatchConfig, CardMemberData, CardDisplayField } from '../types';
import { renderCard, TEMPLATES } from '../templates';
import { Download, Share2, Sparkles, RefreshCw } from 'lucide-react';

interface CardPreviewProps {
  batch: BatchConfig;
  member: CardMemberData;
  displayFields: CardDisplayField[];
}

export const CardPreview: React.FC<CardPreviewProps> = ({
  batch,
  member,
  displayFields,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isRendering, setIsRendering] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    const doRender = async () => {
      if (!canvasRef.current) return;
      setIsRendering(true);

      try {
        await renderCard({
          canvas: canvasRef.current,
          templateId: batch.templateId,
          palette: batch.palette,
          cdsName: batch.cdsName,
          batchName: batch.batchName,
          nyscLogoUrl: '/nysc-logo.png',
          cdsLogoUrl: batch.logoUrl || '/sample-cds-logo.svg',
          member,
          displayFields,
        });
      } catch (err) {
        console.error('Error rendering card canvas:', err);
      } finally {
        if (!isCancelled) {
          setIsRendering(false);
        }
      }
    };

    doRender();

    return () => {
      isCancelled = true;
    };
  }, [batch, member, displayFields]);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    try {
      const dataUrl = canvasRef.current.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      const safeName = (member.fullName || 'corps_member')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_');
      link.download = `${safeName}_pop_card.png`;
      link.href = dataUrl;
      link.click();

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3500);
    } catch (e) {
      console.error('Download failed:', e);
    }
  };

  const handleShare = async () => {
    if (!canvasRef.current) return;
    try {
      if (navigator.share && canvasRef.current.toBlob) {
        canvasRef.current.toBlob(async (blob) => {
          if (!blob) return;
          const file = new File([blob], `${(member.fullName || 'card').replace(/\s+/g, '_')}.png`, {
            type: 'image/png',
          });
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: `${member.fullName || 'NYSC'} POP Card`,
              text: `Check out my NYSC Passing-Out Profile Card! 🎓🇳🇬 (${batch.cdsName})`,
            });
            return;
          }
          // Fallback to URL sharing or download
          handleDownload();
        });
      } else {
        handleDownload();
      }
    } catch (e) {
      console.warn('Share not completed', e);
      handleDownload();
    }
  };

  const activeTemplate = TEMPLATES[batch.templateId] || TEMPLATES['classic-wave'];

  return (
    <div className="flex flex-col items-center">
      {/* Live Canvas Display Container */}
      <div className="relative w-full max-w-sm sm:max-w-md aspect-[4/5] rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 flex items-center justify-center">
        <canvas
          ref={canvasRef}
          className="w-full h-full object-contain"
          style={{ width: '100%', height: '100%' }}
        />

        {isRendering && (
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center text-white text-sm font-medium gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-amber-400" />
            <span>Updating card...</span>
          </div>
        )}
      </div>

      {/* Template Badge */}
      <div className="mt-3 flex items-center gap-2 text-xs text-slate-500 font-medium">
        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
        <span>Template: <strong className="text-slate-700">{activeTemplate.name}</strong></span>
        <span>•</span>
        <span>Output: 1080×1350 px (HD)</span>
      </div>

      {/* Action Buttons */}
      <div className="mt-5 w-full max-w-sm sm:max-w-md flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={handleDownload}
          className="flex-1 py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold flex items-center justify-center gap-2 transition"
        >
          <Download className="w-5 h-5" />
          <span>{downloadSuccess ? 'Downloaded!' : 'Download Card (PNG)'}</span>
        </button>

        {typeof navigator !== 'undefined' && 'share' in navigator && (
          <button
            type="button"
            onClick={handleShare}
            className="py-3.5 px-5 rounded-xl bg-slate-800 hover:bg-slate-900 active:scale-[0.98] text-white font-semibold flex items-center justify-center gap-2 transition"
            title="Share to WhatsApp, Instagram or save to Photos"
          >
            <Share2 className="w-5 h-5 text-amber-400" />
            <span className="hidden sm:inline">Share</span>
          </button>
        )}
      </div>

      {downloadSuccess && (
        <p className="mt-2 text-xs font-semibold text-emerald-600 animate-in fade-in">
          ✓ High resolution card saved directly to your device storage!
        </p>
      )}
    </div>
  );
};
