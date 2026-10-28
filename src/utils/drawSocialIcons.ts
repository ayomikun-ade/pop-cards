// Vector canvas drawing helpers for official Instagram, TikTok, and X (Twitter) logos
import { drawRoundedRect } from './canvasHelpers';

const TIKTOK_PATH_D =
  'M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z';

const X_PATH_D =
  'M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z';

export function drawInstagramIcon(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  _color?: string
) {
  ctx.save();
  const r = size * 0.24;

  // Official Instagram multi-stop diagonal gradient badge
  const grad = ctx.createLinearGradient(x, y + size, x + size, y);
  grad.addColorStop(0, '#FD5949');
  grad.addColorStop(0.15, '#FEDA75');
  grad.addColorStop(0.4, '#FA7E1E');
  grad.addColorStop(0.65, '#D62976');
  grad.addColorStop(0.85, '#962FBF');
  grad.addColorStop(1, '#4F5BD5');

  drawRoundedRect(ctx, x, y, size, size, r);
  ctx.fillStyle = grad;
  ctx.fill();

  // Inner white camera glyph
  const scale = size / 24;
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  ctx.strokeStyle = '#FFFFFF';
  ctx.fillStyle = '#FFFFFF';
  ctx.lineWidth = 1.9;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Camera body rounded square
  drawRoundedRect(ctx, 4.2, 4.2, 15.6, 15.6, 4.4);
  ctx.stroke();

  // Center lens ring
  ctx.beginPath();
  ctx.arc(12, 12, 3.7, 0, Math.PI * 2);
  ctx.stroke();

  // Top-right flash dot
  ctx.beginPath();
  ctx.arc(16.5, 7.5, 1.15, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

export function drawTikTokIcon(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  _color?: string
) {
  ctx.save();
  const r = size * 0.24;

  // Sleek dark TikTok app badge
  drawRoundedRect(ctx, x, y, size, size, r);
  ctx.fillStyle = '#0F0F0F';
  ctx.fill();

  // Clip to badge and render official TikTok note with cyan/red chromatic offset
  ctx.clip();
  const pad = size * 0.17;
  const innerSize = size - pad * 2;
  const scale = innerSize / 24;

  ctx.translate(x + pad, y + pad);
  ctx.scale(scale, scale);

  if (typeof Path2D !== 'undefined') {
    const notePath = new Path2D(TIKTOK_PATH_D);

    // Cyan glitch layer (top-left offset)
    ctx.save();
    ctx.translate(-1.05, -0.85);
    ctx.fillStyle = '#25F4EE';
    ctx.fill(notePath);
    ctx.restore();

    // Red/Magenta glitch layer (bottom-right offset)
    ctx.save();
    ctx.translate(1.05, 0.85);
    ctx.fillStyle = '#FE2C55';
    ctx.fill(notePath);
    ctx.restore();

    // Core white note
    ctx.fillStyle = '#FFFFFF';
    ctx.fill(notePath);
  }

  ctx.restore();
}

export function drawXIcon(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  _color?: string
) {
  ctx.save();
  const r = size * 0.24;

  // Official X black badge
  drawRoundedRect(ctx, x, y, size, size, r);
  ctx.fillStyle = '#0F1419';
  ctx.fill();

  const pad = size * 0.2;
  const innerSize = size - pad * 2;
  const scale = innerSize / 24;

  ctx.translate(x + pad, y + pad);
  ctx.scale(scale, scale);

  if (typeof Path2D !== 'undefined') {
    const xPath = new Path2D(X_PATH_D);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill(xPath, 'evenodd');
  }

  ctx.restore();
}

export interface SocialItem {
  platform: 'instagram' | 'tiktok' | 'x';
  handle: string;
}

export interface GroupedSocialItem {
  platforms: ('instagram' | 'tiktok' | 'x')[];
  handleText: string;
}

/**
 * Combines social items that share the exact same username (case-insensitive)
 * so their platform icons appear together next to a single @handle.
 */
export function groupSocialItems(socials: SocialItem[]): GroupedSocialItem[] {
  const groups: GroupedSocialItem[] = [];

  for (const item of socials) {
    const clean = item.handle.replace(/^@+/, '').trim();
    if (!clean) continue;

    const handleText = `@${clean}`;
    const existing = groups.find(
      (g) => g.handleText.toLowerCase() === handleText.toLowerCase()
    );

    if (existing) {
      if (!existing.platforms.includes(item.platform)) {
        existing.platforms.push(item.platform);
      }
    } else {
      groups.push({
        platforms: [item.platform],
        handleText,
      });
    }
  }

  return groups;
}

interface MeasuredSocialGroup extends GroupedSocialItem {
  displayHandle: string;
  width: number;
}

export interface SocialsLayoutResult {
  rows: MeasuredSocialGroup[][];
  fontSize: number;
  iconSize: number;
  iconGap: number;
  textGap: number;
  itemGap: number;
  lineHeight: number;
  totalHeight: number;
}

function measureGroupWidth(
  ctx: CanvasRenderingContext2D,
  platformsCount: number,
  displayHandle: string,
  iconSize: number,
  iconGap: number,
  textGap: number
): number {
  const iconsWidth =
    platformsCount * iconSize + Math.max(0, platformsCount - 1) * iconGap;
  const textWidth = ctx.measureText(displayHandle).width;
  return iconsWidth + textGap + textWidth;
}

function truncateHandleToFit(
  ctx: CanvasRenderingContext2D,
  handleText: string,
  maxTextWidth: number
): string {
  if (ctx.measureText(handleText).width <= maxTextWidth) {
    return handleText;
  }
  let truncated = handleText;
  while (
    truncated.length > 2 &&
    ctx.measureText(`${truncated}…`).width > maxTextWidth
  ) {
    truncated = truncated.slice(0, -1);
  }
  return `${truncated}…`;
}

/**
 * Computes auto-scaled 1-line or 2-line layout for social handles within maxWidth.
 */
export function layoutSocialsRow(
  ctx: CanvasRenderingContext2D,
  socials: SocialItem[],
  maxWidth: number = 480,
  initialFontSize: number = 22,
  minFontSize: number = 14
): SocialsLayoutResult {
  const groups = groupSocialItems(socials);
  if (groups.length === 0) {
    return {
      rows: [],
      fontSize: initialFontSize,
      iconSize: initialFontSize,
      iconGap: 4,
      textGap: 6,
      itemGap: 16,
      lineHeight: initialFontSize * 1.3,
      totalHeight: 0,
    };
  }

  // 1. Try fitting all grouped items onto a single line by scaling down fontSize
  for (let fs = initialFontSize; fs >= minFontSize; fs -= 1) {
    const iconSize = Math.round(fs * 1.05);
    const iconGap = Math.max(3, Math.round(fs * 0.18));
    const textGap = Math.max(5, Math.round(fs * 0.28));
    const itemGap = Math.max(10, Math.round(fs * 0.7));

    ctx.font = `600 ${fs}px Inter, sans-serif`;

    const measured: MeasuredSocialGroup[] = groups.map((g) => ({
      ...g,
      displayHandle: g.handleText,
      width: measureGroupWidth(
        ctx,
        g.platforms.length,
        g.handleText,
        iconSize,
        iconGap,
        textGap
      ),
    }));

    const totalRowWidth =
      measured.reduce((sum, m) => sum + m.width, 0) +
      Math.max(0, measured.length - 1) * itemGap;

    if (totalRowWidth <= maxWidth) {
      const lineHeight = Math.round(Math.max(iconSize, fs) * 1.35);
      return {
        rows: [measured],
        fontSize: fs,
        iconSize,
        iconGap,
        textGap,
        itemGap,
        lineHeight,
        totalHeight: lineHeight,
      };
    }
  }

  // 2. If single line still exceeds maxWidth, wrap across up to 2 lines with auto-scaling
  const wrapStartFont = Math.min(initialFontSize, 19);
  for (let fs = wrapStartFont; fs >= minFontSize; fs -= 1) {
    const iconSize = Math.round(fs * 1.02);
    const iconGap = Math.max(3, Math.round(fs * 0.18));
    const textGap = Math.max(5, Math.round(fs * 0.26));
    const itemGap = Math.max(10, Math.round(fs * 0.65));

    ctx.font = `600 ${fs}px Inter, sans-serif`;

    const rows: MeasuredSocialGroup[][] = [];
    let currentRow: MeasuredSocialGroup[] = [];
    let currentRowWidth = 0;

    for (const g of groups) {
      const iconsW =
        g.platforms.length * iconSize +
        Math.max(0, g.platforms.length - 1) * iconGap +
        textGap;
      const displayHandle = truncateHandleToFit(
        ctx,
        g.handleText,
        Math.max(40, maxWidth - iconsW)
      );
      const w = measureGroupWidth(
        ctx,
        g.platforms.length,
        displayHandle,
        iconSize,
        iconGap,
        textGap
      );

      const item: MeasuredSocialGroup = { ...g, displayHandle, width: w };

      if (currentRow.length === 0) {
        currentRow.push(item);
        currentRowWidth = w;
      } else if (currentRowWidth + itemGap + w <= maxWidth) {
        currentRow.push(item);
        currentRowWidth += itemGap + w;
      } else {
        rows.push(currentRow);
        currentRow = [item];
        currentRowWidth = w;
      }
    }
    if (currentRow.length > 0) {
      rows.push(currentRow);
    }

    if (rows.length <= 2 || fs === minFontSize) {
      // Cap at 2 rows maximum; if 3rd row exists at minFontSize, merge into 2nd row with truncation
      if (rows.length > 2) {
        const secondRow = [...rows[1], ...rows.slice(2).flat()];
        const availPerItem = Math.floor(
          (maxWidth - (secondRow.length - 1) * itemGap) / secondRow.length
        );
        rows.splice(
          1,
          rows.length - 1,
          secondRow.map((item) => {
            const iconsW =
              item.platforms.length * iconSize +
              Math.max(0, item.platforms.length - 1) * iconGap +
              textGap;
            const dh = truncateHandleToFit(
              ctx,
              item.handleText,
              Math.max(30, availPerItem - iconsW)
            );
            return {
              ...item,
              displayHandle: dh,
              width: measureGroupWidth(
                ctx,
                item.platforms.length,
                dh,
                iconSize,
                iconGap,
                textGap
              ),
            };
          })
        );
      }

      const lineHeight = Math.round(Math.max(iconSize, fs) * 1.22);
      return {
        rows,
        fontSize: fs,
        iconSize,
        iconGap,
        textGap,
        itemGap,
        lineHeight,
        totalHeight: rows.length * lineHeight,
      };
    }
  }

  const fallbackHeight = Math.round(minFontSize * 1.3);
  return {
    rows: [],
    fontSize: minFontSize,
    iconSize: minFontSize,
    iconGap: 3,
    textGap: 5,
    itemGap: 10,
    lineHeight: fallbackHeight,
    totalHeight: fallbackHeight,
  };
}

/**
 * Draws grouped social handles with official full-color brand icons,
 * auto-scaling and wrapping up to 2 lines so it never overflows maxWidth.
 */
export function drawSocialsRow(
  ctx: CanvasRenderingContext2D,
  socials: SocialItem[],
  x: number,
  y: number,
  iconColor: string,
  textColor: string,
  fontSize: number = 22,
  maxWidth: number = 480
): number {
  if (!socials || socials.length === 0) return 0;

  const layout = layoutSocialsRow(ctx, socials, maxWidth, fontSize, 13);
  if (layout.rows.length === 0) return 0;

  ctx.save();
  ctx.font = `600 ${layout.fontSize}px Inter, sans-serif`;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';

  for (let rIdx = 0; rIdx < layout.rows.length; rIdx++) {
    const row = layout.rows[rIdx];
    const rowCenterY = y + rIdx * layout.lineHeight;
    let curX = x;

    for (const group of row) {
      // Draw 1 or more platform badges for this handle
      for (let pIdx = 0; pIdx < group.platforms.length; pIdx++) {
        const platform = group.platforms[pIdx];
        const iconY = rowCenterY - layout.iconSize / 2;

        if (platform === 'instagram') {
          drawInstagramIcon(ctx, curX, iconY, layout.iconSize, iconColor);
        } else if (platform === 'tiktok') {
          drawTikTokIcon(ctx, curX, iconY, layout.iconSize, iconColor);
        } else if (platform === 'x') {
          drawXIcon(ctx, curX, iconY, layout.iconSize, iconColor);
        }

        curX +=
          layout.iconSize +
          (pIdx < group.platforms.length - 1 ? layout.iconGap : layout.textGap);
      }

      // Draw @handle text
      ctx.fillStyle = textColor;
      ctx.fillText(group.displayHandle, curX, rowCenterY);
      const metrics = ctx.measureText(group.displayHandle);

      curX += metrics.width + layout.itemGap;
    }
  }

  ctx.restore();
  return layout.totalHeight;
}
