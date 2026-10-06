// Utility helpers for HTML5 Canvas rendering

const imageCache = new Map<string, HTMLImageElement>();

export function loadImage(src: string): Promise<HTMLImageElement> {
  if (imageCache.has(src)) {
    const cached = imageCache.get(src)!;
    if (cached.complete && cached.naturalWidth > 0) {
      return Promise.resolve(cached);
    }
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imageCache.set(src, img);
      resolve(img);
    };
    img.onerror = (err) => {
      console.warn(`Failed to load image at: ${src}`, err);
      reject(err);
    };
    img.src = src;
  });
}

/**
 * Ensures required web fonts are loaded before canvas drawing starts.
 */
export async function ensureFontsLoaded(): Promise<void> {
  if (typeof document !== 'undefined' && 'fonts' in document) {
    try {
      await Promise.all([
        document.fonts.load('700 32px Montserrat'),
        document.fonts.load('800 48px Montserrat'),
        document.fonts.load('900 64px Montserrat'),
        document.fonts.load('400 24px Inter'),
        document.fonts.load('600 24px Inter'),
        document.fonts.load('700 24px Inter'),
      ]);
    } catch (e) {
      console.warn('Font loading check timed out or errored:', e);
    }
  }
}

/**
 * Splits text into wrapped lines that don't exceed maxWidth.
 */
export function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  if (!text) return [];

  // If text already has manual line breaks
  const paragraphs = text.split('\n');
  const allLines: string[] = [];

  for (const para of paragraphs) {
    const words = para.trim().split(/\s+/);
    if (words.length === 0 || words[0] === '') continue;

    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const testLine = `${currentLine} ${word}`;
      const metrics = ctx.measureText(testLine);

      if (metrics.width <= maxWidth) {
        currentLine = testLine;
      } else {
        allLines.push(currentLine);
        currentLine = word;
      }
    }
    allLines.push(currentLine);
  }

  return allLines;
}

/**
 * Dynamically scales down font size until text wraps into <= maxLines,
 * and adds an ellipsis if it cannot fit within minFontSize.
 */
export function fitAndWrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number,
  initialFontSize: number,
  minFontSize: number,
  fontFamily: string,
  fontWeight: string | number = '600'
): { lines: string[]; fontSize: number; lineHeight: number } {
  let fontSize = initialFontSize;
  let lines: string[] = [];

  while (fontSize >= minFontSize) {
    ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
    lines = wrapText(ctx, text, maxWidth);
    if (lines.length <= maxLines) {
      return { lines, fontSize, lineHeight: fontSize * 1.25 };
    }
    fontSize -= 2;
  }

  // If still too long at minFontSize, truncate last line with ellipsis
  ctx.font = `${fontWeight} ${minFontSize}px ${fontFamily}`;
  lines = wrapText(ctx, text, maxWidth);
  if (lines.length > maxLines) {
    const truncatedLines = lines.slice(0, maxLines);
    let last = truncatedLines[maxLines - 1];
    while (last.length > 0 && ctx.measureText(`${last}…`).width > maxWidth) {
      last = last.slice(0, -1);
    }
    truncatedLines[maxLines - 1] = `${last.trim()}…`;
    return { lines: truncatedLines, fontSize: minFontSize, lineHeight: minFontSize * 1.25 };
  }

  return { lines, fontSize: minFontSize, lineHeight: minFontSize * 1.25 };
}

/**
 * Draws a rounded rectangle path.
 */
export function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number | { tl?: number; tr?: number; br?: number; bl?: number }
) {
  const r = typeof radius === 'number'
    ? { tl: radius, tr: radius, br: radius, bl: radius }
    : { tl: radius.tl ?? 0, tr: radius.tr ?? 0, br: radius.br ?? 0, bl: radius.bl ?? 0 };

  ctx.beginPath();
  ctx.moveTo(x + r.tl, y);
  ctx.lineTo(x + width - r.tr, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r.tr);
  ctx.lineTo(x + width, y + height - r.br);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r.br, y + height);
  ctx.lineTo(x + r.bl, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r.bl);
  ctx.lineTo(x, y + r.tl);
  ctx.quadraticCurveTo(x, y, x + r.tl, y);
  ctx.closePath();
}

/**
 * Draws an image fitted to a box (cover mode) with optional clipping path.
 */
export function drawImageCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number
) {
  const imgRatio = img.naturalWidth / img.naturalHeight;
  const targetRatio = width / height;

  let sx = 0;
  let sy = 0;
  let sWidth = img.naturalWidth;
  let sHeight = img.naturalHeight;

  if (imgRatio > targetRatio) {
    sWidth = img.naturalHeight * targetRatio;
    sx = (img.naturalWidth - sWidth) / 2;
  } else {
    sHeight = img.naturalWidth / targetRatio;
    sy = (img.naturalHeight - sHeight) / 2;
  }

  ctx.drawImage(img, sx, sy, sWidth, sHeight, x, y, width, height);
}
