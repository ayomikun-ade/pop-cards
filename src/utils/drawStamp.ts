// Canvas helper to draw an authentic physical ink stamp: "PROUDLY SERVED • NYSC"

export function drawProudlyServedStamp(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number = 55,
  color: string = '#006837',
  rotationDegrees: number = -14
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate((rotationDegrees * Math.PI) / 180);

  ctx.strokeStyle = color;
  ctx.fillStyle = color;

  // Outer circular ring with stamp-like double stroke
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.stroke();

  // Inner dashed / fine ring
  ctx.lineWidth = 1.5;
  ctx.setLineDash([4, 3]);
  ctx.beginPath();
  ctx.arc(0, 0, radius - 7, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]); // reset line dash

  // Circular text: "PROUDLY SERVED • NYSC •"
  const text = "PROUDLY SERVED • NYSC • ";
  const textRadius = radius - 16;
  const numChars = text.length;
  const angleStep = (Math.PI * 2) / numChars;

  ctx.font = '800 9.5px Montserrat, Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  for (let i = 0; i < numChars; i++) {
    const angle = i * angleStep - Math.PI / 2;
    ctx.save();
    ctx.rotate(angle);
    ctx.translate(0, -textRadius);
    ctx.fillText(text[i], 0, 0);
    ctx.restore();
  }

  // Inner ring
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(0, 0, radius - 26, 0, Math.PI * 2);
  ctx.stroke();

  // Center Emblem: Star and Year / POP
  ctx.font = '900 13px Montserrat, Inter, sans-serif';
  ctx.fillText('★', 0, -8);
  ctx.font = '800 11px Montserrat, Inter, sans-serif';
  ctx.fillText('PASSED OUT', 0, 6);
  ctx.font = '700 8.5px Inter, sans-serif';
  ctx.fillText('HONOUR & SERVICE', 0, 18);

  ctx.restore();
}
