import { TemplateId } from "../types";
import { RenderContext, renderClassicWave } from "./classicWave";
// import { renderBoldSplit } from "./boldSplit";
import { renderPolaroid } from "./polaroid";
import { renderSpotlight } from "./spotlight";
import { ensureFontsLoaded } from "../utils/canvasHelpers";

export interface TemplateDefinition {
  id: TemplateId;
  name: string;
  description: string;
  render: (ctx: RenderContext) => Promise<void>;
  cropAspect: number; // e.g. 445/1080 ~ 0.41 or 1:1 or 4:5
  recommendedCropShape: "rect" | "round";
}

export const TEMPLATES: Record<TemplateId, TemplateDefinition> = {
  "classic-wave": {
    id: "classic-wave",
    name: "Classic Wave",
    description:
      "The authentic NYSC wave design with green top header, portrait on left, and dynamic field rows on right.",
    render: renderClassicWave,
    cropAspect: 460 / 550, // Square-like / 4:5 natural proportion
    recommendedCropShape: "rect",
  },
  // 'bold-split': {
  //  id: 'bold-split',
  //  name: 'Bold Split',
  //  description: 'High-impact split layout with generous portrait card and clean editorial typography.',
  //  render: renderBoldSplit,
  //  cropAspect: 460 / 550, // Square-like / 4:5 natural proportion
  //  recommendedCropShape: 'rect',
  //},
  polaroid: {
    id: "polaroid",
    name: "Polaroid Memory",
    description:
      "Nostalgic souvenir polaroid frame with prominent stamped name and authentic detail columns.",
    render: renderPolaroid,
    cropAspect: 620 / 490, // Classic polaroid photo window
    recommendedCropShape: "rect",
  },
  spotlight: {
    id: "spotlight",
    name: "Spotlight Prestige",
    description:
      "Editorial luxury design featuring a framed portrait and balanced two-column detail grid.",
    render: renderSpotlight,
    cropAspect: 4 / 5, // 0.80 elegant editorial portrait
    recommendedCropShape: "rect",
  },
};

export async function renderCard(
  ctx: RenderContext & { templateId: TemplateId },
): Promise<void> {
  await ensureFontsLoaded();
  const template = TEMPLATES[ctx.templateId] || TEMPLATES["classic-wave"];
  await template.render(ctx);
}
