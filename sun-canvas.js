(function () {
  "use strict";

  const canvases = document.querySelectorAll(".input-sun");
  if (!canvases.length) return;

  const W = 200;
  const H = 200;
  const cx = W / 2;
  const cy = H / 2;
  const S = W / 360;
  const BUMP = 40 * S;
  const GLOW_SIZE = 0.78;
  const FLOAT_AMP = 10 * S;
  const ROT_SPEED = 0.1;
  const FLOAT_SPEED = 3.4;
  const PARTICLE_N = 56;
  const GOLDEN = 2.39996322972865332;

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );
  const offscreens = new Map();
  const whenFocused = new WeakMap();

  for (const el of canvases) {
    el.width = W;
    el.height = H;
    const off = document.createElement("canvas");
    off.width = W;
    off.height = H;
    offscreens.set(el, off);
  }

  function buildPath(context, R, B, rotOffset) {
    const N = 8;
    context.beginPath();
    for (let i = 0; i < N; i += 1) {
      const angle = (i / N) * Math.PI * 2 + rotOffset;
      const nextAngle = ((i + 1) / N) * Math.PI * 2 + rotOffset;
      const midAngle = (angle + nextAngle) / 2;

      const tipX = cx + (R + B) * Math.cos(angle);
      const tipY = cy + (R + B) * Math.sin(angle);
      const valX = cx + R * Math.cos(midAngle);
      const valY = cy + R * Math.sin(midAngle);
      const nextTipX = cx + (R + B) * Math.cos(nextAngle);
      const nextTipY = cy + (R + B) * Math.sin(nextAngle);

      const cpR = R * 1.01;
      const midLeft = (angle + midAngle) / 2;
      const midRight = (midAngle + nextAngle) / 2;
      const t1Angle = angle + (nextAngle - angle) * 0.35;
      const t2Angle = nextAngle - (nextAngle - angle) * 0.35;

      if (i === 0) context.moveTo(tipX, tipY);

      context.bezierCurveTo(
        cx + cpR * Math.cos(midLeft),
        cy + cpR * Math.sin(midLeft),
        cx + cpR * Math.cos(t1Angle),
        cy + cpR * Math.sin(t1Angle),
        valX,
        valY
      );
      context.bezierCurveTo(
        cx + cpR * Math.cos(t2Angle),
        cy + cpR * Math.sin(t2Angle),
        cx + cpR * Math.cos(midRight),
        cy + cpR * Math.sin(midRight),
        nextTipX,
        nextTipY
      );
    }
    context.closePath();
  }

  function drawParticles(
    ctx,
    t,
    floatX,
    floatY,
    rStar,
    tFocusStart
  ) {
    const emerge = reduceMotion.matches
      ? 1
      : tFocusStart == null
        ? 1
        : Math.min(1, (t - tFocusStart) * 0.7);
    if (emerge < 0.03) return;
    const spread = 1 - emerge;

    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    for (let i = 0; i < PARTICLE_N; i += 1) {
      const g =
        (i * GOLDEN + t * (0.45 + 0.02 * (i % 5))) % (Math.PI * 2);
      const rBand = 0.1 + 0.9 * (i / PARTICLE_N);
      const wobble = 1 + 0.12 * Math.sin(t * 1.15 + i * 0.4);
      const rCore =
        rStar * 0.22 * rBand * wobble + 4 * S + 5 * S * ((i * 0.7) % 1);
      const r = rCore + spread * (rStar * 0.95 + 28 * S);
      const drift = spread * (18 * S + 10 * S * Math.sin(i * 0.63 + t * 1.4));
      const x = cx + floatX + Math.cos(g) * r + Math.cos(g * 2.1 + i) * drift;
      const y = cy + floatY + Math.sin(g) * r + Math.sin(g * 1.7 + i) * drift;
      const s = 0.35 * S + 0.9 * S * (0.25 + 0.15 * (i % 4));
      const tw = 0.5 + 0.5 * Math.sin(t * 2.1 + i * 0.8);
      const a = 0.08 * emerge * tw + 0.22 * emerge;
      ctx.beginPath();
      ctx.arc(x, y, s, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,220,150," + a * emerge + ")";
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x, y, s * 0.45, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255," + a * 0.4 * emerge + ")";
      ctx.fill();
    }
    ctx.restore();
  }

  function drawForCanvas(canvas, t, tFocusStart) {
    const octx = offscreens.get(canvas).getContext("2d");
    const ctx = canvas.getContext("2d");
    if (!octx || !ctx) return;

    const rotOffset = t * ROT_SPEED + (22 * Math.PI) / 180;
    const breathe = Math.sin(t * 1.0) * 0.15;
    const breatheSize = Math.max(0, breathe);
    const R = 115 * S * (1 + breatheSize);
    const B = BUMP * (1 + breatheSize);
    const gBreath = breathe < 0 ? breathe * 1.65 : breathe;
    const Rg = 115 * S * (1 + gBreath);
    const Bg = BUMP * (1 + gBreath);
    const baseBlur = 3;
    let blur;
    if (breathe > 0) {
      blur = baseBlur + (breathe / 0.15) * 5 * S;
    } else {
      blur = baseBlur - (breathe / 0.15) * 3.8 * S;
    }

    octx.clearRect(0, 0, W, H);
    buildPath(octx, R, B, rotOffset);
    octx.save();
    octx.clip();

    octx.fillStyle = "#F5A55B";
    octx.fillRect(0, 0, W, H);

    const floatX = Math.sin(t * 0.88 * FLOAT_SPEED + 0.4) * FLOAT_AMP;
    const floatY = Math.cos(t * 0.71 * FLOAT_SPEED + 1.2) * FLOAT_AMP;
    const gx = cx - 8 * S + floatX;
    const gy = cy - 5 * S + floatY;
    const grad = octx.createRadialGradient(
      gx,
      gy,
      0,
      gx,
      gy,
      (Rg + Bg) * GLOW_SIZE
    );
    grad.addColorStop(0.0, "rgba(255,222,147,1)");
    grad.addColorStop(0.2, "rgba(255,222,147,1)");
    grad.addColorStop(0.38, "rgba(255,235,190,0.95)");
    grad.addColorStop(0.55, "rgba(255,200,130,0.85)");
    grad.addColorStop(0.72, "rgba(248,168,85,0.6)");
    grad.addColorStop(0.88, "rgba(243,155,68,0.25)");
    grad.addColorStop(1.0, "rgba(240,148,60,0)");
    octx.fillStyle = grad;
    octx.fillRect(0, 0, W, H);
    octx.restore();

    ctx.clearRect(0, 0, W, H);
    ctx.save();
    ctx.filter = "blur(" + blur + "px)";
    ctx.globalAlpha = 0.8;
    ctx.drawImage(offscreens.get(canvas), 0, 0);
    ctx.restore();

    drawParticles(ctx, t, floatX, floatY, R + B, tFocusStart);
  }

  function clearCanvas(canvas) {
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.clearRect(0, 0, W, H);
  }

  let t = 0;
  const DT = 0.018;

  function tick() {
    if (!reduceMotion.matches) t += DT;

    for (const c of canvases) {
      const wrap = c.closest(".input-wrap");
      const on =
        wrap &&
        (wrap.matches(":focus-within") ||
          wrap.classList.contains("input-wrap--sun-active"));
      if (on) {
        if (!whenFocused.has(c)) whenFocused.set(c, t);
        drawForCanvas(c, t, whenFocused.get(c));
      } else {
        whenFocused.delete(c);
        clearCanvas(c);
      }
    }
    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
})();
