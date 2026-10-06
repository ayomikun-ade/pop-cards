import { CardDisplayField, ColorPalette, CardMemberData } from '../types';
import {
  loadImage,
  fitAndWrapText,
  drawRoundedRect,
  drawImageCover,
} from '../utils/canvasHelpers';
import { drawSocialsRow } from '../utils/drawSocialIcons';
import { drawProudlyServedStamp } from '../utils/drawStamp';

export interface RenderContext {
  canvas: HTMLCanvasElement;
  member: CardMemberData;
  displayFields: CardDisplayField[];
  palette: ColorPalette;
  cdsName: string;
  batchName: string;
  nyscLogoUrl: string;
  cdsLogoUrl?: string;
}

export async function renderClassicWave({
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

  // 1. Background fill
  ctx.fillStyle = palette.background;
  ctx.fillRect(0, 0, W, H);

  // 2. Gold/Accent Wave Shape
  ctx.fillStyle = palette.accent;
  ctx.beginPath();
  ctx.moveTo(0, 310);
  ctx.bezierCurveTo(W * 0.25, 340, W * 0.6, 270, W, 220);
  ctx.lineTo(W, 360);
  ctx.bezierCurveTo(W * 0.7, 320, W * 0.4, 460, 0, 390);
  ctx.closePath();
  ctx.fill();

  // Bottom gold wave accent
  ctx.fillStyle = palette.accent;
  ctx.beginPath();
  ctx.moveTo(W * 0.5, H);
  ctx.bezierCurveTo(W * 0.7, H - 70, W * 0.9, H - 20, W, H - 60);
  ctx.lineTo(W, H);
  ctx.closePath();
  ctx.fill();

  // Bottom primary wave accent
  ctx.fillStyle = palette.primary;
  ctx.beginPath();
  ctx.moveTo(W * 0.65, H);
  ctx.bezierCurveTo(W * 0.8, H - 40, W * 0.92, H - 90, W, H - 120);
  ctx.lineTo(W, H);
  ctx.closePath();
  ctx.fill();

  // 3. Top Primary Header Banner
  const headerHeight = 250;
  ctx.fillStyle = palette.primary;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(W, 0);
  ctx.lineTo(W, headerHeight - 35);
  ctx.bezierCurveTo(W * 0.6, headerHeight - 15, W * 0.3, headerHeight, 0, headerHeight);
  ctx.closePath();
  ctx.fill();

  // Header separator line
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(490, 165);
  ctx.lineTo(490, 240);
  ctx.lineTo(W, 230);
  ctx.stroke();

  // 4. Logos & Header Titles
  try {
    const nyscLogo = await loadImage(nyscLogoUrl);
    ctx.drawImage(nyscLogo, 45, 25, 120, 120);
  } catch (err) {
    console.warn('Could not render NYSC logo', err);
  }

  if (cdsLogoUrl) {
    try {
      const cdsLogo = await loadImage(cdsLogoUrl);
      ctx.drawImage(cdsLogo, 185, 25, 120, 120);
    } catch (err) {
      console.warn('Could not render CDS logo', err);
    }
  }

  // Header Title & Batch Tag
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.font = '800 28px Montserrat, Inter, sans-serif';
  ctx.fillStyle = palette.textOnPrimary;
  ctx.fillText('NATIONAL YOUTH SERVICE CORPS', 330, 60);

  ctx.font = '700 20px Montserrat, Inter, sans-serif';
  ctx.fillStyle = palette.accent;
  ctx.fillText(`${batchName.toUpperCase()} • PASSING-OUT PARADE`, 330, 98);

  // 6. Member Photo Frame on Left (Square-like, vertically centered, no stretching)
  const photoW = 460;
  const photoH = 550; // Square-like / 4:5 natural proportion
  const photoX = 45;
  // Centered vertically in available space below top header
  const availableTop = 260;
  const availableBottom = H - 90;
  const photoY = Math.round(availableTop + (availableBottom - availableTop - photoH) / 2);
  const photoRadius = 20;

  // Photo backing (clean solid border without blur/glow)
  ctx.fillStyle = '#FFFFFF';
  drawRoundedRect(ctx, photoX, photoY, photoW, photoH, photoRadius);
  ctx.fill();

  // Draw Photo
  if (member.photoUrl) {
    try {
      const photoImg = await loadImage(member.photoUrl);
      ctx.save();
      drawRoundedRect(ctx, photoX, photoY, photoW, photoH, photoRadius);
      ctx.clip();
      drawImageCover(ctx, photoImg, photoX, photoY, photoW, photoH);
      ctx.restore();
    } catch (err) {
      console.warn('Could not render member photo', err);
    }
  } else {
    // Placeholder photo
    ctx.fillStyle = '#E2E8F0';
    drawRoundedRect(ctx, photoX, photoY, photoW, photoH, photoRadius);
    ctx.fill();
    ctx.font = '600 28px Inter, sans-serif';
    ctx.fillStyle = '#64748B';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Portrait Photo (Square-like)', photoX + photoW / 2, photoY + photoH / 2);
  }

  // Photo clean outer border
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 6;
  drawRoundedRect(ctx, photoX, photoY, photoW, photoH, photoRadius);
  ctx.stroke();

  // "PROUDLY SERVED" Authentic physical ink stamp overlapping lower-right corner of photo
  drawProudlyServedStamp(ctx, photoX + photoW - 32, photoY + photoH - 24, 62, palette.primary, -15);

  // Clean Courtesy text centered below photo
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.font = '700 24px Inter, sans-serif';
  ctx.fillStyle = '#334155';
  ctx.fillText(`Courtesy: ${cdsName}`, photoX + photoW / 2, photoY + photoH + 32);

  // 7. Right Side: Name Header and Display Fields (Vertically aligned with photo center)
  const fieldsX = 540;
  const contentWidth = W - fieldsX - 45;

  // Name calculation on right side
  const nameUpper = (member.fullName || 'CORPS MEMBER').toUpperCase();
  const { lines: nameLines, lineHeight: nameLineHeight } = fitAndWrapText(
    ctx,
    nameUpper,
    contentWidth,
    2,
    44,
    28,
    'Montserrat, Inter, sans-serif',
    900
  );

  const nameBlockHeight = nameLines.length * nameLineHeight + 20; // name text + gap to divider

  const visibleFields = displayFields.slice(0, 7);
  const baseGap = visibleFields.length <= 4 ? 32 : visibleFields.length <= 5 ? 26 : visibleFields.length === 6 ? 20 : 16;

  // Pre-calculate total height of right column (Name + Divider + Fields) to center against photo
  let totalFieldsHeight = nameBlockHeight + 16; // name + divider space
  const measuredItems: { field: typeof visibleFields[0]; lines: string[]; isSocial: boolean; isQuote: boolean; blockHeight: number }[] = [];

  for (const field of visibleFields) {
    if (!field.value && (!field.socials || field.socials.length === 0)) continue;

    if (field.socials && field.socials.length > 0) {
      const blockHeight = 26 + 36;
      measuredItems.push({ field, lines: [], isSocial: true, isQuote: false, blockHeight });
      totalFieldsHeight += blockHeight + baseGap;
    } else if (field.isQuote) {
      ctx.font = '500 24px Inter, sans-serif';
      const quoteText = `"${field.value.replace(/^["“”]|["“”]$/g, '').trim()}"`;
      const { lines, lineHeight } = fitAndWrapText(ctx, quoteText, contentWidth, 3, 24, 18, 'Inter, sans-serif', 'italic 500');
      const blockHeight = 26 + lines.length * lineHeight;
      measuredItems.push({ field, lines, isSocial: false, isQuote: true, blockHeight });
      totalFieldsHeight += blockHeight + baseGap;
    } else {
      ctx.font = '600 26px Inter, sans-serif';
      const { lines, lineHeight } = fitAndWrapText(ctx, field.value, contentWidth, 2, 25, 18, 'Inter, sans-serif', 600);
      const blockHeight = 26 + lines.length * lineHeight;
      measuredItems.push({ field, lines, isSocial: false, isQuote: false, blockHeight });
      totalFieldsHeight += blockHeight + baseGap;
    }
  }

  if (measuredItems.length > 0) {
    totalFieldsHeight -= baseGap; // remove trailing gap
  }

  // Center right side vertically with respect to the photo
  const photoCenterY = photoY + photoH / 2;
  let currentY = Math.max(availableTop + 15, Math.round(photoCenterY - totalFieldsHeight / 2));

  // Render Member Name on the right
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillStyle = palette.primary;
  ctx.font = '900 44px Montserrat, Inter, sans-serif';
  for (const line of nameLines) {
    ctx.fillText(line, fieldsX, currentY);
    currentY += nameLineHeight;
  }

  // Accent divider line under name
  currentY += 8;
  ctx.strokeStyle = palette.accent;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(fieldsX, currentY);
  ctx.lineTo(fieldsX + 80, currentY);
  ctx.stroke();
  currentY += 22; // space before first field

  for (const item of measuredItems) {
    const { field, lines, isSocial, isQuote } = item;

    // Field Label
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.font = '800 20px Montserrat, Inter, sans-serif';
    ctx.fillStyle = palette.headingColor;
    ctx.fillText(field.label.toUpperCase(), fieldsX, currentY);

    const labelHeight = 26;
    const valueY = currentY + labelHeight;

    if (isSocial && field.socials) {
      drawSocialsRow(
        ctx,
        field.socials,
        fieldsX,
        valueY + 14,
        palette.headingColor,
        palette.textColor,
        24
      );
      currentY = valueY + 36 + baseGap;
    } else if (isQuote) {
      ctx.font = '500 24px Inter, sans-serif';
      ctx.fillStyle = palette.textColor;
      const qLineHeight = 30;
      for (let i = 0; i < lines.length; i++) {
        ctx.fillText(lines[i], fieldsX, valueY + i * qLineHeight);
      }
      currentY = valueY + lines.length * qLineHeight + baseGap;
    } else {
      ctx.font = '600 26px Inter, sans-serif';
      ctx.fillStyle = palette.textColor;
      const vLineHeight = 32;
      for (let i = 0; i < lines.length; i++) {
        ctx.fillText(lines[i], fieldsX, valueY + i * vLineHeight);
      }
      currentY = valueY + lines.length * vLineHeight + baseGap;
    }
  }
}
