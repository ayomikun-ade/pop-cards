import { RenderContext } from './classicWave';
import {
  loadImage,
  fitAndWrapText,
  drawRoundedRect,
  drawImageCover,
} from '../utils/canvasHelpers';
import { drawSocialsRow } from '../utils/drawSocialIcons';
import { drawProudlyServedStamp } from '../utils/drawStamp';

export async function renderBoldSplit({
  canvas,
  member,
  displayFields,
  palette,
  cdsName,
  batchName,
  nyscLogoUrl,
  cdsLogoUrl,
}: RenderContext): Promise<void> {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const W = 1080;
  const H = 1350;

  canvas.width = W;
  canvas.height = H;

  // Background
  ctx.fillStyle = palette.background;
  ctx.fillRect(0, 0, W, H);

  // Left Column: Square-like Portrait Photo Card (Centered vertically, no stretching)
  const photoW = 460;
  const photoH = 550; // Square-like / 4:5 natural proportion
  const photoX = 45;
  const photoY = Math.round((H - photoH) / 2); // Perfectly centered vertically
  const photoRadius = 22;

  // 1. Photo container (clean solid border without blur/glow)
  ctx.fillStyle = '#FFFFFF';
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
      console.warn('Bold split photo render error', e);
    }
  } else {
    ctx.fillStyle = '#E2E8F0';
    drawRoundedRect(ctx, photoX, photoY, photoW, photoH, photoRadius);
    ctx.fill();
    ctx.font = '600 28px Inter, sans-serif';
    ctx.fillStyle = '#64748B';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Portrait Photo (Square-like)', photoX + photoW / 2, photoY + photoH / 2);
  }

  // Photo border
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 6;
  drawRoundedRect(ctx, photoX, photoY, photoW, photoH, photoRadius);
  ctx.stroke();

  // Logos positioned gracefully above the photo container
  const logoBoxY = photoY - 95;
  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 1.5;
  drawRoundedRect(ctx, photoX, logoBoxY, 210, 75, 16);
  ctx.fill();
  ctx.stroke();

  try {
    const nyscLogo = await loadImage(nyscLogoUrl);
    ctx.drawImage(nyscLogo, photoX + 16, logoBoxY + 8, 60, 60);
  } catch (e) {
    console.warn('NYSC logo load error', e);
  }

  if (cdsLogoUrl) {
    try {
      const cdsLogo = await loadImage(cdsLogoUrl);
      ctx.drawImage(cdsLogo, photoX + 95, logoBoxY + 8, 60, 60);
    } catch (e) {
      console.warn('CDS logo load error', e);
    }
  }

  // "PROUDLY SERVED" Stamp overlapping lower-right corner of photo
  drawProudlyServedStamp(ctx, photoX + photoW - 30, photoY + photoH - 25, 62, palette.primary, -14);

  // Clean Courtesy footer text centered below the photo container
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.font = '700 22px Inter, sans-serif';
  ctx.fillStyle = palette.primary;
  ctx.fillText(`Courtesy: ${cdsName}`, photoX + photoW / 2, photoY + photoH + 30);

  // 2. Right Side: Typographic Details Panel
  const rightX = 555;
  const rightW = W - rightX - 45;

  // Name calculation
  const nameUpper = (member.fullName || 'CORPS MEMBER').toUpperCase();
  const { lines: nameLines, lineHeight: nameLineHeight } = fitAndWrapText(
    ctx,
    nameUpper,
    rightW,
    2,
    44,
    28,
    'Montserrat, Inter, sans-serif',
    900
  );

  const visibleFields = displayFields.slice(0, 7);
  const gap = visibleFields.length <= 4 ? 34 : visibleFields.length <= 5 ? 28 : visibleFields.length === 6 ? 22 : 16;

  // Pre-calculate heights of fields
  let totalRightHeight = 24 + 10 + (nameLines.length * nameLineHeight) + 16; // subtitle + gap + name + divider
  const measuredItems: { field: typeof visibleFields[0]; lines: string[]; isSocial: boolean; isQuote: boolean; blockHeight: number }[] = [];

  for (const field of visibleFields) {
    if (!field.value && (!field.socials || field.socials.length === 0)) continue;

    if (field.socials && field.socials.length > 0) {
      const blockHeight = 24 + 36;
      measuredItems.push({ field, lines: [], isSocial: true, isQuote: false, blockHeight });
      totalRightHeight += blockHeight + gap;
    } else if (field.isQuote) {
      ctx.font = '500 23px Inter, sans-serif';
      const quoteText = `"${field.value.replace(/^["“”]|["“”]$/g, '').trim()}"`;
      const { lines, lineHeight } = fitAndWrapText(ctx, quoteText, rightW, 3, 23, 17, 'Inter, sans-serif', 'italic 500');
      const blockHeight = 24 + lines.length * lineHeight;
      measuredItems.push({ field, lines, isSocial: false, isQuote: true, blockHeight });
      totalRightHeight += blockHeight + gap;
    } else {
      ctx.font = '600 24px Inter, sans-serif';
      const { lines, lineHeight } = fitAndWrapText(ctx, field.value, rightW, 2, 24, 18, 'Inter, sans-serif', 600);
      const blockHeight = 24 + lines.length * lineHeight;
      measuredItems.push({ field, lines, isSocial: false, isQuote: false, blockHeight });
      totalRightHeight += blockHeight + gap;
    }
  }

  if (measuredItems.length > 0) {
    totalRightHeight -= gap;
  }

  // Center right side vertically with respect to the photo
  const photoCenterY = photoY + photoH / 2;
  let startRightY = Math.max(60, Math.round(photoCenterY - totalRightHeight / 2));

  // Batch subtitle
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.font = '800 18px Montserrat, Inter, sans-serif';
  ctx.fillStyle = palette.primary;
  ctx.fillText(`NYSC • ${batchName.toUpperCase()}`, rightX, startRightY);

  // Name Title
  let nameY = startRightY + 28;
  ctx.fillStyle = palette.headingColor;
  for (const line of nameLines) {
    ctx.fillText(line, rightX, nameY);
    nameY += nameLineHeight;
  }

  // Elegant divider line
  ctx.strokeStyle = palette.primary;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(rightX, nameY + 8);
  ctx.lineTo(rightX + rightW, nameY + 8);
  ctx.stroke();

  // Fields Section
  let currentY = nameY + 24;

  for (const item of measuredItems) {
    const { field, lines, isSocial, isQuote } = item;

    // Subtle hairline divider above each field
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(rightX, currentY - 6);
    ctx.lineTo(rightX + rightW, currentY - 6);
    ctx.stroke();

    // Label
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.font = '800 18px Montserrat, Inter, sans-serif';
    ctx.fillStyle = palette.primary;
    ctx.fillText(field.label.toUpperCase(), rightX, currentY);

    const valY = currentY + 24;

    if (isSocial && field.socials) {
      drawSocialsRow(ctx, field.socials, rightX, valY + 14, palette.primary, palette.textColor, 22);
      currentY = valY + 36 + gap;
    } else if (isQuote) {
      ctx.font = '500 23px Inter, sans-serif';
      ctx.fillStyle = palette.textColor;
      const qLineHeight = 29;
      for (let i = 0; i < lines.length; i++) {
        ctx.fillText(lines[i], rightX, valY + i * qLineHeight);
      }
      currentY = valY + lines.length * qLineHeight + gap;
    } else {
      ctx.font = '600 24px Inter, sans-serif';
      ctx.fillStyle = palette.textColor;
      const vLineHeight = 30;
      for (let i = 0; i < lines.length; i++) {
        ctx.fillText(lines[i], rightX, valY + i * vLineHeight);
      }
      currentY = valY + lines.length * vLineHeight + gap;
    }
  }
}
