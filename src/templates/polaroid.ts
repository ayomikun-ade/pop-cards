import { RenderContext } from './classicWave';
import {
  loadImage,
  fitAndWrapText,
  drawImageCover,
} from '../utils/canvasHelpers';
import { drawSocialsRow } from '../utils/drawSocialIcons';
import { drawProudlyServedStamp } from '../utils/drawStamp';

export async function renderPolaroid({
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

  // 1. Natural warm paper background
  ctx.fillStyle = '#FAF7F2';
  ctx.fillRect(0, 0, W, H);

  // Subtle outer vintage border
  ctx.strokeStyle = '#E7E2D8';
  ctx.lineWidth = 2;
  ctx.strokeRect(28, 28, W - 56, H - 56);

  // 2. Elegant Editorial Header
  // Dual logos
  try {
    const nyscLogo = await loadImage(nyscLogoUrl);
    ctx.drawImage(nyscLogo, 56, 50, 95, 95);
  } catch (e) {
    console.warn('NYSC logo load error', e);
  }

  if (cdsLogoUrl) {
    try {
      const cdsLogo = await loadImage(cdsLogoUrl);
      ctx.drawImage(cdsLogo, W - 151, 50, 95, 95);
    } catch (e) {
      console.warn('CDS logo load error', e);
    }
  }

  // Header Title Text
  ctx.textAlign = 'center';
  ctx.fillStyle = palette.primary;
  ctx.font = '800 24px Montserrat, Inter, sans-serif';
  ctx.fillText('NATIONAL YOUTH SERVICE CORPS', W / 2, 75);

  ctx.fillStyle = '#64748B';
  ctx.font = '700 18px Inter, sans-serif';
  ctx.fillText(`${cdsName.toUpperCase()} • ${batchName.toUpperCase()}`, W / 2, 108);

  // Fine rule line
  ctx.strokeStyle = palette.primary;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(170, 130);
  ctx.lineTo(W - 170, 130);
  ctx.stroke();

  // 3. Authentic Physical Polaroid Frame
  const polW = 680;
  const polH = 670;
  const polX = (W - polW) / 2;
  const polY = 160;

  // Clean polaroid frame
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(polX, polY, polW, polH);
  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(polX, polY, polW, polH);

  // Polaroid photo inner area (Generous 4:3 or standard framing)
  const innerMargin = 30;
  const innerW = polW - innerMargin * 2;
  const innerH = 490;
  const innerX = polX + innerMargin;
  const innerY = polY + innerMargin;

  if (member.photoUrl) {
    try {
      const photoImg = await loadImage(member.photoUrl);
      ctx.save();
      ctx.beginPath();
      ctx.rect(innerX, innerY, innerW, innerH);
      ctx.clip();
      drawImageCover(ctx, photoImg, innerX, innerY, innerW, innerH);
      ctx.restore();
    } catch (e) {
      console.warn('Polaroid photo render error', e);
    }
  } else {
    ctx.fillStyle = '#F1F5F9';
    ctx.fillRect(innerX, innerY, innerW, innerH);
    ctx.font = '600 28px Inter, sans-serif';
    ctx.fillStyle = '#94A3B8';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Portrait Photo', innerX + innerW / 2, innerY + innerH / 2);
  }

  // Name stamped on the bottom polaroid chin
  const nameUpper = (member.fullName || 'CORPS MEMBER').toUpperCase();
  ctx.font = '900 38px Montserrat, Inter, sans-serif';
  const { lines: nameLines } = fitAndWrapText(
    ctx,
    nameUpper,
    innerW,
    1,
    38,
    26,
    'Montserrat, Inter, sans-serif',
    900
  );
  ctx.fillStyle = '#1E293B';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(nameLines[0] || nameUpper, polX + polW / 2, polY + innerH + 75);

  // "PROUDLY SERVED" Authentic physical ink stamp overlapping lower-right corner of polaroid
  drawProudlyServedStamp(ctx, polX + polW - 40, polY + innerH + 15, 62, palette.primary, -12);

  // 4. Details Section (Clean authentic editorial layout - NO AI cards!)
  const startY = polY + polH + 45;
  const contentW = W - 140;
  const leftColX = 70;
  const rightColX = W / 2 + 30;
  const colW = contentW / 2 - 30;

  const visibleFields = displayFields.slice(0, 6);

  visibleFields.forEach((field, idx) => {
    if (!field.value && (!field.socials || field.socials.length === 0)) return;

    const isLeft = idx % 2 === 0;
    const row = Math.floor(idx / 2);
    const fx = isLeft ? leftColX : rightColX;
    const fy = startY + row * 110;

    // Subtle fine hairline divider above row
    ctx.strokeStyle = '#E7E2D8';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(fx, fy - 10);
    ctx.lineTo(fx + colW, fy - 10);
    ctx.stroke();

    // Field Label
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.font = '800 16px Montserrat, Inter, sans-serif';
    ctx.fillStyle = palette.primary;
    ctx.fillText(field.label.toUpperCase(), fx, fy);

    const valY = fy + 24;

    // Socials with icons
    if (field.socials && field.socials.length > 0) {
      drawSocialsRow(ctx, field.socials, fx, valY + 12, palette.primary, '#334155', 20);
    } else if (field.isQuote) {
      ctx.font = '500 20px Inter, sans-serif';
      ctx.fillStyle = '#334155';
      const { lines } = fitAndWrapText(
        ctx,
        `"${field.value.trim()}"`,
        colW,
        2,
        20,
        15,
        'Inter, sans-serif',
        'italic 500'
      );
      for (let i = 0; i < lines.length; i++) {
        ctx.fillText(lines[i], fx, valY + i * 24);
      }
    } else {
      ctx.font = '600 21px Inter, sans-serif';
      ctx.fillStyle = '#1E293B';
      const { lines } = fitAndWrapText(
        ctx,
        field.value,
        colW,
        2,
        21,
        16,
        'Inter, sans-serif',
        600
      );
      for (let i = 0; i < lines.length; i++) {
        ctx.fillText(lines[i], fx, valY + i * 25);
      }
    }
  });

  // 5. Classic Footer
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.font = '700 20px Inter, sans-serif';
  ctx.fillStyle = palette.primary;
  ctx.fillText(`Passing Out Parade • Courtesy: ${cdsName}`, W / 2, H - 42);
}
