export type BadgeFontFamilies = { sans: string; mono: string };

export function getBadgeFontFamilies(): BadgeFontFamilies {
  const styles = getComputedStyle(document.documentElement);
  return {
    sans: styles.getPropertyValue("--font-sans").trim() || '"Be Vietnam Pro", Arial, sans-serif',
    mono: styles.getPropertyValue("--font-mono").trim() || '"JetBrains Mono", monospace',
  };
}

export async function loadBadgeFonts(sample: string): Promise<BadgeFontFamilies> {
  const families = getBadgeFontFamilies();
  const text = sample.normalize("NFC");
  // Request the actual Vietnamese glyphs: fonts.ready alone only waits for faces already requested by the DOM.
  await Promise.allSettled([
    document.fonts.load(`700 28px ${families.sans}`, text),
    document.fonts.load(`800 52px ${families.sans}`, text),
    document.fonts.load(`500 22px ${families.mono}`, text),
    document.fonts.load(`600 24px ${families.mono}`, text),
    document.fonts.load(`700 28px ${families.mono}`, text),
  ]);
  return families;
}

export function drawFittedCanvasText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  options: { family: string; weight: number; size: number; minSize?: number; maxWidth: number }
) {
  const normalized = text.normalize("NFC");
  let size = options.size;
  const minSize = options.minSize ?? options.size;
  ctx.font = `${options.weight} ${size}px ${options.family}`;
  while (ctx.measureText(normalized).width > options.maxWidth && size > minSize) {
    size = Math.max(minSize, size - 1);
    ctx.font = `${options.weight} ${size}px ${options.family}`;
  }
  ctx.fillText(normalized, x, y, options.maxWidth);
}
