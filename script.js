function createSeededRandom(seed = 1) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return function () {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function rgbaStr(hex, alpha = 1) {
  const clean = hex.replace("#", "");
  const num = parseInt(clean, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Deep-to-light blue palettes with cool ivory accents.
 */
const TULIP_PALETTES = {
  softPink: {
    petalDeep: "#164879",
    petalMid: "#4D8DC3",
    petalLight: "#A8D2E8",
    petalHighlight: "#E5F5FB",
    petalSheen: "#FBFEFF",
    base: "#123A67",
    shadow: "rgba(23, 58, 99, 0.26)",
  },
  blushPink: {
    petalDeep: "#25619D",
    petalMid: "#72ADD2",
    petalLight: "#C0E0EE",
    petalHighlight: "#EEF9FC",
    petalSheen: "#FFFFFF",
    base: "#1B4E88",
    shadow: "rgba(28, 76, 121, 0.23)",
  },
  rosePink: {
    petalDeep: "#0C356D",
    petalMid: "#3978B5",
    petalLight: "#8FC5E0",
    petalHighlight: "#D9F1FA",
    petalSheen: "#F8FDFF",
    base: "#082B5A",
    shadow: "rgba(12, 47, 92, 0.30)",
  },
  palePink: {
    petalDeep: "#7CA9C6",
    petalMid: "#AFD3E3",
    petalLight: "#DCEEF4",
    petalHighlight: "#F3FBFD",
    petalSheen: "#FFFFFF",
    base: "#5E90B5",
    shadow: "rgba(69, 112, 145, 0.20)",
  },
  snowWhite: {
    petalDeep: "#BCCEDA",
    petalMid: "#DDE8ED",
    petalLight: "#F2F8F8",
    petalHighlight: "#FEFFFF",
    petalSheen: "#FFFFFF",
    base: "#8BA7B8",
    shadow: "rgba(89, 117, 139, 0.20)",
  },
  pearlWhite: {
    petalDeep: "#B6CEDB",
    petalMid: "#D5E7ED",
    petalLight: "#ECF6F7",
    petalHighlight: "#FAFFFF",
    petalSheen: "#FFFFFF",
    base: "#93B4C4",
    shadow: "rgba(96, 132, 151, 0.18)",
  },
};

const WHISPER_NOTES = [
  "Chúc bạn một ngày 20/10 ngập tràn yêu thương và những bất ngờ nho nhỏ.",
  "Mong bạn luôn được lắng nghe, trân trọng và yêu thương theo cách mình xứng đáng.",
  "Chúc bạn đủ bình yên để nghỉ ngơi, đủ tự tin để theo đuổi điều mình thích.",
  "Một bông hoa dành cho nụ cười của bạn. Hôm nay nhớ vui thật nhiều nhé!",
  "Chúc những dự định của bạn sớm đơm hoa, từng chút một, theo nhịp của riêng mình.",
  "Mong mỗi ngày của bạn đều có một lý do thật nhỏ để mỉm cười.",
  "Chúc bạn luôn khỏe mạnh, an yên và có thật nhiều thời gian cho chính mình.",
];

/**
 * Draws a single tulip petal — the characteristic cupped/goblet shape.
 * Tulip petals are smooth, broad, and slightly ruffled only at the very tip.
 * They have a strong midrib vein and subtle longitudinal stripes.
 */
function drawTulipPetal(ctx, opts) {
  const {
    cx,
    cy,
    angle,
    length,
    width,
    openness,
    layerNorm,
    pal,
    rand,
    isInner = false,
  } = opts;

  // Tulip petal grows UPWARD from base (cx,cy).
  // angle=0 means straight up (-Y). Other angles spread petals around.
  // openness controls how wide the cup flares.
  const spreadAngle = (0.25 + openness * 0.55) * (isInner ? 0.75 : 1.0);

  // Petal base — narrow attachment at stem throat
  const baseHW = width * 0.18;

  // Petal tip — straight up then angled outward by spreadAngle
  const tipDist = length * (0.9 + openness * 0.1);
  const tipX = cx + Math.sin(angle) * Math.sin(spreadAngle) * tipDist;
  const tipY = cy - Math.cos(spreadAngle) * tipDist;

  // Shoulder — widest point ~55% up
  const shoulderH = length * 0.52;
  const shoulderSpread = width * (0.55 + openness * 0.45);
  const shoulderX = cx + Math.sin(angle) * shoulderSpread;
  const shoulderY = cy - shoulderH;

  // Neck — narrows before tip
  const neckH = length * 0.78;
  const neckSpread = width * (0.22 + openness * 0.18);
  const neckX =
    cx +
    Math.sin(angle) *
      (neckSpread + (rand() - 0.5) * width * (openness > 0.5 ? 0.1 : 0));
  const neckY = cy - neckH;

  // Base attachment points
  const bLx = cx + Math.sin(angle) * baseHW + Math.cos(angle) * baseHW * 0.4;
  const bLy = cy - Math.cos(angle) * baseHW * 0.2;
  const bRx = cx - Math.sin(angle) * baseHW * 0.3;
  const bRy = cy + Math.cos(angle) * baseHW * 0.1;

  ctx.save();
  ctx.shadowColor = pal.shadow;
  ctx.shadowBlur = 8 + layerNorm * 5;
  ctx.shadowOffsetX = Math.sin(angle) * 2;
  ctx.shadowOffsetY = 2;

  ctx.beginPath();
  ctx.moveTo(bLx, bLy);

  // Left edge: base → shoulder → neck → tip
  ctx.bezierCurveTo(
    bLx + Math.sin(angle) * width * 0.5,
    bLy - length * 0.2,
    shoulderX,
    shoulderY,
    shoulderX,
    shoulderY,
  );
  ctx.bezierCurveTo(
    shoulderX,
    shoulderY - length * 0.1,
    neckX,
    neckY,
    tipX,
    tipY,
  );

  // Right edge: tip → neck → shoulder → base (mirror)
  const neckRX = cx - Math.sin(angle) * (neckSpread * 0.7);
  const neckRY = neckY;
  const shoulderRX = cx - Math.sin(angle) * shoulderSpread * 0.7;
  const shoulderRY = shoulderY;

  ctx.bezierCurveTo(
    neckRX,
    neckRY,
    shoulderRX,
    shoulderRY - length * 0.1,
    shoulderRX,
    shoulderRY,
  );
  ctx.bezierCurveTo(
    shoulderRX,
    shoulderRY,
    bRx - Math.sin(angle) * width * 0.3,
    bRy - length * 0.15,
    bRx,
    bRy,
  );

  ctx.quadraticCurveTo(cx, cy, bLx, bLy);
  ctx.closePath();

  const grad = ctx.createLinearGradient(cx, cy, tipX, tipY);
  if (isInner) {
    grad.addColorStop(0, pal.petalDeep);
    grad.addColorStop(0.4, pal.petalMid);
    grad.addColorStop(0.75, pal.petalLight);
    grad.addColorStop(1, pal.petalSheen);
  } else if (layerNorm > 0.5) {
    grad.addColorStop(0, pal.base);
    grad.addColorStop(0.25, pal.petalDeep);
    grad.addColorStop(0.6, pal.petalMid);
    grad.addColorStop(0.88, pal.petalLight);
    grad.addColorStop(1, pal.petalHighlight);
  } else {
    grad.addColorStop(0, pal.petalDeep);
    grad.addColorStop(0.45, pal.petalMid);
    grad.addColorStop(0.82, pal.petalLight);
    grad.addColorStop(1, pal.petalSheen);
  }
  ctx.fillStyle = grad;
  ctx.fill();

  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;

  // Midrib vein
  ctx.beginPath();
  ctx.moveTo(cx, cy - length * 0.05);
  ctx.quadraticCurveTo(
    cx + Math.sin(angle) * width * 0.15,
    cy - length * 0.5,
    tipX,
    tipY,
  );
  ctx.strokeStyle = rgbaStr(pal.petalHighlight, 0.4);
  ctx.lineWidth = 0.9;
  ctx.stroke();

  // Sheen highlight on outer edge
  ctx.beginPath();
  ctx.moveTo(shoulderX, shoulderY);
  ctx.quadraticCurveTo(neckX, neckY, tipX, tipY);
  ctx.strokeStyle = rgbaStr(pal.petalSheen, openness > 0.3 ? 0.5 : 0.3);
  ctx.lineWidth = 1.1;
  ctx.stroke();

  ctx.restore();
}

/**
 * Draws the tulip's stamens and pistil — visible in open blooms
 */
function drawTulipStamens(ctx, cx, cy, radius, openness, pal) {
  if (openness < 0.55) return;
  const alpha = Math.max(0, (openness - 0.55) / 0.45);
  const stamenCount = 6;
  for (let s = 0; s < stamenCount; s++) {
    const a = (s / stamenCount) * Math.PI * 2 + 0.2;
    const stamenLen = radius * 0.45 * openness;
    const filamentX = cx + Math.cos(a) * radius * 0.08;
    const filamentY = cy + Math.sin(a) * radius * 0.08;
    const antherX = cx + Math.cos(a) * (radius * 0.12 + stamenLen * 0.5);
    const antherY =
      cy + Math.sin(a) * (radius * 0.12 + stamenLen * 0.5) - stamenLen * 0.4;
    ctx.save();
    ctx.globalAlpha = alpha * 0.85;
    // Filament
    ctx.beginPath();
    ctx.moveTo(filamentX, filamentY);
    ctx.lineTo(antherX, antherY);
    ctx.strokeStyle = rgbaStr(pal.petalHighlight, 0.7);
    ctx.lineWidth = 0.8;
    ctx.stroke();
    // Anther (pollen head)
    ctx.beginPath();
    ctx.ellipse(antherX, antherY, 2.5, 1.2, a + Math.PI * 0.5, 0, Math.PI * 2);
    ctx.fillStyle = s % 2 === 0 ? "#F8D060" : "#E8B840";
    ctx.fill();
    ctx.restore();
  }
  // Central pistil
  ctx.save();
  ctx.globalAlpha = alpha * 0.9;
  ctx.beginPath();
  ctx.ellipse(cx, cy - radius * 0.22 * openness, 3.5, 3.5, 0, 0, Math.PI * 2);
  ctx.fillStyle = "#5A8040";
  ctx.fill();
  ctx.restore();
}

/**
 * Pre-renders a single tulip into independent botanical layers for
 * the same bloom/unfurl animation system as the original roses.
 */
function drawRosePetal(
  ctx,
  { cx, cy, angle, length, width, pal, rand, depth },
) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);
  ctx.shadowColor = pal.shadow;
  ctx.shadowBlur = 7 + depth * 3;
  ctx.shadowOffsetY = 2;

  // A broad, curled oval gives the flower its rose/carnation silhouette.
  ctx.beginPath();
  ctx.moveTo(-width * 0.16, 5);
  ctx.bezierCurveTo(
    -width * 0.9,
    -length * 0.18,
    -width * 0.82,
    -length * 0.74,
    0,
    -length,
  );
  ctx.bezierCurveTo(
    width * 0.82,
    -length * 0.74,
    width * 0.9,
    -length * 0.18,
    width * 0.16,
    5,
  );
  ctx.bezierCurveTo(
    width * 0.06,
    length * 0.08,
    -width * 0.06,
    length * 0.08,
    -width * 0.16,
    5,
  );
  ctx.closePath();
  const petal = ctx.createLinearGradient(0, 2, 0, -length);
  petal.addColorStop(0, pal.base);
  petal.addColorStop(0.25, pal.petalDeep);
  petal.addColorStop(0.68, pal.petalMid);
  petal.addColorStop(1, pal.petalHighlight);
  ctx.fillStyle = petal;
  ctx.fill();

  // Folded top edge and a few restrained petal veins add depth without making it graphic.
  ctx.shadowColor = "transparent";
  ctx.beginPath();
  ctx.moveTo(-width * 0.58, -length * 0.68);
  ctx.quadraticCurveTo(
    0,
    -length * (0.95 + (rand() - 0.5) * 0.07),
    width * 0.58,
    -length * 0.68,
  );
  ctx.strokeStyle = rgbaStr(pal.petalSheen, 0.72);
  ctx.lineWidth = Math.max(0.8, width * 0.035);
  ctx.stroke();
  [-0.35, 0, 0.35].forEach((offset) => {
    ctx.beginPath();
    ctx.moveTo(offset * width * 0.22, 0);
    ctx.quadraticCurveTo(
      offset * width * 0.42,
      -length * 0.44,
      offset * width * 0.68,
      -length * 0.78,
    );
    ctx.strokeStyle = rgbaStr(pal.petalLight, 0.33);
    ctx.lineWidth = 0.75;
    ctx.stroke();
  });
  ctx.restore();
}

function createRealisticRoseSprite(config) {
  const {
    radius = 68,
    paletteKey = "roseRed",
    variety = "garden", // 'garden'=open | 'bud'=closed | 'classic'=mid | 'peony'=parrot-frilled
    tiltX = 0,
    tiltY = 0,
    seed = 101,
    hasDewdrop = false,
  } = config;

  const dpr = Math.min(window.devicePixelRatio || 2, 2.2);
  const pad = radius * 0.75;
  const logicalSize = (radius + pad) * 2;

  function createLayerCanvas() {
    const c = document.createElement("canvas");
    c.width = Math.ceil(logicalSize * dpr);
    c.height = Math.ceil(logicalSize * dpr);
    const lCtx = c.getContext("2d");
    lCtx.scale(dpr, dpr);
    return { canvas: c, ctx: lCtx };
  }

  const baseLayer = createLayerCanvas();
  const whorlLayers = [
    createLayerCanvas(), // outer petals
    createLayerCanvas(), // mid petals
    createLayerCanvas(), // inner petals
    createLayerCanvas(), // center / stamens
  ];

  const cx = logicalSize / 2;
  const cy = logicalSize / 2;
  const rand = createSeededRandom(seed);
  const pal = TULIP_PALETTES[paletteKey] || TULIP_PALETTES.softPink;

  // ── Base layer: stem base, sepal collar ──────────────────────────────────
  const bCtx0 = baseLayer.ctx;

  // Soft cast shadow below the flower head
  bCtx0.save();
  const baseShadow = bCtx0.createRadialGradient(
    cx + tiltX * 5,
    cy + radius * 0.18 + tiltY * 5,
    radius * 0.15,
    cx,
    cy + radius * 0.12,
    radius * 1.3,
  );
  baseShadow.addColorStop(0, "rgba(40, 15, 20, 0.38)");
  baseShadow.addColorStop(0.6, "rgba(40, 15, 20, 0.14)");
  baseShadow.addColorStop(1, "rgba(40, 15, 20, 0)");
  bCtx0.fillStyle = baseShadow;
  bCtx0.beginPath();
  bCtx0.arc(cx, cy + radius * 0.12, radius * 1.3, 0, Math.PI * 2);
  bCtx0.fill();
  bCtx0.restore();

  // Tulip sepal collar — 3 triangular green sepals at the very base
  const sepalCount = variety === "bud" ? 3 : 3;
  for (let s = 0; s < sepalCount; s++) {
    const sAngle = (s / sepalCount) * Math.PI * 2 + (rand() - 0.5) * 0.3;
    const sLen = radius * (variety === "bud" ? 0.62 : 0.5);
    bCtx0.save();
    bCtx0.translate(cx, cy);
    bCtx0.rotate(sAngle);
    bCtx0.beginPath();
    bCtx0.moveTo(0, -radius * 0.08);
    bCtx0.bezierCurveTo(
      sLen * 0.4,
      -radius * 0.18,
      sLen * 0.8,
      -radius * 0.12,
      sLen,
      0,
    );
    bCtx0.bezierCurveTo(
      sLen * 0.8,
      radius * 0.12,
      sLen * 0.4,
      radius * 0.18,
      0,
      radius * 0.08,
    );
    bCtx0.closePath();
    const sepGrad = bCtx0.createLinearGradient(0, 0, sLen, 0);
    sepGrad.addColorStop(0, "#2E5838");
    sepGrad.addColorStop(0.65, "#4A7850");
    sepGrad.addColorStop(1, "#6A9E6C");
    bCtx0.fillStyle = sepGrad;
    bCtx0.fill();
    bCtx0.restore();
  }

  // ── Whorl layers: tulip has 6 petals in 2 whorls (3 outer + 3 inner) ─────
  // We spread them across whorlLayers[0..2].
  // Outer whorl → whorlLayers[0]
  // Inner whorl → whorlLayers[1]
  // Parrot/frilled extras for 'peony' variety → whorlLayers[2]
  // Stamens/pistil → whorlLayers[3]

  // Determine base openness by variety (used to set initial closed shape)
  const baseOpenVariety =
    variety === "bud" ? 0.0 : variety === "classic" ? 0.22 : 0.38;

  // Concentric, overlapping petals form a florist-style rose rather than a tulip cup.
  const outerCtx = whorlLayers[0].ctx;
  const heartShiftX = tiltX * radius * 0.22;
  const heartShiftY = tiltY * radius * 0.22;
  const outerCx = cx + heartShiftX * 0.5;
  const outerCy = cy + heartShiftY * 0.5;

  const outerCount = variety === "bud" ? 5 : 8;
  for (let p = 0; p < outerCount; p++) {
    drawRosePetal(outerCtx, {
      cx: outerCx + Math.cos((p / outerCount) * Math.PI * 2) * radius * 0.12,
      cy: outerCy + Math.sin((p / outerCount) * Math.PI * 2) * radius * 0.12,
      angle: (p / outerCount) * Math.PI * 2 + rand() * 0.16,
      length: radius * (0.74 + rand() * 0.14),
      width: radius * (0.52 + rand() * 0.09),
      pal,
      rand,
      depth: 1,
    });
  }

  // Mid whorl — denser and turned slightly from the outer ring.
  const innerCtx = whorlLayers[1].ctx;
  const innerCx = cx + heartShiftX;
  const innerCy = cy + heartShiftY;

  const middleCount = variety === "bud" ? 4 : 7;
  for (let p = 0; p < middleCount; p++) {
    drawRosePetal(innerCtx, {
      cx: innerCx,
      cy: innerCy,
      angle:
        (p / middleCount) * Math.PI * 2 + Math.PI / middleCount + rand() * 0.12,
      length: radius * (0.55 + rand() * 0.1),
      width: radius * (0.38 + rand() * 0.08),
      pal,
      rand,
      depth: 2,
    });
  }

  // Parrot / frilled variety: extra wavy outer petal ring
  if (variety === "peony") {
    const frillCtx = whorlLayers[2].ctx;
    for (let p = 0; p < 11; p++) {
      drawRosePetal(frillCtx, {
        cx: innerCx,
        cy: innerCy,
        angle: (p / 11) * Math.PI * 2 + rand() * 0.18,
        length: radius * (0.36 + rand() * 0.09),
        width: radius * (0.26 + rand() * 0.06),
        pal,
        rand,
        depth: 3,
      });
    }
  }

  // Stamens & pistil center (drawn to whorlLayers[3])
  const stamenCtx = whorlLayers[3].ctx;
  drawTulipStamens(
    stamenCtx,
    innerCx,
    innerCy,
    radius * 0.32,
    baseOpenVariety,
    pal,
  );

  // Inner cup glow (warm subsurface)
  if (variety !== "bud") {
    const cupGlow = innerCtx.createRadialGradient(
      innerCx,
      innerCy,
      radius * 0.04,
      innerCx,
      innerCy,
      radius * 0.55,
    );
    cupGlow.addColorStop(0, rgbaStr(pal.petalDeep, 0.55));
    cupGlow.addColorStop(0.5, rgbaStr(pal.petalMid, 0.22));
    cupGlow.addColorStop(1, rgbaStr(pal.petalLight, 0));
    innerCtx.fillStyle = cupGlow;
    innerCtx.beginPath();
    innerCtx.arc(innerCx, innerCy, radius * 0.55, 0, Math.PI * 2);
    innerCtx.fill();
  }

  // Dewdrop
  if (hasDewdrop) {
    const dewCtx = whorlLayers[0].ctx;
    const dewAngle = rand() * Math.PI * 2;
    const dewDist = radius * (0.48 + rand() * 0.28);
    const dx = cx + Math.cos(dewAngle) * dewDist;
    const dy = cy + Math.sin(dewAngle) * dewDist;
    const dr = 3.2 + rand() * 2.0;

    dewCtx.save();
    dewCtx.fillStyle = "rgba(80, 20, 40, 0.22)";
    dewCtx.beginPath();
    dewCtx.ellipse(dx + 1, dy + 1.5, dr, dr * 0.82, 0.2, 0, Math.PI * 2);
    dewCtx.fill();

    const dewGrad = dewCtx.createRadialGradient(
      dx - dr * 0.3,
      dy - dr * 0.3,
      0.5,
      dx,
      dy,
      dr,
    );
    dewGrad.addColorStop(0, "rgba(255, 255, 255, 0.95)");
    dewGrad.addColorStop(0.45, "rgba(255, 240, 248, 0.55)");
    dewGrad.addColorStop(0.85, "rgba(240, 190, 210, 0.35)");
    dewGrad.addColorStop(1, "rgba(255, 255, 255, 0.75)");
    dewCtx.fillStyle = dewGrad;
    dewCtx.beginPath();
    dewCtx.ellipse(dx, dy, dr, dr * 0.85, -0.2, 0, Math.PI * 2);
    dewCtx.fill();

    dewCtx.fillStyle = "#FFFFFF";
    dewCtx.beginPath();
    dewCtx.arc(dx - dr * 0.35, dy - dr * 0.35, dr * 0.28, 0, Math.PI * 2);
    dewCtx.fill();
    dewCtx.restore();
  }

  return {
    baseCanvas: baseLayer.canvas,
    whorlCanvases: whorlLayers.map((l) => l.canvas),
    logicalSize,
    radius,
    palette: pal,
  };
}

/**
 * Draws a realistic serrated rose leaf or silvery eucalyptus sprig
 */
function drawBotanicalLeaf(ctx, x, y, angle, length, width, type = "roseLeaf") {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);

  ctx.shadowColor = "rgba(28, 56, 34, 0.16)";
  ctx.shadowBlur = 5;
  ctx.shadowOffsetY = 3;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(length * 0.46, -3, length, 0);
  ctx.strokeStyle = type === "eucalyptus" ? "#547D56" : "#356B3A";
  ctx.lineWidth = Math.max(1.25, width * 0.07);
  ctx.stroke();
  ctx.shadowColor = "transparent";

  const drawBlade = (
    bx,
    by,
    rotation,
    leafLength,
    leafWidth,
    colorA,
    colorB,
    serrated,
  ) => {
    ctx.save();
    ctx.translate(bx, by);
    ctx.rotate(rotation);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    if (serrated) {
      // Tiny notches make the darker rose foliage read as individual leaves.
      ctx.lineTo(leafLength * 0.22, -leafWidth * 0.82);
      ctx.lineTo(leafLength * 0.42, -leafWidth * 0.54);
      ctx.lineTo(leafLength * 0.63, -leafWidth * 0.68);
      ctx.lineTo(leafLength, 0);
      ctx.lineTo(leafLength * 0.63, leafWidth * 0.68);
      ctx.lineTo(leafLength * 0.42, leafWidth * 0.54);
      ctx.lineTo(leafLength * 0.22, leafWidth * 0.82);
    } else {
      ctx.bezierCurveTo(
        leafLength * 0.28,
        -leafWidth,
        leafLength * 0.8,
        -leafWidth * 0.7,
        leafLength,
        0,
      );
      ctx.bezierCurveTo(
        leafLength * 0.8,
        leafWidth * 0.7,
        leafLength * 0.28,
        leafWidth,
        0,
        0,
      );
    }
    ctx.closePath();
    const leafGrad = ctx.createLinearGradient(
      0,
      -leafWidth,
      leafLength,
      leafWidth,
    );
    leafGrad.addColorStop(0, colorA);
    leafGrad.addColorStop(1, colorB);
    ctx.fillStyle = leafGrad;
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(1, 0);
    ctx.lineTo(leafLength * 0.88, 0);
    ctx.strokeStyle = "rgba(230, 244, 215, 0.42)";
    ctx.lineWidth = 0.7;
    ctx.stroke();
    ctx.restore();
  };

  if (type === "eucalyptus") {
    // Light, airy eucalyptus: rounded paired leaves along a thin stem.
    for (let i = 0; i < 5; i++) {
      const at = 0.16 + i * 0.18;
      const side = i % 2 === 0 ? -1 : 1;
      drawBlade(
        length * at,
        -1,
        side * (0.88 + i * 0.035),
        width * (0.78 - i * 0.045),
        width * 0.46,
        "#628D61",
        "#A9C98D",
        false,
      );
      drawBlade(
        length * (at + 0.07),
        1,
        -side * (0.88 + i * 0.035),
        width * (0.68 - i * 0.038),
        width * 0.4,
        "#6B9867",
        "#B9D59A",
        false,
      );
    }
  } else {
    // Rose foliage is a small three-leaflet spray, not a single oversized blade.
    drawBlade(
      length * 0.13,
      0,
      -0.72,
      length * 0.54,
      width * 0.48,
      "#285D31",
      "#6FA65C",
      true,
    );
    drawBlade(
      length * 0.3,
      0,
      0.02,
      length * 0.65,
      width * 0.52,
      "#2E6D38",
      "#76AE62",
      true,
    );
    drawBlade(
      length * 0.22,
      0,
      0.74,
      length * 0.5,
      width * 0.44,
      "#2A6334",
      "#689B57",
      true,
    );
  }

  ctx.restore();
}

/**
 * Pre-renders a delicate cloud sprig of White Gypsophila (Hoa Baby) & Pink Waxflower
 */
function createBabyBreathClusterSprite(seed = 1) {
  const dpr = Math.min(window.devicePixelRatio || 2, 2.5);
  const size = 150;
  const canvas = document.createElement("canvas");
  canvas.width = size * dpr;
  canvas.height = size * dpr;
  const ctx = canvas.getContext("2d");
  ctx.scale(dpr, dpr);

  const rand = createSeededRandom(seed);
  const cx = size * 0.5;
  const cy = size * 0.82;

  const branches = 7;
  const blossomPoints = [];

  for (let b = 0; b < branches; b++) {
    const bAngle =
      -Math.PI * 0.5 + (b - (branches - 1) / 2) * 0.26 + (rand() - 0.5) * 0.12;
    const bLen = 48 + rand() * 46;
    const ex = cx + Math.cos(bAngle) * bLen;
    const ey = cy + Math.sin(bAngle) * bLen;

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.quadraticCurveTo(
      (cx + ex) * 0.5 + (rand() - 0.5) * 14,
      (cy + ey) * 0.5,
      ex,
      ey,
    );
    ctx.strokeStyle = "rgba(115, 148, 122, 0.55)";
    ctx.lineWidth = 1.1;
    ctx.stroke();

    blossomPoints.push({
      x: ex,
      y: ey,
      r: 5.2 + rand() * 2.5,
      isPink: rand() > 0.72,
    });

    for (let t = 0; t < 2; t++) {
      const tAngle = bAngle + (t === 0 ? -0.35 : 0.35) + (rand() - 0.5) * 0.15;
      const tLen = 16 + rand() * 18;
      const tx = (cx + ex) * 0.55 + Math.cos(tAngle) * tLen;
      const ty = (cy + ey) * 0.55 + Math.sin(tAngle) * tLen;

      ctx.beginPath();
      ctx.moveTo((cx + ex) * 0.55, (cy + ey) * 0.55);
      ctx.lineTo(tx, ty);
      ctx.lineWidth = 0.75;
      ctx.stroke();

      blossomPoints.push({
        x: tx,
        y: ty,
        r: 4.0 + rand() * 2.2,
        isPink: rand() > 0.78,
      });
    }
  }

  blossomPoints.forEach((pt) => {
    ctx.save();
    ctx.translate(pt.x, pt.y);
    ctx.shadowColor = "rgba(95, 45, 65, 0.18)";
    ctx.shadowBlur = 4;

    const petals = 5;
    for (let p = 0; p < petals; p++) {
      const pa = (p / petals) * Math.PI * 2 + rand() * 0.3;
      const px = Math.cos(pa) * (pt.r * 0.58);
      const py = Math.sin(pa) * (pt.r * 0.58);
      ctx.beginPath();
      ctx.arc(px, py, pt.r * 0.52, 0, Math.PI * 2);
      ctx.fillStyle = pt.isPink ? "#D7EDF7" : "#FFFFFF";
      ctx.fill();
    }

    ctx.beginPath();
    ctx.arc(0, 0, pt.r * 0.28, 0, Math.PI * 2);
    ctx.fillStyle = pt.isPink ? "#4D8FBC" : "#E5C86E";
    ctx.fill();
    ctx.restore();
  });

  return { canvas, size };
}

// ── Wrapping paper & ribbon — unchanged ────────────────────────────────────

/**
 * Draws a solid green foliage fill inside the bouquet to eliminate dark gaps
 */
function drawGreenFoliageFill(ctx, scale) {
  ctx.save();
  ctx.scale(scale, scale);

  // Main green fill — dense rich green filling the entire bouquet interior
  const mainFill = ctx.createRadialGradient(0, -60, 0, 0, -40, 230);
  mainFill.addColorStop(0, "rgba(70, 155, 88, 1.0)");
  mainFill.addColorStop(0.3, "rgba(58, 138, 74, 1.0)");
  mainFill.addColorStop(0.6, "rgba(44, 112, 58, 0.95)");
  mainFill.addColorStop(0.82, "rgba(34, 90, 46, 0.70)");
  ctx.fillStyle = mainFill;
  ctx.beginPath();
  ctx.ellipse(0, -50, 205, 195, 0, 0, Math.PI * 2);
  ctx.fill();

  // Upper bright highlight — lighter green at the top where leaves catch light
  const topFill = ctx.createRadialGradient(0, -140, 0, 0, -130, 130);
  topFill.addColorStop(0, "rgba(95, 185, 108, 0.90)");
  topFill.addColorStop(0.45, "rgba(72, 158, 86, 0.70)");
  topFill.addColorStop(1.0, "rgba(55, 130, 68, 0)");
  ctx.fillStyle = topFill;
  ctx.beginPath();
  ctx.ellipse(0, -130, 150, 130, 0, 0, Math.PI * 2);
  ctx.fill();

  // Left & right wing fills
  const leftFill = ctx.createRadialGradient(-130, -70, 0, -120, -60, 110);
  leftFill.addColorStop(0, "rgba(62, 145, 78, 0.85)");
  leftFill.addColorStop(1, "rgba(42, 105, 56, 0)");
  ctx.fillStyle = leftFill;
  ctx.beginPath();
  ctx.ellipse(-120, -60, 110, 90, -0.3, 0, Math.PI * 2);
  ctx.fill();

  const rightFill = ctx.createRadialGradient(130, -70, 0, 120, -60, 110);
  rightFill.addColorStop(0, "rgba(62, 145, 78, 0.85)");
  rightFill.addColorStop(1, "rgba(42, 105, 56, 0)");
  ctx.fillStyle = rightFill;
  ctx.beginPath();
  ctx.ellipse(120, -60, 110, 90, 0.3, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawWrappingPaperBack(ctx, cx, cy, scale) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);

  const bgShadow = ctx.createRadialGradient(0, 20, 40, 0, 45, 295);
  bgShadow.addColorStop(0, "rgba(115, 50, 70, 0.22)");
  bgShadow.addColorStop(0.65, "rgba(135, 65, 85, 0.08)");
  bgShadow.addColorStop(1, "rgba(135, 65, 85, 0)");
  ctx.fillStyle = bgShadow;
  ctx.beginPath();
  ctx.arc(0, 40, 295, 0, Math.PI * 2);
  ctx.fill();

  function drawPaperSheet(points, gradColors, trimColor) {
    ctx.save();
    ctx.shadowColor = "rgba(105, 48, 65, 0.14)";
    ctx.shadowBlur = 18;
    ctx.shadowOffsetY = 6;

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      const pt = points[i];
      ctx.bezierCurveTo(pt.cp1x, pt.cp1y, pt.cp2x, pt.cp2y, pt.x, pt.y);
    }
    ctx.closePath();

    const g = ctx.createLinearGradient(0, -260, 0, 220);
    g.addColorStop(0, gradColors[0]);
    g.addColorStop(0.55, gradColors[1]);
    g.addColorStop(1, gradColors[2]);
    ctx.fillStyle = g;
    ctx.fill();

    if (trimColor) {
      ctx.shadowColor = "transparent";
      ctx.strokeStyle = trimColor;
      ctx.lineWidth = 1.4;
      ctx.stroke();
    }
    ctx.restore();
  }

  drawPaperSheet(
    [
      { x: 0, y: 150 },
      { cp1x: -140, cp1y: 40, cp2x: -185, cp2y: -175, x: -115, y: -245 },
      { cp1x: -60, cp1y: -278, cp2x: -20, cp2y: -252, x: 0, y: -260 },
      { cp1x: 20, cp1y: -252, cp2x: 60, cp2y: -278, x: 115, y: -245 },
      { cp1x: 185, cp1y: -175, cp2x: 140, cp2y: 40, x: 0, y: 150 },
    ],
    ["#F9FDFF", "#E7F2F8", "#C4DCEB"],
    "rgba(122, 164, 193, 0.55)",
  );
  drawPaperSheet(
    [
      { x: -10, y: 165 },
      { cp1x: -150, cp1y: 80, cp2x: -258, cp2y: -60, x: -232, y: -155 },
      { cp1x: -212, cp1y: -215, cp2x: -145, cp2y: -220, x: -85, y: -195 },
      { cp1x: -30, cp1y: -165, cp2x: -10, cp2y: 40, x: -10, y: 165 },
    ],
    ["#F3F9FC", "#B8D5E5", "#6F9FBE"],
    "rgba(72, 124, 162, 0.62)",
  );
  drawPaperSheet(
    [
      { x: 10, y: 165 },
      { cp1x: 150, cp1y: 80, cp2x: 258, cp2y: -60, x: 232, y: -155 },
      { cp1x: 212, cp1y: -215, cp2x: 145, cp2y: -220, x: 85, y: -195 },
      { cp1x: 30, cp1y: -165, cp2x: 10, cp2y: 40, x: 10, y: 165 },
    ],
    ["#F3F9FC", "#B8D5E5", "#6F9FBE"],
    "rgba(72, 124, 162, 0.62)",
  );
  drawPaperSheet(
    [
      { x: 0, y: 130 },
      { cp1x: -180, cp1y: 30, cp2x: -225, cp2y: -120, x: -165, y: -182 },
      { cp1x: -115, cp1y: -225, cp2x: -55, cp2y: -205, x: 0, y: -218 },
      { cp1x: 55, cp1y: -205, cp2x: 115, cp2y: -225, x: 165, y: -182 },
      { cp1x: 225, cp1y: -120, cp2x: 180, cp2y: 30, x: 0, y: 130 },
    ],
    [
      "rgba(255,255,255,0.92)",
      "rgba(255,248,250,0.85)",
      "rgba(248,232,236,0.8)",
    ],
    "rgba(255, 255, 255, 0.9)",
  );

  // Bright green foliage bed — fills the interior of the bouquet
  const bedGrad = ctx.createRadialGradient(0, -20, 20, 0, -20, 200);
  bedGrad.addColorStop(0, "rgba(58, 130, 80, 0.90)");
  bedGrad.addColorStop(0.45, "rgba(48, 110, 65, 0.78)");
  bedGrad.addColorStop(0.78, "rgba(38, 88, 52, 0.45)");
  bedGrad.addColorStop(1, "rgba(30, 70, 42, 0)");
  ctx.fillStyle = bedGrad;
  ctx.beginPath();
  ctx.ellipse(0, -20, 195, 175, 0, 0, Math.PI * 2);
  ctx.fill();

  // Secondary lighter highlight in the center top
  const bedHighlight = ctx.createRadialGradient(0, -80, 10, 0, -70, 110);
  bedHighlight.addColorStop(0, "rgba(90, 170, 100, 0.60)");
  bedHighlight.addColorStop(0.55, "rgba(68, 140, 80, 0.28)");
  bedHighlight.addColorStop(1, "rgba(55, 115, 65, 0)");
  ctx.fillStyle = bedHighlight;
  ctx.beginPath();
  ctx.ellipse(0, -70, 130, 110, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawWrappingPaperFrontAndRibbon(ctx, cx, cy, scale, time) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);

  const waistX = 0;
  const waistY = 148;

  // Tulip stems — slightly thicker and straighter than rose stems
  // The stems are fully tucked into the new wrap; drawing them here leaves an
  // unwanted green strip beneath the ribbon on smaller screens.
  const stemOffsets = [];
  stemOffsets.forEach((ox, idx) => {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(ox * 0.4, waistY + 40);
    ctx.quadraticCurveTo(
      ox * 0.8,
      waistY + 95,
      ox * 1.35,
      waistY + 148 + (idx % 2) * 8,
    );
    ctx.strokeStyle = idx % 2 === 0 ? "#3E5E46" : "#4E7256";
    ctx.lineWidth = 5.5;
    ctx.lineCap = "round";
    ctx.stroke();
    ctx.restore();
  });

  ctx.save();
  ctx.shadowColor = "rgba(95, 40, 58, 0.16)";
  ctx.shadowBlur = 16;
  ctx.shadowOffsetY = 8;
  ctx.beginPath();
  ctx.moveTo(-48, waistY - 5);
  ctx.bezierCurveTo(-82, waistY + 45, -112, waistY + 95, -88, waistY + 132);
  ctx.bezierCurveTo(-40, waistY + 142, 40, waistY + 142, 88, waistY + 132);
  ctx.bezierCurveTo(112, waistY + 95, 82, waistY + 45, 48, waistY - 5);
  ctx.closePath();
  const skirtGrad = ctx.createLinearGradient(0, waistY, 0, waistY + 138);
  skirtGrad.addColorStop(0, "#4C83B1");
  skirtGrad.addColorStop(0.45, "#76A9CB");
  skirtGrad.addColorStop(1, "#C7E2EE");
  ctx.fillStyle = skirtGrad;
  ctx.fill();
  ctx.restore();

  // Fine pleats catch the light on the lower pink paper, keeping the wrap soft
  // instead of reading as one flat block of colour.
  ctx.save();
  [-56, -28, 0, 28, 56].forEach((foldX, index) => {
    ctx.beginPath();
    ctx.moveTo(foldX * 0.5, waistY + 8);
    ctx.quadraticCurveTo(foldX * 0.88, waistY + 65, foldX, waistY + 128);
    ctx.strokeStyle =
      index % 2 === 0 ? "rgba(255,250,247,0.42)" : "rgba(193,119,128,0.20)";
    ctx.lineWidth = index === 2 ? 1.5 : 1;
    ctx.stroke();
  });
  ctx.restore();

  ctx.save();
  ctx.shadowColor = "rgba(100, 42, 60, 0.15)";
  ctx.shadowBlur = 15;
  ctx.shadowOffsetY = 4;
  ctx.beginPath();
  ctx.moveTo(-195, -18);
  ctx.bezierCurveTo(-215, 55, -135, 118, -42, waistY + 2);
  ctx.bezierCurveTo(-65, waistY + 52, -78, waistY + 98, -55, waistY + 125);
  ctx.bezierCurveTo(-15, waistY + 128, 12, waistY + 115, 22, waistY + 98);
  ctx.bezierCurveTo(15, waistY + 48, 8, waistY + 12, 18, waistY - 8);
  ctx.bezierCurveTo(-45, 92, -125, 62, -195, -18);
  ctx.closePath();
  const leftFoldGrad = ctx.createLinearGradient(-195, 0, 30, waistY + 110);
  leftFoldGrad.addColorStop(0, "#F9FDFF");
  leftFoldGrad.addColorStop(0.46, "#B9D8E8");
  leftFoldGrad.addColorStop(1, "#4C83B1");
  ctx.fillStyle = leftFoldGrad;
  ctx.fill();
  ctx.strokeStyle = "rgba(220, 165, 180, 0.65)";
  ctx.lineWidth = 1.3;
  ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.shadowColor = "rgba(95, 38, 56, 0.18)";
  ctx.shadowBlur = 16;
  ctx.shadowOffsetX = -3;
  ctx.shadowOffsetY = 5;
  ctx.beginPath();
  ctx.moveTo(195, -18);
  ctx.bezierCurveTo(215, 55, 135, 118, 42, waistY + 2);
  ctx.bezierCurveTo(68, waistY + 54, 84, waistY + 102, 58, waistY + 128);
  ctx.bezierCurveTo(10, waistY + 135, -24, waistY + 120, -34, waistY + 102);
  ctx.bezierCurveTo(-18, waistY + 50, -12, waistY + 12, -22, waistY - 12);
  ctx.bezierCurveTo(45, 88, 128, 60, 195, -18);
  ctx.closePath();
  const rightFoldGrad = ctx.createLinearGradient(195, 0, -40, waistY + 120);
  rightFoldGrad.addColorStop(0, "#F9FDFF");
  rightFoldGrad.addColorStop(0.46, "#B9D8E8");
  rightFoldGrad.addColorStop(1, "#4C83B1");
  ctx.fillStyle = rightFoldGrad;
  ctx.fill();
  ctx.strokeStyle = "rgba(212, 155, 170, 0.72)";
  ctx.lineWidth = 1.4;
  ctx.stroke();
  ctx.restore();

  // A delicate double edge separates the ivory lining from the dusty-pink wrap.
  ctx.save();
  [-1, 1].forEach((offset) => {
    ctx.beginPath();
    ctx.moveTo(-190, -17 + offset * 2);
    ctx.bezierCurveTo(-145, 47, -89, 95, -37, waistY + 3);
    ctx.strokeStyle =
      offset < 0 ? "rgba(255,255,255,0.72)" : "rgba(195,126,134,0.36)";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(190, -17 + offset * 2);
    ctx.bezierCurveTo(145, 47, 89, 95, 37, waistY + 3);
    ctx.stroke();
  });
  ctx.restore();

  // Soft white tissue peeking over the pink wrap, with a hand-gathered edge.
  ctx.save();
  ctx.shadowColor = "rgba(116, 72, 80, 0.12)";
  ctx.shadowBlur = 9;
  ctx.shadowOffsetY = 4;
  ctx.beginPath();
  ctx.moveTo(-132, 40);
  ctx.bezierCurveTo(-112, 68, -105, 100, -82, 116);
  ctx.bezierCurveTo(-64, 93, -50, 90, -34, 116);
  ctx.bezierCurveTo(-13, 87, 8, 89, 24, 117);
  ctx.bezierCurveTo(43, 92, 61, 94, 78, 118);
  ctx.bezierCurveTo(95, 92, 111, 70, 132, 43);
  ctx.bezierCurveTo(105, 116, 69, 151, 0, 164);
  ctx.bezierCurveTo(-69, 151, -105, 116, -132, 40);
  ctx.closePath();
  const tissueGrad = ctx.createLinearGradient(0, 42, 0, 165);
  tissueGrad.addColorStop(0, "rgba(255,255,255,0.98)");
  tissueGrad.addColorStop(0.56, "rgba(255,249,248,0.94)");
  tissueGrad.addColorStop(1, "rgba(235,221,222,0.88)");
  ctx.fillStyle = tissueGrad;
  ctx.fill();
  ctx.shadowColor = "transparent";
  [-76, -37, 0, 38, 76].forEach((x) => {
    ctx.beginPath();
    ctx.moveTo(x, 93 + Math.abs(x) * 0.12);
    ctx.quadraticCurveTo(x + 6, 128, x * 0.58, 153);
    ctx.strokeStyle = "rgba(204, 181, 184, 0.38)";
    ctx.lineWidth = 1.15;
    ctx.stroke();
  });
  ctx.restore();

  // Ribbon bow
  const breeze = Math.sin(time * 1.8) * 6;
  const breeze2 = Math.cos(time * 1.4) * 5;
  ctx.save();
  ctx.translate(waistX, waistY + 4);

  ctx.shadowColor = "rgba(115, 25, 52, 0.28)";
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 4;

  const ribbonBandGrad = ctx.createLinearGradient(-46, 0, 46, 0);
  ribbonBandGrad.addColorStop(0, "#D8CFD0");
  ribbonBandGrad.addColorStop(0.3, "#FFFDF9");
  ribbonBandGrad.addColorStop(0.5, "#FFFFFF");
  ribbonBandGrad.addColorStop(0.75, "#F0E7E5");
  ribbonBandGrad.addColorStop(1, "#CFC4C5");
  ctx.fillStyle = ribbonBandGrad;
  ctx.beginPath();
  ctx.roundRect(-45, -11, 90, 22, 8);
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(-10, 8);
  ctx.bezierCurveTo(-38, 45, -68 + breeze, 92, -52 + breeze * 1.3, 142);
  ctx.lineTo(-34 + breeze * 1.3, 134);
  ctx.bezierCurveTo(-46 + breeze, 88, -20, 44, 4, 8);
  ctx.closePath();
  const tailGradL = ctx.createLinearGradient(-10, 8, -50, 140);
  tailGradL.addColorStop(0, "#D8CFD0");
  tailGradL.addColorStop(0.45, "#FFFDFC");
  tailGradL.addColorStop(1, "#DDD5D3");
  ctx.fillStyle = tailGradL;
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(10, 8);
  ctx.bezierCurveTo(40, 48, 72 + breeze2, 95, 58 + breeze2 * 1.3, 146);
  ctx.lineTo(38 + breeze2 * 1.3, 138);
  ctx.bezierCurveTo(50 + breeze2, 92, 22, 46, -4, 8);
  ctx.closePath();
  const tailGradR = ctx.createLinearGradient(10, 8, 55, 145);
  tailGradR.addColorStop(0, "#D8CFD0");
  tailGradR.addColorStop(0.5, "#FFFFFF");
  tailGradR.addColorStop(1, "#DDD5D3");
  ctx.fillStyle = tailGradR;
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(-6, -2);
  ctx.bezierCurveTo(-55, -36, -92, -12, -78, 14);
  ctx.bezierCurveTo(-65, 34, -28, 18, -4, 4);
  ctx.closePath();
  const loopGradL = ctx.createLinearGradient(-85, -15, -5, 10);
  loopGradL.addColorStop(0, "#D6CCCD");
  loopGradL.addColorStop(0.45, "#FFFDFC");
  loopGradL.addColorStop(1, "#D7CDCE");
  ctx.fillStyle = loopGradL;
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(6, -2);
  ctx.bezierCurveTo(55, -36, 92, -12, 78, 14);
  ctx.bezierCurveTo(65, 34, 28, 18, 4, 4);
  ctx.closePath();
  const loopGradR = ctx.createLinearGradient(85, -15, 5, 10);
  loopGradR.addColorStop(0, "#D6CCCD");
  loopGradR.addColorStop(0.45, "#FFFDFC");
  loopGradR.addColorStop(1, "#D7CDCE");
  ctx.fillStyle = loopGradR;
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(-6, 2);
  ctx.bezierCurveTo(-48, 8, -72, 28, -54, 42);
  ctx.bezierCurveTo(-38, 52, -15, 25, -3, 6);
  ctx.closePath();
  ctx.fillStyle = "#F7F0EF";
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(6, 2);
  ctx.bezierCurveTo(48, 8, 72, 28, 54, 42);
  ctx.bezierCurveTo(38, 52, 15, 25, 3, 6);
  ctx.closePath();
  ctx.fillStyle = "#F7F0EF";
  ctx.fill();

  const knotGrad = ctx.createRadialGradient(-3, -3, 2, 0, 0, 16);
  knotGrad.addColorStop(0, "#FFFFFF");
  knotGrad.addColorStop(0.45, "#EEE6E4");
  knotGrad.addColorStop(1, "#CFC4C5");
  ctx.fillStyle = knotGrad;
  ctx.beginPath();
  ctx.roundRect(-13, -12, 26, 24, 9);
  ctx.fill();

  const tagAngle = Math.sin(time * 2.1) * 0.08 + 0.12;
  ctx.save();
  ctx.rotate(tagAngle);
  ctx.beginPath();
  ctx.moveTo(4, 10);
  ctx.lineTo(18, 34);
  ctx.strokeStyle = "#D4AF37";
  ctx.lineWidth = 1.2;
  ctx.stroke();
  ctx.translate(18, 34);
  ctx.fillStyle = "#FFFDFB";
  ctx.strokeStyle = "#E2B8C4";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(-22, 0, 44, 26, 6);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#B83B5E";
  ctx.font = "italic 600 10px Georgia, serif";
  ctx.textAlign = "center";
  ctx.fillText("25 • 10", 0, 16);
  ctx.restore();

  ctx.restore();
  ctx.restore();
}

// A clean fan-wrap placed over the structural paper layers.  Its wide ivory collar
// frames the blooms while the dusty-rose cone keeps the lower half calm and elegant.
function drawFanWrap(ctx, scale, time) {
  ctx.save();
  ctx.scale(scale, scale);
  const waistY = 155;

  ctx.save();
  ctx.shadowColor = "rgba(108, 60, 68, 0.17)";
  ctx.shadowBlur = 16;
  ctx.shadowOffsetY = 7;
  ctx.beginPath();
  ctx.moveTo(-205, -8);
  ctx.bezierCurveTo(-165, 58, -88, 125, -39, waistY);
  ctx.bezierCurveTo(-55, 214, -72, 261, -63, 294);
  ctx.quadraticCurveTo(0, 316, 63, 294);
  ctx.bezierCurveTo(72, 261, 55, 214, 39, waistY);
  ctx.bezierCurveTo(88, 125, 165, 58, 205, -8);
  ctx.quadraticCurveTo(0, 38, -205, -8);
  ctx.closePath();
  const cone = ctx.createLinearGradient(0, 20, 0, 306);
  cone.addColorStop(0, "#9FC8DE");
  cone.addColorStop(0.5, "#5D94BD");
  cone.addColorStop(1, "#2E669A");
  ctx.fillStyle = cone;
  ctx.fill();
  ctx.restore();

  // Layered ivory fan at the mouth of the bouquet.
  const panels = [-1, -0.5, 0, 0.5, 1];
  panels.forEach((p, i) => {
    const x = p * 170;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x - 48, 4 + Math.abs(p) * 15);
    ctx.quadraticCurveTo(x, 83 - Math.abs(p) * 18, p * 28, waistY + 5);
    ctx.quadraticCurveTo(x - 16, 90, x + 48, 4 + Math.abs(p) * 15);
    ctx.closePath();
    const paper = ctx.createLinearGradient(x, 0, p * 28, waistY);
    paper.addColorStop(0, i % 2 ? "#FFFFFF" : "#EAF5FA");
    paper.addColorStop(1, i % 2 ? "#BEDBE9" : "#D7EAF3");
    ctx.fillStyle = paper;
    ctx.fill();
    ctx.strokeStyle = "rgba(205, 153, 158, 0.42)";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
  });

  // Satin tie, intentionally simple so the flowers remain the focus.
  const breeze = Math.sin(time * 1.6) * 3;
  ctx.save();
  ctx.translate(0, waistY + 8);
  ctx.fillStyle = "#FFFDFC";
  ctx.strokeStyle = "rgba(203, 184, 181, 0.75)";
  ctx.lineWidth = 1;
  [
    [-1, -1],
    [1, 1],
  ].forEach(([side]) => {
    ctx.beginPath();
    ctx.moveTo(side * 7, 0);
    ctx.bezierCurveTo(side * 42, -30, side * 81, -23, side * 72, 4);
    ctx.bezierCurveTo(side * 62, 25, side * 24, 14, side * 5, 3);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  });
  ctx.beginPath();
  ctx.ellipse(0, 0, 14, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  [-1, 1].forEach((side) => {
    ctx.beginPath();
    ctx.moveTo(side * 7, 8);
    ctx.bezierCurveTo(side * 23, 55, side * (34 + breeze), 104, side * 22, 132);
    ctx.lineTo(side * 8, 126);
    ctx.bezierCurveTo(side * 10, 82, side * 2, 41, side * -3, 8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  });
  ctx.restore();
  ctx.restore();
}

// ── Bouquet layout — 22 tulips arranged like a classic florist bouquet ─────
// Palette keys mapped to TULIP_PALETTES. Varieties: 'bud' | 'classic' | 'garden' | 'peony'
const BOUQUET_LAYOUT = [
  // TIER 1: Back halo — tall buds arching upward
  {
    x: -128,
    y: -165,
    r: 50,
    paletteKey: "softPink",
    variety: "bud",
    tiltX: -0.35,
    tiltY: -0.38,
    z: 1,
    seed: 11,
  },
  {
    x: -62,
    y: -192,
    r: 54,
    paletteKey: "pearlWhite",
    variety: "bud",
    tiltX: -0.18,
    tiltY: -0.42,
    z: 1,
    seed: 12,
  },
  {
    x: 8,
    y: -202,
    r: 56,
    paletteKey: "blushPink",
    variety: "bud",
    tiltX: 0.02,
    tiltY: -0.44,
    z: 1,
    seed: 13,
  },
  {
    x: 76,
    y: -188,
    r: 54,
    paletteKey: "palePink",
    variety: "bud",
    tiltX: 0.22,
    tiltY: -0.4,
    z: 1,
    seed: 14,
  },
  {
    x: 134,
    y: -158,
    r: 50,
    paletteKey: "softPink",
    variety: "bud",
    tiltX: 0.38,
    tiltY: -0.34,
    z: 1,
    seed: 15,
  },
  {
    x: -172,
    y: -98,
    r: 52,
    paletteKey: "snowWhite",
    variety: "bud",
    tiltX: -0.46,
    tiltY: -0.16,
    z: 1,
    seed: 16,
  },
  {
    x: 174,
    y: -92,
    r: 52,
    paletteKey: "rosePink",
    variety: "bud",
    tiltX: 0.46,
    tiltY: -0.16,
    z: 1,
    seed: 17,
  },

  // TIER 2: Mid-dome — half-open classic tulips
  {
    x: -115,
    y: -112,
    r: 62,
    paletteKey: "palePink",
    variety: "classic",
    tiltX: -0.28,
    tiltY: -0.24,
    z: 2,
    seed: 21,
    hasDewdrop: true,
  },
  {
    x: -38,
    y: -138,
    r: 66,
    paletteKey: "rosePink",
    variety: "classic",
    tiltX: -0.1,
    tiltY: -0.26,
    z: 2,
    seed: 22,
  },
  {
    x: 44,
    y: -135,
    r: 64,
    paletteKey: "pearlWhite",
    variety: "classic",
    tiltX: 0.12,
    tiltY: -0.26,
    z: 2,
    seed: 23,
    hasDewdrop: true,
  },
  {
    x: 118,
    y: -108,
    r: 62,
    paletteKey: "softPink",
    variety: "classic",
    tiltX: 0.28,
    tiltY: -0.22,
    z: 2,
    seed: 24,
  },
  {
    x: -150,
    y: -32,
    r: 60,
    paletteKey: "blushPink",
    variety: "classic",
    tiltX: -0.36,
    tiltY: 0.02,
    z: 2,
    seed: 25,
  },
  {
    x: 152,
    y: -28,
    r: 60,
    paletteKey: "palePink",
    variety: "classic",
    tiltX: 0.36,
    tiltY: 0.02,
    z: 2,
    seed: 26,
  },
  {
    x: -118,
    y: 38,
    r: 60,
    paletteKey: "snowWhite",
    variety: "classic",
    tiltX: -0.28,
    tiltY: 0.24,
    z: 2,
    seed: 27,
  },
  {
    x: 120,
    y: 42,
    r: 60,
    paletteKey: "rosePink",
    variety: "classic",
    tiltX: 0.28,
    tiltY: 0.24,
    z: 2,
    seed: 28,
  },

  // TIER 3: Hero blooms — fully open garden tulips
  {
    x: -78,
    y: -58,
    r: 72,
    paletteKey: "rosePink",
    variety: "garden",
    tiltX: -0.14,
    tiltY: -0.08,
    z: 3,
    seed: 31,
    hasDewdrop: true,
  },
  {
    x: 78,
    y: -55,
    r: 70,
    paletteKey: "softPink",
    variety: "garden",
    tiltX: 0.15,
    tiltY: -0.08,
    z: 3,
    seed: 32,
  },
  {
    x: -58,
    y: 25,
    r: 70,
    paletteKey: "pearlWhite",
    variety: "peony",
    tiltX: -0.12,
    tiltY: 0.16,
    z: 3,
    seed: 33,
    hasDewdrop: true,
  },
  {
    x: 60,
    y: 28,
    r: 68,
    paletteKey: "blushPink",
    variety: "garden",
    tiltX: 0.12,
    tiltY: 0.16,
    z: 3,
    seed: 34,
    hasDewdrop: true,
  },
  {
    x: 0,
    y: 48,
    r: 66,
    paletteKey: "palePink",
    variety: "garden",
    tiltX: 0.0,
    tiltY: 0.22,
    z: 3,
    seed: 35,
  },

  // TIER 4: Crown jewel center
  {
    x: 0,
    y: -78,
    r: 74,
    paletteKey: "snowWhite",
    variety: "peony",
    tiltX: 0.0,
    tiltY: -0.12,
    z: 4,
    seed: 41,
    hasDewdrop: true,
  },
  {
    x: -2,
    y: -10,
    r: 80,
    paletteKey: "rosePink",
    variety: "peony",
    tiltX: 0.0,
    tiltY: 0.02,
    z: 4,
    seed: 42,
    hasDewdrop: true,
  },
];

const FOLIAGE_LAYOUT = [
  // ── BACK layer – tall leaves fanning behind the bloom ──────────────────
  {
    x: -145,
    y: -145,
    angle: -2.35,
    len: 130,
    w: 38,
    type: "eucalyptus",
    layer: "back",
  },
  {
    x: -85,
    y: -185,
    angle: -1.85,
    len: 136,
    w: 36,
    type: "roseLeaf",
    layer: "back",
  },
  {
    x: -10,
    y: -200,
    angle: -1.55,
    len: 140,
    w: 38,
    type: "eucalyptus",
    layer: "back",
  },
  {
    x: 75,
    y: -185,
    angle: -1.25,
    len: 134,
    w: 36,
    type: "roseLeaf",
    layer: "back",
  },
  {
    x: 145,
    y: -140,
    angle: -0.75,
    len: 130,
    w: 38,
    type: "eucalyptus",
    layer: "back",
  },
  {
    x: -175,
    y: -65,
    angle: -2.75,
    len: 126,
    w: 37,
    type: "roseLeaf",
    layer: "back",
  },
  {
    x: 175,
    y: -60,
    angle: -0.35,
    len: 126,
    w: 37,
    type: "roseLeaf",
    layer: "back",
  },

  // ── MID layer – dense inner leaves filling gaps between flowers ─────────
  {
    x: -112,
    y: -128,
    angle: -2.05,
    len: 110,
    w: 32,
    type: "roseLeaf",
    layer: "back",
  },
  {
    x: -50,
    y: -160,
    angle: -1.68,
    len: 118,
    w: 33,
    type: "eucalyptus",
    layer: "back",
  },
  {
    x: 30,
    y: -162,
    angle: -1.38,
    len: 115,
    w: 32,
    type: "roseLeaf",
    layer: "back",
  },
  {
    x: 110,
    y: -125,
    angle: -0.98,
    len: 112,
    w: 32,
    type: "eucalyptus",
    layer: "back",
  },
  {
    x: -155,
    y: -10,
    angle: -2.55,
    len: 108,
    w: 30,
    type: "roseLeaf",
    layer: "back",
  },
  {
    x: 158,
    y: -8,
    angle: -0.58,
    len: 108,
    w: 30,
    type: "eucalyptus",
    layer: "back",
  },
  {
    x: -88,
    y: -60,
    angle: -2.18,
    len: 105,
    w: 29,
    type: "roseLeaf",
    layer: "back",
  },
  {
    x: 85,
    y: -58,
    angle: -0.95,
    len: 105,
    w: 29,
    type: "eucalyptus",
    layer: "back",
  },
  {
    x: -20,
    y: -90,
    angle: -1.55,
    len: 100,
    w: 28,
    type: "roseLeaf",
    layer: "back",
  },
  {
    x: 22,
    y: -88,
    angle: -1.52,
    len: 102,
    w: 28,
    type: "eucalyptus",
    layer: "back",
  },

  // ── FRONT layer – visible leaves in foreground ──────────────────────────
  {
    x: -140,
    y: 45,
    angle: 2.55,
    len: 115,
    w: 34,
    type: "roseLeaf",
    layer: "front",
  },
  {
    x: -85,
    y: 72,
    angle: 2.15,
    len: 122,
    w: 35,
    type: "eucalyptus",
    layer: "front",
  },
  {
    x: -28,
    y: 82,
    angle: 1.78,
    len: 112,
    w: 32,
    type: "roseLeaf",
    layer: "front",
  },
  {
    x: 32,
    y: 82,
    angle: 1.35,
    len: 112,
    w: 32,
    type: "roseLeaf",
    layer: "front",
  },
  {
    x: 88,
    y: 70,
    angle: 0.95,
    len: 122,
    w: 35,
    type: "eucalyptus",
    layer: "front",
  },
  {
    x: 142,
    y: 42,
    angle: 0.55,
    len: 115,
    w: 34,
    type: "roseLeaf",
    layer: "front",
  },
  {
    x: -60,
    y: 55,
    angle: 2.0,
    len: 100,
    w: 28,
    type: "eucalyptus",
    layer: "front",
  },
  {
    x: 62,
    y: 58,
    angle: 1.12,
    len: 100,
    w: 28,
    type: "roseLeaf",
    layer: "front",
  },
  {
    x: 5,
    y: 68,
    angle: 1.57,
    len: 95,
    w: 26,
    type: "eucalyptus",
    layer: "front",
  },
];

const BABY_BREATH_LAYOUT = [
  { x: -158, y: -142, angle: -0.65, scale: 0.92, layer: "back", seed: 101 },
  { x: -35, y: -208, angle: -0.12, scale: 0.96, layer: "back", seed: 102 },
  { x: 48, y: -204, angle: 0.18, scale: 0.94, layer: "back", seed: 103 },
  { x: 162, y: -135, angle: 0.68, scale: 0.92, layer: "back", seed: 104 },
  { x: -188, y: -42, angle: -1.05, scale: 0.88, layer: "back", seed: 105 },
  { x: 190, y: -38, angle: 1.05, scale: 0.88, layer: "back", seed: 106 },
  { x: -102, y: -82, angle: -0.45, scale: 0.72, layer: "front", seed: 201 },
  { x: 104, y: -78, angle: 0.45, scale: 0.72, layer: "front", seed: 202 },
  { x: -125, y: 18, angle: -0.85, scale: 0.78, layer: "front", seed: 203 },
  { x: 128, y: 22, angle: 0.85, scale: 0.78, layer: "front", seed: 204 },
  { x: -45, y: 68, angle: -0.25, scale: 0.75, layer: "front", seed: 205 },
  { x: 48, y: 68, angle: 0.25, scale: 0.75, layer: "front", seed: 206 },
];

// ── Runtime — identical to original (canvas, interactions, animation) ──────

const bouquetCanvas = document.getElementById("bouquetCanvas");
const bCtx = bouquetCanvas.getContext("2d");
const bouquetWrapper = document.getElementById("bouquetStageWrapper");
const ambientCanvas = document.getElementById("ambientPetalsCanvas");
const aCtx = ambientCanvas.getContext("2d");

const roseNodes = [];
const babySprites = [];
let pointerX = -9999;
let pointerY = -9999;
let parallaxTargetX = 0;
let parallaxTargetY = 0;
let parallaxX = 0;
let parallaxY = 0;
let nextAutoShowcaseTime = performance.now() + 11000;
let stageW = 640;
let stageH = 640;
let winW = window.innerWidth;
let winH = window.innerHeight;
const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
let reducedMotion = motionPreference.matches;
let sceneAnimationFrame = null;
let keyboardRoseIndex = 0;
const bloomTimers = new Set();

function requestSceneRender() {
  if (sceneAnimationFrame === null && !document.hidden) {
    sceneAnimationFrame = requestAnimationFrame(renderBouquetScene);
  }
}

function clearBloomTimers() {
  bloomTimers.forEach(clearTimeout);
  bloomTimers.clear();
}

function scheduleBloom(callback, delay) {
  const timer = setTimeout(() => {
    bloomTimers.delete(timer);
    if (!reducedMotion && !document.hidden) callback();
  }, delay);
  bloomTimers.add(timer);
}

function settleBouquet() {
  clearBloomTimers();
  roseNodes.forEach((rose) => {
    rose.bloom = rose.targetBloom = 1.04;
    rose.vBloom = rose.vScale = rose.flareGlow = 0;
    rose.scaleOffset = 1;
    rose.vx = rose.vy = rose.offsetX = rose.offsetY = 0;
  });
  fallingPetals.length = 0;
  burstSparkles.length = 0;
  floatingBalloons.length = 0;
  floatingGiftBoxes.length = 0;
  floatingPopEffects.length = 0;
  pointerX = pointerY = -9999;
  parallaxX = parallaxY = parallaxTargetX = parallaxTargetY = 0;
}

function initBotanicalAssets() {
  BOUQUET_LAYOUT.forEach((item, index) => {
    const sprite = createRealisticRoseSprite({ ...item, radius: item.r });
    roseNodes.push({
      ...item,
      index,
      sprite,
      offsetX: 0,
      offsetY: 0,
      vx: 0,
      vy: 0,
      scaleOffset: 1,
      vScale: 0,
      bloom: 0.05,
      targetBloom: 1.04,
      vBloom: 0,
      flareGlow: 0,
      spinDir: index % 2 === 0 ? 1 : -1,
      whisper: WHISPER_NOTES[index % WHISPER_NOTES.length],
    });
  });
  roseNodes.sort((a, b) => a.z - b.z);
  BABY_BREATH_LAYOUT.forEach((item) => {
    babySprites.push({
      ...item,
      sprite: createBabyBreathClusterSprite(item.seed),
    });
  });
}

function triggerBouquetBloomWave(originX = 0, originY = -30, mode = "grand") {
  clearBloomTimers();
  nextAutoShowcaseTime = performance.now() + 11000;
  if (reducedMotion) {
    settleBouquet();
    requestSceneRender();
    return;
  }

  roseNodes.forEach((rose) => {
    const distance = Math.hypot(rose.x - originX, rose.y - originY);
    const delay =
      mode === "grand" ? distance * 2.1 + (4 - rose.z) * 65 : distance * 1.4;

    if (mode === "grand") {
      rose.bloom = rose.targetBloom = 0.04;
      rose.vBloom = 0;
      rose.scaleOffset = 0.78;
    } else {
      scheduleBloom(
        () => {
          rose.targetBloom = 0.48;
          rose.vBloom = -0.06;
        },
        Math.max(0, delay - 110),
      );
    }

    scheduleBloom(
      () => {
        rose.targetBloom = 1.32;
        rose.vBloom = mode === "grand" ? 0.145 : 0.165;
        rose.vScale += 0.11;
        rose.flareGlow = 1;
        if (mode === "grand" ? rose.z >= 3 : Math.random() > 0.78) {
          const rect = bouquetCanvas.getBoundingClientRect();
          spawnPetalBurst(
            rect.left + rose.screenX,
            rect.top + rose.screenY,
            mode === "grand" ? 2 : 1,
          );
        }
        scheduleBloom(() => {
          rose.targetBloom = 1.04 + (rose.z >= 3 ? 0.04 : 0);
        }, 520);
      },
      delay + (mode === "ripple" ? 90 : 0),
    );
  });
  requestSceneRender();
}

function resizeCanvases() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
  stageW = bouquetWrapper.clientWidth || 560;
  stageH = bouquetWrapper.clientHeight || 560;
  bouquetCanvas.width = Math.round(stageW * dpr);
  bouquetCanvas.height = Math.round(stageH * dpr);
  bCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  winW = window.innerWidth;
  winH = window.innerHeight;
  ambientCanvas.width = Math.round(winW * dpr);
  ambientCanvas.height = Math.round(winH * dpr);
  aCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  requestSceneRender();
}

const fallingPetals = [];
const burstSparkles = [];
const floatingBalloons = [];
const floatingGiftBoxes = [];
const floatingPopEffects = [];

// Curated gift box palettes matching project theme colors (cool blues, ivory, pearl, navy)
const GIFT_BOX_PALETTES = [
  // 1: Pastel Sky Blue with Crisp White Satin Ribbon
  {
    boxLight: "#A8D2E8",
    boxMid: "#72ADD2",
    boxDark: "#4D8DC3",
    lidLight: "#C0E0EE",
    lidDark: "#8FC5E0",
    ribbon: "#FFFFFF",
    ribbonHighlight: "#F7FCFE",
    boxStroke: "rgba(25, 63, 104, 0.28)",
    particleColor: "#A8D2E8",
  },
  // 2: Pearl Ivory with Sapphire Blue Ribbon
  {
    boxLight: "#FFFFFF",
    boxMid: "#EDF6FB",
    boxDark: "#D2E6F2",
    lidLight: "#FFFFFF",
    lidDark: "#E4F0F7",
    ribbon: "#3375AE",
    ribbonHighlight: "#72ADD2",
    boxStroke: "rgba(93, 120, 152, 0.3)",
    particleColor: "#8FC7E2",
  },
  // 3: Deep Sapphire Blue with Silver-Ice Ribbon
  {
    boxLight: "#3375AE",
    boxMid: "#25619D",
    boxDark: "#193F68",
    lidLight: "#4D8DC3",
    lidDark: "#2B6CA8",
    ribbon: "#EAF5FB",
    ribbonHighlight: "#FFFFFF",
    boxStroke: "rgba(12, 47, 92, 0.4)",
    particleColor: "#FFFFFF",
  },
  // 4: Frosted Ice Cyan with Ink-Navy Ribbon
  {
    boxLight: "#E1F2F9",
    boxMid: "#BCE0F0",
    boxDark: "#8FC7E2",
    lidLight: "#EFF8FC",
    lidDark: "#CFE8F5",
    ribbon: "#193F68",
    ribbonHighlight: "#4D8DC3",
    boxStroke: "rgba(25, 63, 104, 0.25)",
    particleColor: "#72ADD2",
  },
];

// Curated balloon palettes (bong bóng bay) matching project theme colors
const BALLOON_PALETTES = [
  // 1: Ice Sky Blue
  {
    baseLight: "#D8F0FA",
    baseMid: "#7BB6DC",
    baseDark: "#3A82B8",
    rim: "rgba(33, 97, 157, 0.5)",
    string: "rgba(51, 117, 174, 0.6)",
    glow: "rgba(123, 182, 220, 0.3)",
    particle: "#7BB6DC",
  },
  // 2: Pure Pearl Ivory
  {
    baseLight: "#FFFFFF",
    baseMid: "#E8F4FA",
    baseDark: "#B8D7E8",
    rim: "rgba(93, 120, 152, 0.45)",
    string: "rgba(93, 120, 152, 0.55)",
    glow: "rgba(220, 240, 255, 0.35)",
    particle: "#FFFFFF",
  },
  // 3: Royal Sapphire Blue
  {
    baseLight: "#7AAED4",
    baseMid: "#3375AE",
    baseDark: "#174574",
    rim: "rgba(15, 45, 80, 0.55)",
    string: "rgba(25, 63, 104, 0.6)",
    glow: "rgba(51, 117, 174, 0.32)",
    particle: "#3375AE",
  },
  // 4: Soft Cloud / Pastel Cyan
  {
    baseLight: "#EDF8FD",
    baseMid: "#A0D0E8",
    baseDark: "#5295C2",
    rim: "rgba(40, 100, 150, 0.45)",
    string: "rgba(51, 117, 174, 0.55)",
    glow: "rgba(160, 208, 232, 0.32)",
    particle: "#A0D0E8",
  },
];

function createPetalParticle(customX, customY, isBurst = false) {
  const colors = [
    ["#F3FAFD", "#8FC7E2"],
    ["#E5F4FA", "#5E9DCA"],
    ["#F7FCFE", "#BCDDEA"],
    ["#FFFFFF", "#A8D2E7"],
    ["#EEF8FC", "#75AFD1"],
  ];
  const pair = colors[Math.floor(Math.random() * colors.length)];
  return {
    x: customX !== undefined ? customX : Math.random() * winW,
    y: customY !== undefined ? customY : -30 - Math.random() * winH * 0.4,
    vx: isBurst ? (Math.random() - 0.5) * 4.2 : (Math.random() - 0.35) * 0.85,
    vy: isBurst ? -1.5 - Math.random() * 2.8 : 0.65 + Math.random() * 1.15,
    size: 9 + Math.random() * 10,
    rot: Math.random() * Math.PI * 2,
    vRot: (Math.random() - 0.5) * 0.028,
    flipPhase: Math.random() * Math.PI * 2,
    vFlip: 0.018 + Math.random() * 0.022,
    swayPhase: Math.random() * Math.PI * 2,
    colorInner: pair[0],
    colorOuter: pair[1],
    opacity: isBurst ? 1 : 0.45 + Math.random() * 0.45,
    isBurst,
    aspect: 0.55 + Math.random() * 0.3,
  };
}

function createFloatingBalloon(initialY) {
  const r = 16 + Math.random() * 10; // balloon radius (size 32-52px)
  const pal =
    BALLOON_PALETTES[Math.floor(Math.random() * BALLOON_PALETTES.length)];
  return {
    x: Math.random() * winW,
    y: initialY !== undefined ? initialY : winH + 30 + Math.random() * 80,
    r,
    stringLen: 32 + Math.random() * 16,
    isHeart: Math.random() < 0.35, // ~1/3 heart balloons, 2/3 classic oval balloons
    vy: -(0.58 + Math.random() * 0.72),
    vx: (Math.random() - 0.5) * 0.25,
    swayPhase: Math.random() * Math.PI * 2,
    swaySpeed: 0.012 + Math.random() * 0.016,
    swayAmp: 0.6 + Math.random() * 0.9,
    rot: (Math.random() - 0.5) * 0.15,
    pal,
    opacity: 0.86 + Math.random() * 0.12,
  };
}

function createFloatingGiftBox(initialY) {
  const size = 28 + Math.random() * 10; // larger gift box (28px - 38px)
  const pal =
    GIFT_BOX_PALETTES[Math.floor(Math.random() * GIFT_BOX_PALETTES.length)];
  return {
    x: Math.random() * winW,
    y: initialY !== undefined ? initialY : winH + 30 + Math.random() * 90,
    size,
    vy: -(0.42 + Math.random() * 0.48),
    vx: (Math.random() - 0.5) * 0.25,
    swayPhase: Math.random() * Math.PI * 2,
    swaySpeed: 0.01 + Math.random() * 0.015,
    swayAmp: 0.45 + Math.random() * 0.75,
    rot: (Math.random() - 0.5) * 0.18,
    pal,
    opacity: 0.88 + Math.random() * 0.12,
    seed: Math.random() * 100,
  };
}

function safeRoundRect(ctx, x, y, w, h, radii) {
  if (typeof ctx.roundRect === "function") {
    ctx.roundRect(x, y, w, h, radii);
  } else {
    ctx.rect(x, y, w, h);
  }
}

// Draw classic oval balloon
function drawClassicBalloon(ctx, w, h, pal) {
  ctx.beginPath();
  ctx.moveTo(0, -h * 0.5);
  ctx.bezierCurveTo(w * 0.55, -h * 0.5, w * 0.58, h * 0.12, 0, h * 0.45);
  ctx.bezierCurveTo(-w * 0.58, h * 0.12, -w * 0.55, -h * 0.5, 0, -h * 0.5);
  ctx.closePath();

  const grad = ctx.createRadialGradient(
    -w * 0.22,
    -h * 0.18,
    w * 0.08,
    0,
    0,
    h * 0.55,
  );
  grad.addColorStop(0, pal.baseLight);
  grad.addColorStop(0.48, pal.baseMid);
  grad.addColorStop(0.92, pal.baseDark);
  grad.addColorStop(1, pal.baseDark);

  ctx.fillStyle = grad;
  ctx.fill();

  ctx.strokeStyle = pal.rim;
  ctx.lineWidth = 0.9;
  ctx.stroke();

  // Specular glossy reflection (crescent glare on top-left)
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(-w * 0.22, -h * 0.22, w * 0.16, h * 0.2, -0.35, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255, 255, 255, 0.72)";
  ctx.fill();

  // Tiny sharp highlight glint
  ctx.beginPath();
  ctx.arc(-w * 0.2, -h * 0.28, Math.max(1.5, w * 0.06), 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
  ctx.fill();
  ctx.restore();

  // Bottom secondary rim reflection
  ctx.save();
  ctx.beginPath();
  ctx.arc(0, h * 0.12, w * 0.44, Math.PI * 0.22, Math.PI * 0.56);
  ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
  ctx.lineWidth = 1.4;
  ctx.stroke();
  ctx.restore();
}

// Draw heart-shaped balloon (bong bóng bay hình trái tim)
function drawHeartBalloon(ctx, size, pal) {
  const s = size * 0.95;
  ctx.beginPath();
  ctx.moveTo(0, -s * 0.22);
  ctx.bezierCurveTo(-s * 0.56, -s * 0.78, -s * 0.92, -s * 0.14, 0, s * 0.48);
  ctx.bezierCurveTo(s * 0.92, -s * 0.14, s * 0.56, -s * 0.78, 0, -s * 0.22);
  ctx.closePath();

  const grad = ctx.createRadialGradient(
    -s * 0.2,
    -s * 0.2,
    s * 0.08,
    0,
    0,
    s * 0.62,
  );
  grad.addColorStop(0, pal.baseLight);
  grad.addColorStop(0.48, pal.baseMid);
  grad.addColorStop(0.92, pal.baseDark);
  grad.addColorStop(1, pal.baseDark);

  ctx.fillStyle = grad;
  ctx.fill();

  ctx.strokeStyle = pal.rim;
  ctx.lineWidth = 0.9;
  ctx.stroke();

  // Glossy highlight on left heart lobe
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(-s * 0.26, -s * 0.32, s * 0.16, s * 0.12, -0.4, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255, 255, 255, 0.72)";
  ctx.fill();
  ctx.restore();
}

// Draw balloon knot and swaying wavy string (dây buộc bóng bay)
function drawBalloonKnotAndString(ctx, knotY, stringLen, swayPhase, pal) {
  // Knot at bottom
  ctx.beginPath();
  ctx.moveTo(-3.5, knotY);
  ctx.lineTo(3.5, knotY);
  ctx.lineTo(2, knotY + 4.5);
  ctx.lineTo(-2, knotY + 4.5);
  ctx.closePath();
  ctx.fillStyle = pal.baseDark;
  ctx.fill();

  // Wavy string (sways organically in breeze)
  const s1 = Math.sin(swayPhase) * 7;
  const s2 = Math.sin(swayPhase + 1.8) * 9;
  const s3 = Math.sin(swayPhase + 3.2) * 6;

  ctx.beginPath();
  ctx.moveTo(0, knotY + 4.5);
  ctx.bezierCurveTo(
    s1,
    knotY + stringLen * 0.35,
    s2,
    knotY + stringLen * 0.7,
    s3,
    knotY + stringLen,
  );
  ctx.strokeStyle = pal.string;
  ctx.lineWidth = 1.1;
  ctx.stroke();
}

// Draw full helium balloon
function drawBalloon(ctx, b) {
  ctx.save();
  ctx.translate(b.x, b.y);
  ctx.rotate(b.rot);
  ctx.globalAlpha = b.opacity;

  // Soft atmospheric colored glow
  const r = b.r;
  const glow = ctx.createRadialGradient(0, 0, r * 0.5, 0, 0, r * 1.45);
  glow.addColorStop(0, b.pal.glow);
  glow.addColorStop(1, "rgba(255, 255, 255, 0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(0, 0, r * 1.45, 0, Math.PI * 2);
  ctx.fill();

  if (b.isHeart) {
    drawHeartBalloon(ctx, b.r * 1.9, b.pal);
    drawBalloonKnotAndString(ctx, b.r * 0.9, b.stringLen, b.swayPhase, b.pal);
  } else {
    drawClassicBalloon(ctx, b.r * 1.8, b.r * 2.3, b.pal);
    drawBalloonKnotAndString(ctx, b.r * 1.05, b.stringLen, b.swayPhase, b.pal);
  }

  ctx.restore();
}

// Draw larger, detailed miniature gift box
function drawMiniGiftBox(ctx, g, time) {
  ctx.save();
  ctx.translate(g.x, g.y);
  ctx.rotate(g.rot);
  ctx.globalAlpha = g.opacity;

  const w = g.size;
  const h = g.size * 0.88;
  const lidW = w * 1.15;
  const lidH = h * 0.32;
  const r = 3;
  const pal = g.pal;

  // Soft floating shadow underneath
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(0, h * 0.62, w * 0.55, h * 0.18, 0, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(25, 63, 104, 0.16)";
  ctx.fill();
  ctx.restore();

  // Box body
  const bodyY = -h * 0.5 + lidH * 0.7;
  const bodyH = h - lidH * 0.7;
  const bodyW = w;
  const bodyX = -bodyW / 2;

  const bodyGrad = ctx.createLinearGradient(
    bodyX,
    bodyY,
    bodyX + bodyW,
    bodyY + bodyH,
  );
  bodyGrad.addColorStop(0, pal.boxLight);
  bodyGrad.addColorStop(0.5, pal.boxMid);
  bodyGrad.addColorStop(1, pal.boxDark);

  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  safeRoundRect(ctx, bodyX, bodyY, bodyW, bodyH, [0, 0, r, r]);
  ctx.fill();
  ctx.strokeStyle = pal.boxStroke;
  ctx.lineWidth = 1;
  ctx.stroke();

  // Vertical ribbon on body
  const ribbonW = Math.max(3.6, w * 0.22);
  ctx.fillStyle = pal.ribbon;
  ctx.fillRect(-ribbonW / 2, bodyY, ribbonW, bodyH);
  ctx.fillStyle = pal.ribbonHighlight;
  ctx.fillRect(-ribbonW / 2, bodyY, ribbonW * 0.35, bodyH);

  // Horizontal ribbon on body
  const ribbonH = Math.max(3.2, h * 0.2);
  const ribbonBodyY = bodyY + bodyH * 0.42;
  ctx.fillStyle = pal.ribbon;
  ctx.fillRect(bodyX, ribbonBodyY, bodyW, ribbonH);
  ctx.fillStyle = pal.ribbonHighlight;
  ctx.fillRect(bodyX, ribbonBodyY, bodyW, ribbonH * 0.35);

  // Box lid
  const lidX = -lidW / 2;
  const lidY = -h * 0.5 - lidH * 0.3;
  const lidGrad = ctx.createLinearGradient(
    lidX,
    lidY,
    lidX + lidW,
    lidY + lidH,
  );
  lidGrad.addColorStop(0, pal.lidLight);
  lidGrad.addColorStop(1, pal.lidDark);

  ctx.fillStyle = lidGrad;
  ctx.beginPath();
  safeRoundRect(ctx, lidX, lidY, lidW, lidH, [r, r, 1.5, 1.5]);
  ctx.fill();
  ctx.strokeStyle = pal.boxStroke;
  ctx.lineWidth = 1;
  ctx.stroke();

  // Lid ribbon (vertical)
  ctx.fillStyle = pal.ribbon;
  ctx.fillRect(-ribbonW / 2, lidY, ribbonW, lidH);
  ctx.fillStyle = pal.ribbonHighlight;
  ctx.fillRect(-ribbonW / 2, lidY, ribbonW * 0.35, lidH);

  // Lid bottom drop shadow
  ctx.fillStyle = "rgba(10, 30, 50, 0.22)";
  ctx.fillRect(bodyX, bodyY, bodyW, 2.2);

  // Ribbon bow on top
  const bowY = lidY - 1;
  const loopW = w * 0.36;
  const loopH = h * 0.36;

  // Left loop
  ctx.save();
  ctx.translate(-ribbonW * 0.28, bowY);
  ctx.rotate(-0.35);
  ctx.beginPath();
  ctx.ellipse(
    -loopW * 0.45,
    -loopH * 0.4,
    loopW * 0.48,
    loopH * 0.32,
    -0.2,
    0,
    Math.PI * 2,
  );
  ctx.fillStyle = pal.ribbon;
  ctx.fill();
  ctx.strokeStyle = pal.ribbonHighlight;
  ctx.lineWidth = 0.9;
  ctx.stroke();
  ctx.restore();

  // Right loop
  ctx.save();
  ctx.translate(ribbonW * 0.28, bowY);
  ctx.rotate(0.35);
  ctx.beginPath();
  ctx.ellipse(
    loopW * 0.45,
    -loopH * 0.4,
    loopW * 0.48,
    loopH * 0.32,
    0.2,
    0,
    Math.PI * 2,
  );
  ctx.fillStyle = pal.ribbon;
  ctx.fill();
  ctx.strokeStyle = pal.ribbonHighlight;
  ctx.lineWidth = 0.9;
  ctx.stroke();
  ctx.restore();

  // Center knot
  const knotR = Math.max(2.6, w * 0.12);
  ctx.beginPath();
  ctx.arc(0, bowY, knotR, 0, Math.PI * 2);
  ctx.fillStyle = pal.ribbonHighlight;
  ctx.fill();
  ctx.strokeStyle = pal.ribbon;
  ctx.lineWidth = 0.9;
  ctx.stroke();

  // Trailing ribbon tails
  ctx.beginPath();
  ctx.moveTo(-knotR * 0.5, bowY + knotR * 0.6);
  ctx.quadraticCurveTo(-w * 0.25, bowY + h * 0.32, -w * 0.32, bowY + h * 0.48);
  ctx.strokeStyle = pal.ribbon;
  ctx.lineWidth = ribbonW * 0.45;
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(knotR * 0.5, bowY + knotR * 0.6);
  ctx.quadraticCurveTo(w * 0.25, bowY + h * 0.32, w * 0.32, bowY + h * 0.48);
  ctx.strokeStyle = pal.ribbon;
  ctx.lineWidth = ribbonW * 0.45;
  ctx.stroke();

  // Twinkling glint on bow
  const glint = Math.sin((time || 0) * 3 + g.seed);
  if (glint > 0.6) {
    const glintAlpha = (glint - 0.6) / 0.4;
    ctx.save();
    ctx.translate(knotR * 0.5, bowY - knotR * 0.5);
    ctx.fillStyle = `rgba(255, 255, 255, ${glintAlpha * 0.95})`;
    ctx.shadowColor = "#FFFFFF";
    ctx.shadowBlur = 5;
    ctx.beginPath();
    ctx.arc(0, 0, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  ctx.restore();
}

function popBalloon(b) {
  floatingPopEffects.push({
    type: "balloon",
    x: b.x,
    y: b.y,
    r: b.r,
    maxR: b.r * 1.6,
    alpha: 0.9,
    color: b.pal.baseMid,
  });
  for (let i = 0; i < 12; i++) {
    const angle = Math.random() * Math.PI * 2;
    const spd = 1.4 + Math.random() * 2.6;
    burstSparkles.push({
      x: b.x,
      y: b.y,
      vx: Math.cos(angle) * spd,
      vy: Math.sin(angle) * spd - 0.5,
      r: 1.6 + Math.random() * 2.4,
      alpha: 1,
      color: i % 2 === 0 ? "#FFFFFF" : b.pal.particle,
      shadowColor: b.pal.particle,
    });
  }
  // Respawn at bottom
  b.y = winH + 30 + Math.random() * 80;
  b.x = Math.random() * winW;
}

function popGiftBox(g) {
  floatingPopEffects.push({
    type: "gift",
    x: g.x,
    y: g.y,
    text: ["♡", "✨", "🎁", "✿", "★"][Math.floor(Math.random() * 5)],
    vy: -1.8,
    alpha: 1,
    scale: 1,
    color: g.pal.ribbon === "#FFFFFF" ? "#3375AE" : g.pal.ribbon,
  });
  for (let i = 0; i < 16; i++) {
    const angle = Math.random() * Math.PI * 2;
    const spd = 1.5 + Math.random() * 3.2;
    burstSparkles.push({
      x: g.x,
      y: g.y,
      vx: Math.cos(angle) * spd,
      vy: Math.sin(angle) * spd - 0.7,
      r: 1.8 + Math.random() * 2.8,
      alpha: 1,
      color: i % 3 === 0 ? "#FFFFFF" : i % 3 === 1 ? "#8FC7E2" : "#5E9DCA",
      shadowColor: "#8FC7E2",
    });
  }
  // Respawn at bottom
  g.y = winH + 30 + Math.random() * 90;
  g.x = Math.random() * winW;
}

function initAmbientPetals() {
  if (reducedMotion) return;
  const isMobile = window.innerWidth < 768;
  const count = isMobile ? 10 : 16;
  for (let i = 0; i < count; i++) {
    const p = createPetalParticle(
      Math.random() * winW,
      Math.random() * winH,
      false,
    );
    fallingPetals.push(p);
  }

  // Initialize floating balloons (bong bóng bay) distributed along the height
  const balloonCount = isMobile ? 8 : 13;
  floatingBalloons.length = 0;
  for (let i = 0; i < balloonCount; i++) {
    floatingBalloons.push(createFloatingBalloon(Math.random() * (winH + 100)));
  }

  // Initialize mini gift boxes distributed along the height
  const giftCount = isMobile ? 4 : 7;
  floatingGiftBoxes.length = 0;
  for (let i = 0; i < giftCount; i++) {
    floatingGiftBoxes.push(createFloatingGiftBox(Math.random() * (winH + 120)));
  }
}

function spawnPetalBurst(screenX, screenY, count = 8) {
  if (reducedMotion || document.hidden) return;
  count = Math.min(
    count,
    Math.max(0, 68 - fallingPetals.length),
    Math.max(0, 96 - burstSparkles.length - 4),
  );
  if (count <= 0) return;
  for (let i = 0; i < count; i++)
    fallingPetals.push(createPetalParticle(screenX, screenY, true));
  for (let i = 0; i < count + 4; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 0.8 + Math.random() * 2.6;
    burstSparkles.push({
      x: screenX,
      y: screenY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 0.6,
      r: 1.8 + Math.random() * 2.5,
      alpha: 1,
      color: i % 2 === 0 ? "#FFF6F8" : "#8FC7E2",
      shadowColor: "#8FC7E2",
    });
  }
}

function renderAmbientPetals(time) {
  aCtx.clearRect(0, 0, winW, winH);

  // ── Floating Balloons (bong bóng bay drifting gently upwards from bottom) ──
  for (let i = 0; i < floatingBalloons.length; i++) {
    const b = floatingBalloons[i];
    b.swayPhase += b.swaySpeed;
    b.rot = Math.sin(b.swayPhase) * 0.12;
    b.x += b.vx + Math.sin(b.swayPhase) * b.swayAmp;
    b.y += b.vy;

    // Respawn below screen when rising past the top
    if (b.y < -80) {
      b.y = winH + 30 + Math.random() * 80;
      b.x = Math.random() * winW;
      b.vy = -(0.58 + Math.random() * 0.72);
      b.pal =
        BALLOON_PALETTES[Math.floor(Math.random() * BALLOON_PALETTES.length)];
    }
    drawBalloon(aCtx, b);
  }

  // ── Floating Gift Boxes (drifting gently upwards from bottom) ──
  for (let i = 0; i < floatingGiftBoxes.length; i++) {
    const g = floatingGiftBoxes[i];
    g.swayPhase += g.swaySpeed;
    g.rot = Math.sin(g.swayPhase) * 0.14;
    g.x += g.vx + Math.sin(g.swayPhase) * g.swayAmp;
    g.y += g.vy;

    // Respawn below screen when rising past the top
    if (g.y < -60) {
      g.y = winH + 30 + Math.random() * 90;
      g.x = Math.random() * winW;
      g.vy = -(0.42 + Math.random() * 0.48);
      g.pal =
        GIFT_BOX_PALETTES[Math.floor(Math.random() * GIFT_BOX_PALETTES.length)];
    }
    drawMiniGiftBox(aCtx, g, time);
  }

  // ── Pop effects (expanding rings & floating symbols) ──
  for (let i = floatingPopEffects.length - 1; i >= 0; i--) {
    const eff = floatingPopEffects[i];
    if (eff.type === "balloon") {
      eff.r += (eff.maxR - eff.r) * 0.16 + 0.6;
      eff.alpha -= 0.045;
      if (eff.alpha <= 0) {
        floatingPopEffects.splice(i, 1);
        continue;
      }
      aCtx.save();
      aCtx.globalAlpha = eff.alpha;
      aCtx.strokeStyle = eff.color || "rgba(180, 225, 255, 0.85)";
      aCtx.lineWidth = 1.6;
      aCtx.beginPath();
      aCtx.arc(eff.x, eff.y, eff.r, 0, Math.PI * 2);
      aCtx.stroke();
      aCtx.restore();
    } else if (eff.type === "gift") {
      eff.y += eff.vy;
      eff.scale += 0.014;
      eff.alpha -= 0.024;
      if (eff.alpha <= 0) {
        floatingPopEffects.splice(i, 1);
        continue;
      }
      aCtx.save();
      aCtx.globalAlpha = eff.alpha;
      aCtx.font = `600 ${Math.round(20 * eff.scale)}px "Segoe UI", Arial, sans-serif`;
      aCtx.fillStyle = eff.color || "#3375AE";
      aCtx.textAlign = "center";
      aCtx.textBaseline = "middle";
      aCtx.shadowColor = "rgba(255, 255, 255, 0.9)";
      aCtx.shadowBlur = 6;
      aCtx.fillText(eff.text, eff.x, eff.y);
      aCtx.restore();
    }
  }

  // ── Falling Botanical Petals (drifting downwards) ──
  for (let i = fallingPetals.length - 1; i >= 0; i--) {
    const p = fallingPetals[i];
    p.swayPhase += 0.018;
    p.flipPhase += p.vFlip;
    p.rot += p.vRot;

    if (p.isBurst) {
      p.vy += 0.065;
      p.vx *= 0.99;
    }
    p.x += p.vx + Math.sin(p.swayPhase) * 0.55;
    p.y += p.vy;

    if (p.y > winH + 40) {
      if (p.isBurst) {
        fallingPetals.splice(i, 1);
        continue;
      } else {
        p.y = -25;
        p.x = Math.random() * winW;
        p.vy = 0.65 + Math.random() * 1.15;
        p.isBurst = false;
      }
    }

    const flipScale = 0.35 + 0.65 * Math.abs(Math.cos(p.flipPhase));
    const asp = p.aspect || 0.7;
    aCtx.save();
    aCtx.translate(p.x, p.y);
    aCtx.rotate(p.rot);
    aCtx.scale(1, flipScale);
    aCtx.globalAlpha = p.opacity;

    // Tulip petal silhouette: oval with a slight pointed tip
    aCtx.beginPath();
    aCtx.moveTo(0, -p.size);
    aCtx.bezierCurveTo(
      p.size * asp,
      -p.size * 0.7,
      p.size * asp * 0.9,
      p.size * 0.55,
      0,
      p.size * 0.9,
    );
    aCtx.bezierCurveTo(
      -p.size * asp * 0.9,
      p.size * 0.55,
      -p.size * asp,
      -p.size * 0.7,
      0,
      -p.size,
    );
    aCtx.closePath();

    const g = aCtx.createLinearGradient(0, -p.size, 0, p.size);
    g.addColorStop(0, p.colorInner);
    g.addColorStop(1, p.colorOuter);
    aCtx.fillStyle = g;
    aCtx.fill();
    aCtx.restore();
  }

  // ── Sparkle Particles ──
  for (let i = burstSparkles.length - 1; i >= 0; i--) {
    const s = burstSparkles[i];
    s.x += s.vx;
    s.y += s.vy;
    s.alpha -= 0.022;
    if (s.alpha <= 0) {
      burstSparkles.splice(i, 1);
      continue;
    }
    aCtx.save();
    aCtx.globalAlpha = s.alpha;
    aCtx.fillStyle = s.color;
    aCtx.shadowColor = s.shadowColor || s.color || "#8FC7E2";
    aCtx.shadowBlur = 8;
    aCtx.beginPath();
    aCtx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    aCtx.fill();
    aCtx.restore();
  }
}

function renderBouquetScene(timestamp) {
  sceneAnimationFrame = null;
  if (document.hidden) return;
  const time = reducedMotion ? 0 : timestamp * 0.001;
  bCtx.clearRect(0, 0, stageW, stageH);

  parallaxX += (parallaxTargetX - parallaxX) * 0.06;
  parallaxY += (parallaxTargetY - parallaxY) * 0.06;

  const baseScale = Math.min(stageW, stageH) / 650;
  const centerX = stageW * 0.5 + parallaxX * 8;
  // Leave a little breathing room around the tallest stems and foliage.
  const centerY = stageH * 0.55 + Math.sin(time * 1.25) * 4.5 + parallaxY * 6;
  const globalSwayRot = Math.sin(time * 0.95) * 0.018 + parallaxX * 0.015;

  bCtx.save();
  bCtx.translate(centerX, centerY);
  bCtx.rotate(globalSwayRot);

  drawWrappingPaperBack(bCtx, 0, 0, baseScale);

  // Dense green foliage fill — eliminates dark/grey gaps inside bouquet
  drawGreenFoliageFill(bCtx, baseScale);

  FOLIAGE_LAYOUT.filter((f) => f.layer === "back").forEach((leaf, idx) => {
    const leafSway = Math.sin(time * 1.6 + idx) * 0.035;
    drawBotanicalLeaf(
      bCtx,
      leaf.x * baseScale,
      leaf.y * baseScale,
      leaf.angle + leafSway,
      leaf.len * baseScale,
      leaf.w * baseScale,
      leaf.type,
    );
  });

  babySprites
    .filter((b) => b.layer === "back")
    .forEach((b, idx) => {
      const bSway = Math.cos(time * 1.5 + idx) * 0.04;
      bCtx.save();
      bCtx.translate(b.x * baseScale, b.y * baseScale);
      bCtx.rotate(b.angle + bSway);
      const drawSz = b.sprite.size * b.scale * baseScale;
      bCtx.drawImage(
        b.sprite.canvas,
        -drawSz * 0.5,
        -drawSz * 0.82,
        drawSz,
        drawSz,
      );
      bCtx.restore();
    });

  if (
    !reducedMotion &&
    !document.body.classList.contains("card-open") &&
    pointerX < -1000 &&
    timestamp > nextAutoShowcaseTime &&
    roseNodes.length > 0
  ) {
    const candidates = roseNodes.filter((r) => r.z >= 2);
    const pick = candidates[Math.floor(Math.random() * candidates.length)];
    if (pick) {
      roseNodes.forEach((r) => {
        const d = Math.hypot(r.x - pick.x, r.y - pick.y);
        if (d < 145) {
          scheduleBloom(() => {
            r.bloom = Math.min(r.bloom, 0.45);
            r.targetBloom = 1.32;
            r.vBloom = 0.155;
            r.vScale += 0.095 * (1 - d / 160);
            r.flareGlow = 0.95;
            scheduleBloom(() => {
              r.targetBloom = 1.04;
            }, 540);
          }, d * 1.5);
        }
      });
    }
    nextAutoShowcaseTime = timestamp + 11000;
  }

  roseNodes.forEach((rose) => {
    const breath = reducedMotion
      ? 1
      : 1 + Math.sin(time * 2.1 + rose.seed) * 0.022;

    const localX = (rose.x + rose.offsetX) * baseScale;
    const localY = (rose.y + rose.offsetY) * baseScale;
    const worldX =
      centerX +
      localX * Math.cos(globalSwayRot) -
      localY * Math.sin(globalSwayRot);
    const worldY =
      centerY +
      localX * Math.sin(globalSwayRot) +
      localY * Math.cos(globalSwayRot);
    rose.screenX = worldX;
    rose.screenY = worldY;
    rose.hitRadius = rose.r * baseScale * rose.scaleOffset * 1.08;

    const dx = pointerX - worldX;
    const dy = pointerY - worldY;
    const dist = Math.hypot(dx, dy);
    const hitRadius = rose.r * baseScale * 1.08;

    let targetOx = (rose.z - 2) * parallaxX * 4.5;
    let targetOy = (rose.z - 2) * parallaxY * 4.5;
    let targetScale = 1.0;

    if (!reducedMotion && dist < hitRadius * 1.55) {
      const factor = 1 - dist / (hitRadius * 1.55);
      targetOx -= (dx / (dist || 1)) * factor * 8;
      targetOy -= (dy / (dist || 1)) * factor * 8;
      targetScale = 1 + factor * 0.14;
      rose.targetBloom = Math.max(rose.targetBloom, 1.06 + factor * 0.26);
      rose.flareGlow = Math.max(rose.flareGlow, factor * 0.75);
    }

    rose.vx = (rose.vx + (targetOx - rose.offsetX) * 0.12) * 0.78;
    rose.vy = (rose.vy + (targetOy - rose.offsetY) * 0.12) * 0.78;
    rose.offsetX += rose.vx;
    rose.offsetY += rose.vy;

    rose.vScale =
      (rose.vScale + (targetScale - rose.scaleOffset) * 0.14) * 0.76;
    rose.scaleOffset += rose.vScale;

    rose.vBloom =
      (rose.vBloom + (rose.targetBloom - rose.bloom) * 0.095) * 0.79;
    rose.bloom += rose.vBloom;
    rose.flareGlow *= 0.94;

    const rx = (rose.x + rose.offsetX) * baseScale;
    const ry = (rose.y + rose.offsetY) * baseScale;
    const totalScale = baseScale * breath * rose.scaleOffset;
    const drawSize = rose.sprite.logicalSize * totalScale;
    const baseSwayRot = reducedMotion
      ? 0
      : Math.sin(time * 1.3 + rose.seed) * 0.025;

    bCtx.save();
    bCtx.translate(rx, ry);
    bCtx.rotate(baseSwayRot);
    // A gentle foreshortening turns the flower faces upward instead of flat-on.
    // Keeping the x axis almost intact preserves the full, rounded bouquet silhouette.
    bCtx.scale(1, 0.87);

    // Base shadow + sepal collar
    bCtx.drawImage(
      rose.sprite.baseCanvas,
      -drawSize * 0.5,
      -drawSize * 0.5,
      drawSize,
      drawSize,
    );

    // 4 whorl layers — tulip unfurling:
    // [0] outer 3 petals, [1] inner 3 petals, [2] frilled extras (peony), [3] stamens
    const whorlDelays = [0.0, 0.1, 0.22, 0.32];
    const closedScales = [0.38, 0.3, 0.24, 0.42];
    const overBloomBoost = [0.28, 0.2, 0.14, 0.08];
    // Tulips unfurl by petals spreading outward, not rotating like roses
    // We use a very small twist to simulate this
    const twistAngles = [0.3, -0.45, 0.6, -0.25];

    for (let wIdx = 0; wIdx < 4; wIdx++) {
      const wCanvas = rose.sprite.whorlCanvases[wIdx];
      const rawOpen =
        (rose.bloom - whorlDelays[wIdx]) / (1 - whorlDelays[wIdx]);
      const clamped = Math.max(0, Math.min(1, rawOpen));
      const overOpen = Math.max(0, rose.bloom - 1.0);
      const easeOpen = 1 - Math.pow(1 - clamped, 3);
      const whorlScale =
        closedScales[wIdx] +
        (1.0 - closedScales[wIdx]) * easeOpen +
        overOpen * overBloomBoost[wIdx];
      const unrollRot =
        (1 - easeOpen) * twistAngles[wIdx] * rose.spinDir +
        overOpen * (wIdx % 2 === 0 ? 0.18 : -0.16) * rose.spinDir;
      const shiftFactor = (easeOpen - 0.5) * 2 * overOpen * 4.5 * baseScale;

      bCtx.save();
      bCtx.translate(rose.tiltX * shiftFactor, rose.tiltY * shiftFactor);
      bCtx.rotate(unrollRot);
      bCtx.scale(whorlScale, whorlScale);
      bCtx.drawImage(
        wCanvas,
        -drawSize * 0.5,
        -drawSize * 0.5,
        drawSize,
        drawSize,
      );
      bCtx.restore();
    }

    // Bloom glow
    const activeGlow = Math.max(
      rose.flareGlow,
      Math.max(0, (rose.bloom - 1.05) * 2.2),
    );
    if (activeGlow > 0.03) {
      const glowR = rose.r * totalScale * 1.15;
      const sunGlow = bCtx.createRadialGradient(
        0,
        0,
        glowR * 0.05,
        0,
        0,
        glowR,
      );
      sunGlow.addColorStop(
        0,
        `rgba(255, 245, 238, ${Math.min(0.55, activeGlow * 0.52)})`,
      );
      sunGlow.addColorStop(
        0.45,
        `rgba(255, 182, 203, ${Math.min(0.35, activeGlow * 0.34)})`,
      );
      sunGlow.addColorStop(1, "rgba(255, 182, 203, 0)");
      bCtx.save();
      bCtx.globalCompositeOperation = "screen";
      bCtx.fillStyle = sunGlow;
      bCtx.beginPath();
      bCtx.arc(0, 0, glowR, 0, Math.PI * 2);
      bCtx.fill();
      bCtx.restore();
    }

    bCtx.restore();
  });

  FOLIAGE_LAYOUT.filter((f) => f.layer === "front").forEach((leaf, idx) => {
    const leafSway = Math.sin(time * 1.8 + idx * 2) * 0.03;
    drawBotanicalLeaf(
      bCtx,
      leaf.x * baseScale,
      leaf.y * baseScale,
      leaf.angle + leafSway,
      leaf.len * baseScale,
      leaf.w * baseScale,
      leaf.type,
    );
  });

  babySprites
    .filter((b) => b.layer === "front")
    .forEach((b, idx) => {
      const bSway = Math.sin(time * 1.6 + idx) * 0.035;
      bCtx.save();
      bCtx.translate(b.x * baseScale, b.y * baseScale);
      bCtx.rotate(b.angle + bSway);
      const drawSz = b.sprite.size * b.scale * baseScale;
      bCtx.drawImage(
        b.sprite.canvas,
        -drawSz * 0.5,
        -drawSz * 0.82,
        drawSz,
        drawSz,
      );
      bCtx.restore();
    });

  drawWrappingPaperFrontAndRibbon(bCtx, 0, 0, baseScale, time);
  //drawFanWrap(bCtx, baseScale, time);
  bCtx.restore();

  renderAmbientPetals(time);
  if (!reducedMotion) requestSceneRender();
}

function announceRose(rose) {
  document.dispatchEvent(
    new CustomEvent("bouquet:rose", { detail: { message: rose.whisper } }),
  );
}

function setupInteractions() {
  bouquetWrapper.addEventListener("pointermove", (event) => {
    if (reducedMotion || event.pointerType === "touch") return;
    const rect = bouquetCanvas.getBoundingClientRect();
    pointerX = ((event.clientX - rect.left) * stageW) / rect.width;
    pointerY = ((event.clientY - rect.top) * stageH) / rect.height;
    parallaxTargetX = (pointerX / stageW - 0.5) * 2;
    parallaxTargetY = (pointerY / stageH - 0.5) * 2;
  });
  bouquetWrapper.addEventListener("pointerleave", () => {
    pointerX = pointerY = -9999;
    parallaxTargetX = parallaxTargetY = 0;
    roseNodes.forEach((rose) => {
      rose.targetBloom = 1.04;
    });
  });
  bouquetWrapper.addEventListener("click", (event) => {
    const rect = bouquetCanvas.getBoundingClientRect();
    const x = ((event.clientX - rect.left) * stageW) / rect.width;
    const y = ((event.clientY - rect.top) * stageH) / rect.height;
    const baseScale = Math.min(stageW, stageH) / 650;
    const rose = [...roseNodes]
      .reverse()
      .find(
        (node) =>
          Math.hypot(x - node.screenX, y - node.screenY) < node.hitRadius,
      );
    if (rose) announceRose(rose);
    triggerBouquetBloomWave(
      (x - stageW * 0.5) / baseScale,
      (y - stageH * 0.55) / baseScale,
      "ripple",
    );
    spawnPetalBurst(event.clientX, event.clientY, 8);
  });
  bouquetWrapper.addEventListener("keydown", (event) => {
    const direction = ["ArrowRight", "ArrowDown"].includes(event.key)
      ? 1
      : ["ArrowLeft", "ArrowUp"].includes(event.key)
        ? -1
        : 0;
    if (!direction && event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    keyboardRoseIndex =
      (keyboardRoseIndex + direction + roseNodes.length) % roseNodes.length;
    const rose = roseNodes[keyboardRoseIndex];
    announceRose(rose);
    triggerBouquetBloomWave(rose.x, rose.y, "ripple");
  });
  document.addEventListener("bouquet:replay", () =>
    triggerBouquetBloomWave(0, -30, "grand"),
  );
  document.addEventListener("bouquet:celebrate", () => {
    const rect = bouquetCanvas.getBoundingClientRect();
    spawnPetalBurst(rect.left + stageW * 0.5, rect.top + stageH * 0.5, 10);
  });
  window.addEventListener("pointerdown", (event) => {
    if (reducedMotion || document.hidden) return;
    const x = event.clientX;
    const y = event.clientY;

    // Check balloons
    for (let i = floatingBalloons.length - 1; i >= 0; i--) {
      const b = floatingBalloons[i];
      if (Math.hypot(x - b.x, y - b.y) <= b.r + 12) {
        popBalloon(b);
        return;
      }
    }

    // Check gift boxes
    for (let i = floatingGiftBoxes.length - 1; i >= 0; i--) {
      const g = floatingGiftBoxes[i];
      if (Math.hypot(x - g.x, y - g.y) <= g.size * 0.7 + 10) {
        popGiftBox(g);
        return;
      }
    }
  });
}

window.addEventListener("load", () => {
  initBotanicalAssets();
  resizeCanvases();
  initAmbientPetals();
  setupInteractions();
  triggerBouquetBloomWave(0, -30, "grand");
  setTimeout(
    () => document.dispatchEvent(new Event("bouquet:ready")),
    reducedMotion ? 0 : 1900,
  );
  new ResizeObserver(resizeCanvases).observe(bouquetWrapper);
  window.addEventListener("resize", resizeCanvases);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      cancelAnimationFrame(sceneAnimationFrame);
      sceneAnimationFrame = null;
      settleBouquet();
    } else {
      nextAutoShowcaseTime = performance.now() + 11000;
      if (!fallingPetals.length) initAmbientPetals();
      requestSceneRender();
    }
  });
  motionPreference.addEventListener("change", (event) => {
    reducedMotion = event.matches;
    settleBouquet();
    initAmbientPetals();
    requestSceneRender();
  });
  requestSceneRender();
});

// ===== NHẠC NỀN =====
const music = document.getElementById("bgMusic");
music.volume = 0.4;

function startMusic() {
  music.play().catch(() => {});
  document.removeEventListener("click", startMusic);
  document.removeEventListener("touchstart", startMusic);
}
document.addEventListener("click", startMusic);
document.addEventListener("touchstart", startMusic);
