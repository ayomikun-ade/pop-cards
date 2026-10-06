// Vector canvas drawing helpers for Instagram, TikTok, and X (Twitter) icons

export function drawInstagramIcon(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = size * 0.1;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const r = size * 0.28;
  const w = size;
  const h = size;

  // Outer rounded box
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  ctx.stroke();

  // Inner lens circle
  ctx.beginPath();
  ctx.arc(x + w / 2, y + h / 2, size * 0.25, 0, Math.PI * 2);
  ctx.stroke();

  // Top-right dot
  ctx.beginPath();
  ctx.arc(x + w * 0.76, y + h * 0.24, size * 0.06, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

export function drawTikTokIcon(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string
) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineWidth = size * 0.12;
  ctx.lineCap = 'round';

  // Musical note path scaled to size
  const scale = size / 24;
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  ctx.beginPath();
  // Bottom note circle
  ctx.arc(9, 16, 4.5, 0, Math.PI * 2);
  ctx.fill();

  // Stem
  ctx.beginPath();
  ctx.moveTo(13.5, 16);
  ctx.lineTo(13.5, 4);
  ctx.stroke();

  // Top hook / flag
  ctx.beginPath();
  ctx.moveTo(13.5, 4);
  ctx.bezierCurveTo(15, 8, 18, 10, 21, 10);
  ctx.stroke();

  ctx.restore();
}

export function drawXIcon(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = size * 0.14;
  ctx.lineCap = 'round';

  const scale = size / 24;
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  // X cross lines
  ctx.beginPath();
  ctx.moveTo(4, 4);
  ctx.lineTo(20, 20);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(20, 4);
  ctx.lineTo(4, 20);
  ctx.stroke();

  ctx.restore();
}

export interface SocialItem {
  platform: 'instagram' | 'tiktok' | 'x';
  handle: string;
}

/**
 * Draws a clean horizontal row of social handles with vector icons.
 */
export function drawSocialsRow(
  ctx: CanvasRenderingContext2D,
  socials: SocialItem[],
  x: number,
  y: number,
  iconColor: string,
  textColor: string,
  fontSize: number = 22
): number {
  if (!socials || socials.length === 0) return 0;

  const iconSize = fontSize * 0.95;
  let curX = x;
  ctx.font = `600 ${fontSize}px Inter, sans-serif`;
  ctx.textBaseline = 'middle';

  for (const item of socials) {
    const handleText = item.handle.startsWith('@') ? item.handle : `@${item.handle}`;

    // Draw Icon
    const iconY = y - iconSize / 2;
    if (item.platform === 'instagram') {
      drawInstagramIcon(ctx, curX, iconY, iconSize, iconColor);
    } else if (item.platform === 'tiktok') {
      drawTikTokIcon(ctx, curX, iconY, iconSize, iconColor);
    } else if (item.platform === 'x') {
      drawXIcon(ctx, curX, iconY, iconSize, iconColor);
    }

    curX += iconSize + 8;

    // Draw Handle Text
    ctx.fillStyle = textColor;
    ctx.fillText(handleText, curX, y);
    const metrics = ctx.measureText(handleText);

    curX += metrics.width + 24; // Spacing between social handles
  }

  return fontSize * 1.5;
}
