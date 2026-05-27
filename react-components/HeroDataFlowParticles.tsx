"use client";

/**
 * HeroDataFlowParticles · 数据流粒子（向 AI 核心汇聚）
 *
 * 替代项目里 HeroParticles.tsx。差异：
 * - 粒子从画布四周边缘生成，沿"目标点"方向流入
 * - 进入核心半径后销毁并在边缘重新生成（不断"输送"数据）
 * - 残影拖尾增强方向感
 * - 鼠标排斥保留
 * - 通过 targetSelector 指定汇聚目标元素的中心；不传则用画布右侧 70% 位置
 *
 * 用法：
 *   <div className="heroSection" style={{ position: "relative" }}>
 *     <HeroDataFlowParticles targetSelector="#heroVisual" />
 *     ...
 *   </div>
 */
import { useEffect, useRef } from "react";

type Props = {
  /** CSS 选择器，指定汇聚目标元素（取其中心）；默认画布右侧中心 */
  targetSelector?: string;
  /** 粒子密度，默认 9000（数字越小越密） */
  density?: number;
  /** 拖尾长度，默认 6 */
  trailLength?: number;
  className?: string;
};

export function HeroDataFlowParticles({
  targetSelector,
  density = 9000,
  trailLength = 6,
  className = "heroParticleCanvas"
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const host = canvas.parentElement as HTMLElement | null;
    if (!host) return;
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    let W = 0, H = 0, raf = 0;
    const target = { x: 0, y: 0, r: 80 };
    const mouse = { x: -9999, y: -9999, active: false };

    type Particle = {
      x: number; y: number; vx: number; vy: number;
      r: number; z: number; c: string;
      life: number; maxLife: number;
      trail: Array<[number, number]>;
    };
    let particles: Particle[] = [];

    const COLORS: Array<[string, number]> = [
      ["76,201,240", 0.45],
      ["24,166,184", 0.25],
      ["177,77,255", 0.20],
      ["255,255,255", 0.10]
    ];
    function pickColor() {
      const r = Math.random();
      let acc = 0;
      for (const [c, w] of COLORS) { acc += w; if (r < acc) return c; }
      return COLORS[0][0];
    }

    function computeTarget() {
      const targetEl = targetSelector ? document.querySelector<HTMLElement>(targetSelector) : null;
      if (targetEl) {
        const hr = host!.getBoundingClientRect();
        const vr = targetEl.getBoundingClientRect();
        target.x = vr.left - hr.left + vr.width / 2;
        target.y = vr.top  - hr.top  + vr.height / 2;
        target.r = Math.min(vr.width, vr.height) * 0.22;
      } else {
        target.x = W * 0.72;
        target.y = H * 0.5;
        target.r = 80;
      }
    }

    function resize() {
      W = host!.offsetWidth;
      H = host!.offsetHeight;
      canvas!.width = W * DPR; canvas!.height = H * DPR;
      canvas!.style.width = `${W}px`; canvas!.style.height = `${H}px`;
      ctx!.setTransform(DPR, 0, 0, DPR, 0, 0);
      computeTarget();
    }

    function spawnAtEdge(p: Particle) {
      const side = Math.floor(Math.random() * 4);
      const m = 30 + Math.random() * 80;
      if (side === 0)      { p.x = Math.random() * W;  p.y = -m; }
      else if (side === 1) { p.x = W + m;              p.y = Math.random() * H; }
      else if (side === 2) { p.x = Math.random() * W;  p.y = H + m; }
      else                 { p.x = -m;                 p.y = Math.random() * H; }

      const dx = target.x - p.x, dy = target.y - p.y;
      const d = Math.hypot(dx, dy) || 1;
      const speed = 0.5 + Math.random() * 0.9;
      const tan = Math.random() < 0.5 ? -1 : 1;
      p.vx = (dx / d) * speed + (-dy / d) * tan * 0.15;
      p.vy = (dy / d) * speed + ( dx / d) * tan * 0.15;
      p.r = 0.8 + Math.random() * 2.0;
      p.z = 0.3 + Math.random() * 0.8;
      p.c = pickColor();
      p.life = 0;
      p.maxLife = 360 + Math.random() * 240;
      p.trail = [];
    }

    function init() {
      const count = Math.min(200, Math.max(80, Math.floor((W * H) / density)));
      particles = [];
      for (let i = 0; i < count; i++) {
        const p: Particle = {} as Particle;
        spawnAtEdge(p);
        p.x = Math.random() * W;
        p.y = Math.random() * H;
        const dx = target.x - p.x, dy = target.y - p.y;
        const d = Math.hypot(dx, dy) || 1;
        const sp = 0.5 + Math.random() * 0.9;
        const tan = Math.random() < 0.5 ? -1 : 1;
        p.vx = (dx / d) * sp + (-dy / d) * tan * 0.15;
        p.vy = (dy / d) * sp + ( dx / d) * tan * 0.15;
        particles.push(p);
      }
    }

    const LINK = 110, MLINK = 200, REPEL = 110;

    function step() {
      ctx!.fillStyle = "rgba(5,8,19,0.18)";
      ctx!.fillRect(0, 0, W, H);

      for (const p of particles) {
        const dx = target.x - p.x, dy = target.y - p.y;
        const d = Math.hypot(dx, dy);

        if (d > 0) {
          const pull = 0.015;
          p.vx += (dx / d) * pull;
          p.vy += (dy / d) * pull;
        }
        p.vx *= 0.985; p.vy *= 0.985;

        if (mouse.active) {
          const mdx = p.x - mouse.x, mdy = p.y - mouse.y;
          const md2 = mdx * mdx + mdy * mdy;
          if (md2 < REPEL * REPEL && md2 > 0) {
            const md = Math.sqrt(md2);
            const f = (REPEL - md) / REPEL * 0.6;
            p.vx += (mdx / md) * f;
            p.vy += (mdy / md) * f;
          }
        }

        p.trail.push([p.x, p.y]);
        if (p.trail.length > trailLength) p.trail.shift();

        p.x += p.vx; p.y += p.vy;
        p.life++;

        const inCore = d < target.r;
        const out = p.x < -120 || p.x > W + 120 || p.y < -120 || p.y > H + 120;
        if (inCore || out || p.life > p.maxLife) {
          if (inCore) {
            ctx!.fillStyle = `rgba(${p.c},0.9)`;
            ctx!.beginPath();
            ctx!.arc(
              target.x + (Math.random() - 0.5) * target.r,
              target.y + (Math.random() - 0.5) * target.r,
              2.4, 0, Math.PI * 2
            );
            ctx!.fill();
          }
          spawnAtEdge(p);
        }
      }

      // 拖尾
      for (const p of particles) {
        if (p.trail.length < 2) continue;
        for (let i = 1; i < p.trail.length; i++) {
          const t0 = p.trail[i - 1], t1 = p.trail[i];
          const alpha = (i / p.trail.length) * 0.55 * p.z;
          ctx!.strokeStyle = `rgba(${p.c},${alpha})`;
          ctx!.lineWidth = p.r * p.z * 0.9;
          ctx!.beginPath();
          ctx!.moveTo(t0[0], t0[1]);
          ctx!.lineTo(t1[0], t1[1]);
          ctx!.stroke();
        }
      }

      // 粒子本体
      for (const p of particles) {
        ctx!.fillStyle = `rgba(${p.c},${0.85 * p.z})`;
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.r * p.z, 0, Math.PI * 2);
        ctx!.fill();
        ctx!.fillStyle = `rgba(${p.c},${0.1 * p.z})`;
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.r * p.z * 3.5, 0, Math.PI * 2);
        ctx!.fill();
      }

      // 核心附近近邻连线 + 鼠标连线
      const corePullR = Math.min(W, H) * 0.35;
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        const adToCore = Math.hypot(a.x - target.x, a.y - target.y);
        if (adToCore <= corePullR) {
          for (let j = i + 1; j < particles.length; j++) {
            const b = particles[j];
            const bdToCore = Math.hypot(b.x - target.x, b.y - target.y);
            if (bdToCore > corePullR) continue;
            const dx = a.x - b.x, dy = a.y - b.y;
            const d2 = dx * dx + dy * dy;
            if (d2 < LINK * LINK) {
              const alpha = (1 - Math.sqrt(d2) / LINK) * 0.35 * Math.min(a.z, b.z);
              ctx!.strokeStyle = `rgba(76,201,240,${alpha})`;
              ctx!.lineWidth = 1;
              ctx!.beginPath();
              ctx!.moveTo(a.x, a.y); ctx!.lineTo(b.x, b.y);
              ctx!.stroke();
            }
          }
        }
        if (mouse.active) {
          const dx = a.x - mouse.x, dy = a.y - mouse.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < MLINK * MLINK) {
            const alpha = (1 - Math.sqrt(d2) / MLINK) * 0.45;
            ctx!.strokeStyle = `rgba(177,77,255,${alpha})`;
            ctx!.lineWidth = 1.1;
            ctx!.beginPath();
            ctx!.moveTo(a.x, a.y); ctx!.lineTo(mouse.x, mouse.y);
            ctx!.stroke();
          }
        }
      }

      raf = requestAnimationFrame(step);
    }

    function onMove(e: MouseEvent) {
      const r = host!.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
      mouse.active = true;
    }
    function onLeave() { mouse.active = false; }
    function onResize() { resize(); init(); }
    function onScroll() { computeTarget(); }

    host.addEventListener("mousemove", onMove);
    host.addEventListener("mouseleave", onLeave);
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll, { passive: true });

    resize(); init();
    raf = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(raf);
      host.removeEventListener("mousemove", onMove);
      host.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll);
    };
  }, [targetSelector, density, trailLength]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      aria-hidden="true"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
    />
  );
}
