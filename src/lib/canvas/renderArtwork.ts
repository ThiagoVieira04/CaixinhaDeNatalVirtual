import {
  ART_HEIGHT,
  ART_WIDTH,
  DEFAULT_BUSINESS_NAME,
  type ArtworkConfig,
} from "../studio/types";

const imageCache = new Map<string, Promise<HTMLImageElement>>();

function loadImage(src: string): Promise<HTMLImageElement> {
  const cached = imageCache.get(src);
  if (cached) return cached;

  const promise = new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => resolve(image);
    image.onerror = () => {
      imageCache.delete(src);
      reject(new Error("Não foi possível carregar uma das imagens da arte."));
    };
    image.src = src;
  });

  imageCache.set(src, promise);
  return promise;
}

async function ensureFontsReady(): Promise<void> {
  if (typeof document === "undefined" || !("fonts" in document)) return;
  try {
    await document.fonts.load('96px "Great Vibes"');
    await document.fonts.ready;
  } catch {
    /* A fonte é um refinamento visual; seguimos com o fallback. */
  }
}

function roundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
): void {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawImageCover(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
): void {
  const scale = Math.max(width / image.width, height / image.height);
  const sourceWidth = width / scale;
  const sourceHeight = height / scale;
  const sourceX = (image.width - sourceWidth) / 2;
  const sourceY = (image.height - sourceHeight) / 2;
  ctx.drawImage(
    image,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    x,
    y,
    width,
    height,
  );
}

function drawImageContain(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
): void {
  const scale = Math.min(width / image.width, height / image.height);
  const drawWidth = image.width * scale;
  const drawHeight = image.height * scale;
  ctx.drawImage(
    image,
    x + (width - drawWidth) / 2,
    y + (height - drawHeight) / 2,
    drawWidth,
    drawHeight,
  );
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (ctx.measureText(candidate).width <= maxWidth || !current) {
      current = candidate;
    } else {
      lines.push(current);
      current = word;
    }
  }

  if (current) lines.push(current);
  return lines;
}

function fitParagraph(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number,
  buildFont: (size: number) => string,
  startSize: number,
  minSize: number,
  step = 4,
): { size: number; lines: string[] } {
  let size = startSize;
  let lines: string[] = [];

  while (size >= minSize) {
    ctx.font = buildFont(size);
    lines = wrapText(ctx, text, maxWidth);
    if (lines.length <= maxLines) break;
    size -= step;
  }

  return { size, lines };
}

function drawGiftIcon(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  size: number,
  boxColor: string,
  ribbonColor: string,
): void {
  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.scale(size / 100, size / 100);

  ctx.fillStyle = boxColor;
  roundRectPath(ctx, -34, 2, 68, 42, 6);
  ctx.fill();
  roundRectPath(ctx, -42, -16, 84, 20, 5);
  ctx.fill();

  ctx.fillStyle = ribbonColor;
  ctx.fillRect(-7, -16, 14, 60);
  ctx.fillRect(-42, 18, 84, 10);

  ctx.strokeStyle = boxColor;
  ctx.lineWidth = 9;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(0, -18);
  ctx.bezierCurveTo(-6, -36, -30, -36, -26, -20);
  ctx.bezierCurveTo(-23, -10, -8, -14, 0, -18);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, -18);
  ctx.bezierCurveTo(6, -36, 30, -36, 26, -20);
  ctx.bezierCurveTo(23, -10, 8, -14, 0, -18);
  ctx.stroke();

  ctx.restore();
}

function drawPhoto(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  centerX: number,
  centerY: number,
  size: number,
  ringColor: string,
): void {
  const radius = size / 2;

  ctx.save();
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius + 11, 0, Math.PI * 2);
  ctx.fillStyle = ringColor;
  ctx.fill();

  ctx.beginPath();
  ctx.arc(centerX, centerY, radius + 5, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.fill();

  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.clip();
  drawImageCover(
    ctx,
    image,
    centerX - radius,
    centerY - radius,
    size,
    size,
  );
  ctx.restore();
}

function drawHeadline(
  ctx: CanvasRenderingContext2D,
  config: ArtworkConfig,
): void {
  const { layout } = config.template;
  const theme = config.theme;
  const text = config.message.trim();
  if (!text) return;

  const isScript = layout.headlineFont === "script";
  const fontFor = (size: number) =>
    isScript
      ? `${size}px "Great Vibes", "Segoe Script", "Brush Script MT", cursive`
      : `italic 700 ${size}px Georgia, "Times New Roman", serif`;

  const { size, lines } = fitParagraph(
    ctx,
    text,
    layout.headlineWidth,
    layout.headlineMaxLines,
    fontFor,
    layout.headlineSize,
    isScript ? 74 : 58,
  );

  const lineHeight = Math.round(size * (isScript ? 1.06 : 1.14));
  const startY =
    layout.headlineTop + Math.max(0, (layout.headlineSize - size) / 3);

  if (theme.headlinePlate) {
    ctx.save();
    ctx.font = fontFor(size);
    const widestLine = Math.max(
      ...lines.map((line) => ctx.measureText(line).width),
      0,
    );
    const paddingX = 66;
    const paddingY = 34;
    const plateWidth = Math.min(widestLine + paddingX * 2, 960);
    const plateHeight = lineHeight * Math.max(lines.length, 1) + paddingY * 2;

    roundRectPath(
      ctx,
      ART_WIDTH / 2 - plateWidth / 2,
      startY - paddingY,
      plateWidth,
      plateHeight,
      34,
    );
    ctx.fillStyle = theme.headlinePlate;
    ctx.shadowColor = "rgba(0,0,0,0.16)";
    ctx.shadowBlur = 24;
    ctx.shadowOffsetY = 10;
    ctx.fill();
    ctx.restore();
  }

  ctx.save();
  ctx.font = fontFor(size);
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillStyle = theme.headline;
  ctx.shadowColor = "rgba(0,0,0,0.42)";
  ctx.shadowBlur = 22;
  ctx.shadowOffsetY = 8;

  lines.forEach((line, index) => {
    ctx.fillText(line, ART_WIDTH / 2, startY + index * lineHeight);
  });

  ctx.restore();
}

function drawLogoCard(
  ctx: CanvasRenderingContext2D,
  config: ArtworkConfig,
  logoImage: HTMLImageElement | null,
): void {
  const { layout, colors } = config.template;
  const theme = config.theme;
  const cardX = (ART_WIDTH - layout.cardWidth) / 2;
  const tileSize = 140;
  const tileX = cardX + 42;
  const tileY = layout.cardTop + (layout.cardHeight - tileSize) / 2;

  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.32)";
  ctx.shadowBlur = 34;
  ctx.shadowOffsetY = 14;
  roundRectPath(
    ctx,
    cardX,
    layout.cardTop,
    layout.cardWidth,
    layout.cardHeight,
    26,
  );
  ctx.fillStyle = theme.card;
  ctx.fill();
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  if (theme.border) {
    ctx.strokeStyle = theme.border;
    ctx.lineWidth = 3;
    ctx.stroke();
  }
  ctx.restore();

  ctx.save();
  roundRectPath(ctx, tileX, tileY, tileSize, tileSize, 24);
  ctx.fillStyle = theme.tile;
  ctx.fill();
  if (theme.border) {
    ctx.strokeStyle = theme.border;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  ctx.clip();
  if (logoImage) {
    drawImageContain(
      ctx,
      logoImage,
      tileX + 12,
      tileY + 12,
      tileSize - 24,
      tileSize - 24,
    );
  } else {
    drawGiftIcon(
      ctx,
      tileX + tileSize / 2,
      tileY + tileSize / 2 - 4,
      68,
      theme.icon,
      "#FFF3D6",
    );
  }
  ctx.restore();

  const name = config.businessName.trim() || DEFAULT_BUSINESS_NAME;
  const textX = tileX + tileSize + 34;
  const maxTextWidth = cardX + layout.cardWidth - textX - 38;

  let nameSize = layout.nameSize;
  const nameFont = (size: number) =>
    `700 ${size}px Georgia, "Times New Roman", serif`;
  ctx.font = nameFont(nameSize);
  while (ctx.measureText(name).width > maxTextWidth && nameSize > 30) {
    nameSize -= 2;
    ctx.font = nameFont(nameSize);
  }

  const nameY = layout.cardTop + layout.cardHeight * 0.4;
  ctx.save();
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillStyle = theme.cardText;
  ctx.font = nameFont(nameSize);
  ctx.fillText(name, textX, nameY);

  const secondary = config.secondary.trim();
  if (secondary) {
    const secondaryFit = fitParagraph(
      ctx,
      secondary,
      maxTextWidth,
      2,
      (size) => `400 ${size}px "Segoe UI", Arial, sans-serif`,
      31,
      22,
      1,
    );
    ctx.fillStyle = theme.muted;
    ctx.font = `400 ${secondaryFit.size}px "Segoe UI", Arial, sans-serif`;
    ctx.textBaseline = "top";
    const startY = nameY + nameSize / 2 + 12;
    const secondaryLineHeight = Math.round(secondaryFit.size * 1.25);
    secondaryFit.lines.forEach((line, index) => {
      ctx.fillText(
        line,
        textX,
        startY + index * secondaryLineHeight,
      );
    });
  }
  ctx.restore();
}

function drawCta(
  ctx: CanvasRenderingContext2D,
  config: ArtworkConfig,
): void {
  const { layout } = config.template;
  const theme = config.theme;
  const text = config.cta.trim().toUpperCase();
  if (!text) return;

  const x = (ART_WIDTH - layout.ctaWidth) / 2;
  const y = layout.ctaTop;
  const height = layout.ctaHeight;
  const maxTextWidth = layout.ctaWidth - 70;

  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.32)";
  ctx.shadowBlur = 24;
  ctx.shadowOffsetY = 10;
  roundRectPath(ctx, x, y, layout.ctaWidth, height, height / 2);
  ctx.fillStyle = theme.accent;
  ctx.fill();
  ctx.restore();

  let fontSize = 42;
  let spacing = 3;
  const measure = () => {
    ctx.font = `700 ${fontSize}px Georgia, "Times New Roman", serif`;
    const widths = Array.from(text).map(
      (character) => ctx.measureText(character).width,
    );
    const total =
      widths.reduce((sum, width) => sum + width, 0) +
      spacing * Math.max(text.length - 1, 0);
    return { widths, total };
  };

  let measured = measure();
  while (measured.total > maxTextWidth && fontSize > 26) {
    fontSize -= 2;
    spacing = fontSize > 34 ? 3 : 2;
    measured = measure();
  }

  const total = measured.total;
  let cursorX = ART_WIDTH / 2 - total / 2;
  const centerY = y + height / 2;

  ctx.save();
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillStyle = theme.accentText;
  ctx.font = `700 ${fontSize}px Georgia, "Times New Roman", serif`;
  Array.from(text).forEach((character, index) => {
    ctx.fillText(character, cursorX, centerY + 1);
    cursorX += measured.widths[index] + spacing;
  });
  ctx.restore();
}

function drawFooter(
  ctx: CanvasRenderingContext2D,
  config: ArtworkConfig,
): void {
  const { layout } = config.template;
  const theme = config.theme;
  const text = layout.footerText;
  if (!text) return;

  const fontFor = (size: number) =>
    `italic 400 ${size}px Georgia, "Times New Roman", serif`;
  const { size, lines } = fitParagraph(
    ctx,
    text,
    880,
    2,
    fontFor,
    34,
    24,
    2,
  );

  const lineHeight = Math.round(size * 1.3);

  if (theme.headlinePlate) {
    ctx.save();
    ctx.font = fontFor(size);
    const widestLine = Math.max(
      ...lines.map((line) => ctx.measureText(line).width),
      0,
    );
    const paddingX = 44;
    const paddingY = 20;
    const plateWidth = Math.min(widestLine + paddingX * 2, 960);
    const plateHeight = lineHeight * Math.max(lines.length, 1) + paddingY * 2;

    roundRectPath(
      ctx,
      ART_WIDTH / 2 - plateWidth / 2,
      layout.footerTop - paddingY,
      plateWidth,
      plateHeight,
      22,
    );
    ctx.fillStyle = theme.headlinePlate;
    ctx.shadowColor = "rgba(0,0,0,0.14)";
    ctx.shadowBlur = 18;
    ctx.shadowOffsetY = 8;
    ctx.fill();
    ctx.restore();
  }

  ctx.save();
  ctx.font = fontFor(size);
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillStyle = theme.footer;
  ctx.shadowColor = "rgba(0,0,0,0.38)";
  ctx.shadowBlur = 16;
  ctx.shadowOffsetY = 6;
  lines.forEach((line, index) => {
    ctx.fillText(line, ART_WIDTH / 2, layout.footerTop + index * lineHeight);
  });
  ctx.restore();
}

export async function renderArtwork(
  canvas: HTMLCanvasElement,
  config: ArtworkConfig,
  isCancelled: () => boolean = () => false,
): Promise<void> {
  const templateImage = await loadImage(config.template.image);
  const [logoImage, photoImage] = await Promise.all([
    config.logo ? loadImage(config.logo).catch(() => null) : null,
    config.photo && config.template.layout.hasPhoto
      ? loadImage(config.photo).catch(() => null)
      : null,
  ]);
  await ensureFontsReady();

  if (isCancelled()) return;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Seu navegador não suporta a geração de imagens.");
  }

  canvas.width = ART_WIDTH;
  canvas.height = ART_HEIGHT;

  const ctx = context;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  ctx.clearRect(0, 0, ART_WIDTH, ART_HEIGHT);
  ctx.fillStyle = "#123B2B";
  ctx.fillRect(0, 0, ART_WIDTH, ART_HEIGHT);

  if (config.template.imageFit === "contain") {
    ctx.save();
    ctx.filter = "blur(28px)";
    drawImageCover(ctx, templateImage, 0, 0, ART_WIDTH, ART_HEIGHT);
    ctx.restore();
    drawImageContain(ctx, templateImage, 0, 0, ART_WIDTH, ART_HEIGHT);
  } else {
    drawImageCover(ctx, templateImage, 0, 0, ART_WIDTH, ART_HEIGHT);
  }

  ctx.fillStyle = config.theme.veil;
  ctx.fillRect(0, 0, ART_WIDTH, ART_HEIGHT);

  if (photoImage) {
    drawPhoto(
      ctx,
      photoImage,
      ART_WIDTH / 2,
      config.template.layout.photoTop + config.template.layout.photoSize / 2,
      config.template.layout.photoSize,
      config.theme.accent,
    );
  }

  drawHeadline(ctx, config);
  drawLogoCard(ctx, config, logoImage);
  drawCta(ctx, config);
  drawFooter(ctx, config);
}

export async function renderArtworkDataUrl(
  config: ArtworkConfig,
): Promise<string> {
  if (typeof document === "undefined") {
    throw new Error("A geração da arte acontece apenas no navegador.");
  }
  const canvas = document.createElement("canvas");
  await renderArtwork(canvas, config);
  return canvas.toDataURL("image/png");
}
