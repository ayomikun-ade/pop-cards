import React, { useEffect, useRef, useState } from "react";
import { TemplateId, ColorPalette } from "../types";
import { renderCard } from "../templates";
import { PRESET_PALETTES } from "../utils/palettes";

interface TemplateThumbnailProps {
  templateId: TemplateId;
  paletteId?: string;
  cdsName?: string;
  batchName?: string;
}

export const TemplateThumbnail: React.FC<TemplateThumbnailProps> = ({
  templateId,
  paletteId = "nysc-classic",
  cdsName = "TBC CDS GROUP",
  batchName = "2026 BATCH A",
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isRendered, setIsRendered] = useState(false);

  useEffect(() => {
    let active = true;

    const render = async () => {
      if (!canvasRef.current) return;
      const palette: ColorPalette =
        PRESET_PALETTES.find((p) => p.id === paletteId) || PRESET_PALETTES[0];

      try {
        await renderCard({
          canvas: canvasRef.current,
          templateId,
          palette,
          cdsName: cdsName || "NYSC CDS GROUP",
          batchName: batchName || "2026 BATCH A",
          nyscLogoUrl: "/nysc-logo.png",
          cdsLogoUrl: "/sample-cds-logo.svg",
          member: {
            fullName: "Adebayo Olawale",
            photoUrl: "/sample-image.png",
            role: "President",
            skills: ["Brand Design", "Photography"],
            tiktok: "@adebayo_pop",
            instagram: "@adebayo.pop",
            x: "@adebayo_pop",
            hobbies: ["Travel", "Chess"],
            afterPop: "Launching my creative studio",
            quote: "Service with humility and purpose.",
            customValues: {},
          },
          displayFields: [
            { label: "CDS Role", value: "President" },
            { label: "Skills", value: "Brand Design, Photography" },
            {
              label: "Socials",
              value: "@adebayo_pop",
              socials: [
                { platform: "instagram", handle: "@adebayo.pop" },
                { platform: "tiktok", handle: "@adebayo_pop" },
              ],
            },
            { label: "After POP?", value: "Launching my creative studio" },
            { label: "Fav Quote", value: "Service with humility and purpose.", isQuote: true },
          ],
        });

        if (active) {
          setIsRendered(true);
        }
      } catch (err) {
        console.error(`Failed to render thumbnail for template ${templateId}:`, err);
      }
    };

    render();

    return () => {
      active = false;
    };
  }, [templateId, paletteId, cdsName, batchName]);

  return (
    <div className="relative w-full aspect-[4/5] rounded-xl overflow-hidden bg-slate-100 border border-slate-200/80">
      <canvas
        ref={canvasRef}
        className={`w-full h-full object-contain transition-opacity duration-200 ${
          isRendered ? "opacity-100" : "opacity-0"
        }`}
      />
      {!isRendered && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100 animate-pulse text-[11px] font-bold text-slate-400">
          Loading preview...
        </div>
      )}
    </div>
  );
};
