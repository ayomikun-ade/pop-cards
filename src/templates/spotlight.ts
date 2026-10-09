import { RenderContext } from "./classicWave";
import {
  loadImage,
  fitAndWrapText,
  drawRoundedRect,
  drawImageCover,
} from "../utils/canvasHelpers";
import { drawSocialsRow } from "../utils/drawSocialIcons";
import { drawProudlyServedStamp } from "../utils/drawStamp";

export async function renderSpotlight({
  canvas,
  member,
  displayFields,
  palette,
  cdsName,
  batchName,
  nyscLogoUrl,
  cdsLogoUrl,
}: RenderContext): Promise<void> {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const W = 1080;
  const H = 1350;

  canvas.width = W;
  canvas.height = H;

  // 1. Clean Ivory / Classic Card Background
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, W, H);

  // Elegant double framing border
  ctx.strokeStyle = palette.primary;
  ctx.lineWidth = 3;
  ctx.strokeRect(32, 32, W - 64, H - 64);

  ctx.strokeStyle = palette.accent;
  ctx.lineWidth = 1;
  ctx.strokeRect(40, 40, W - 80, H - 80);

  // 2. Editorial Top Header
  try {
    const nyscLogo = await loadImage(nyscLogoUrl);
    ctx.drawImage(nyscLogo, 60, 56, 90, 110);
  } catch (e) {
    console.warn("NYSC logo load error", e);
  }

  if (cdsLogoUrl) {
    try {
      const cdsLogo = await loadImage(cdsLogoUrl);
      ctx.drawImage(cdsLogo, W - 150, 76, 90, 90);
    } catch (e) {
      console.warn("CDS logo load error", e);
    }
  }

  ctx.textAlign = "center";
  ctx.fillStyle = palette.primary;
  ctx.font = "900 24px Montserrat, Inter, sans-serif";
  ctx.fillText("NATIONAL YOUTH SERVICE CORPS", W / 2, 78);

  ctx.font = "700 18px Inter, sans-serif";
  ctx.fillStyle = "#64748B";
  ctx.fillText(
    `${cdsName.toUpperCase()} • ${batchName.toUpperCase()}`,
    W / 2,
    110,
  );

  // Elegant divider line
  ctx.strokeStyle = palette.primary;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(W / 2 - 160, 130);
  ctx.lineTo(W / 2 + 160, 130);
  ctx.stroke();

  // 3. Central Portrait Frame (Generous 4:5 or arched portrait - NOT a slim strip!)
  const photoW = 440;
  const photoH = 550;
  const photoX = (W - photoW) / 2;
  const photoY = 160;
  const photoRadius = 16;

  // Crisp natural photo frame
  ctx.fillStyle = "#FFFFFF";
  drawRoundedRect(ctx, photoX, photoY, photoW, photoH, photoRadius);
  ctx.fill();

  if (member.photoUrl) {
    try {
      const photoImg = await loadImage(member.photoUrl);
      ctx.save();
      drawRoundedRect(ctx, photoX, photoY, photoW, photoH, photoRadius);
      ctx.clip();
      drawImageCover(ctx, photoImg, photoX, photoY, photoW, photoH);
      ctx.restore();
    } catch (e) {
      console.warn("Spotlight photo render error", e);
    }
  } else {
    ctx.fillStyle = "#F8FAFC";
    drawRoundedRect(ctx, photoX, photoY, photoW, photoH, photoRadius);
    ctx.fill();
    ctx.font = "600 26px Inter, sans-serif";
    ctx.fillStyle = "#94A3B8";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(
      "Portrait Photo (4:5)",
      photoX + photoW / 2,
      photoY + photoH / 2,
    );
  }

  // Double border on portrait
  ctx.strokeStyle = "#FFFFFF";
  ctx.lineWidth = 6;
  drawRoundedRect(ctx, photoX, photoY, photoW, photoH, photoRadius);
  ctx.stroke();

  ctx.strokeStyle = palette.accent;
  ctx.lineWidth = 2;
  drawRoundedRect(
    ctx,
    photoX - 2,
    photoY - 2,
    photoW + 4,
    photoH + 4,
    photoRadius + 2,
  );
  ctx.stroke();

  // "PROUDLY SERVED" Authentic physical ink stamp overlapping lower-right corner of portrait
  drawProudlyServedStamp(
    ctx,
    photoX + photoW - 25,
    photoY + photoH - 20,
    60,
    palette.primary,
    -14,
  );

  // 4. Corper Name Heading
  const nameUpper = (member.fullName || "CORPS MEMBER").toUpperCase();
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillStyle = palette.headingColor;

  const { lines: nameLines, lineHeight: nameLineHeight } = fitAndWrapText(
    ctx,
    nameUpper,
    880,
    2,
    42,
    28,
    "Montserrat, Inter, sans-serif",
    900,
  );

  let nameY = photoY + photoH + 24;
  for (const line of nameLines) {
    ctx.fillText(line, W / 2, nameY);
    nameY += nameLineHeight;
  }

  // Thin gold rule under name
  ctx.fillStyle = palette.accent;
  ctx.fillRect(W / 2 - 40, nameY + 6, 80, 3);

  // 5. Details Section (Clean authentic editorial two-column layout - NO AI rounded boxes!)
  const detailsY = nameY + 30;
  const colWidth = 440;
  const leftX = 75;
  const rightX = W / 2 + 25;

  const visibleFields = displayFields.slice(0, 6);

  visibleFields.forEach((field, idx) => {
    if (!field.value && (!field.socials || field.socials.length === 0)) return;

    const isLeft = idx % 2 === 0;
    const row = Math.floor(idx / 2);
    const fx = isLeft ? leftX : rightX;
    const fy = detailsY + row * 95;

    // Subtle fine hairline divider
    ctx.strokeStyle = "#E2E8F0";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(fx, fy - 8);
    ctx.lineTo(fx + colWidth, fy - 8);
    ctx.stroke();

    // Label
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.font = "800 16px Montserrat, Inter, sans-serif";
    ctx.fillStyle = palette.primary;
    ctx.fillText(field.label.toUpperCase(), fx, fy);

    const valY = fy + 22;

    // Socials with vector icons
    if (field.socials && field.socials.length > 0) {
      drawSocialsRow(
        ctx,
        field.socials,
        fx,
        valY + 12,
        palette.primary,
        "#1E293B",
        20,
      );
    } else if (field.isQuote) {
      ctx.font = "500 20px Inter, sans-serif";
      ctx.fillStyle = "#334155";
      const { lines } = fitAndWrapText(
        ctx,
        `"${field.value.trim()}"`,
        colWidth,
        2,
        20,
        15,
        "Inter, sans-serif",
        "italic 500",
      );
      for (let i = 0; i < lines.length; i++) {
        ctx.fillText(lines[i], fx, valY + i * 24);
      }
    } else {
      ctx.font = "600 21px Inter, sans-serif";
      ctx.fillStyle = "#1E293B";
      const { lines } = fitAndWrapText(
        ctx,
        field.value,
        colWidth,
        2,
        21,
        16,
        "Inter, sans-serif",
        600,
      );
      for (let i = 0; i < lines.length; i++) {
        ctx.fillText(lines[i], fx, valY + i * 25);
      }
    }
  });

  // 6. Commemorative Footer
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";
  ctx.font = "700 20px Inter, sans-serif";
  ctx.fillStyle = palette.primary;
  ctx.fillText(`Passing Out Parade • Courtesy: ${cdsName}`, W / 2, H - 52);
}
