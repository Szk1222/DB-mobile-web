"use client";

/**
 * CyberCursor · 自定义十字光标 + 拖尾光晕
 *
 * 用法：
 *   <CyberCursor />   // 放在 layout.tsx 的 <body> 根部即可
 *
 * - touch 设备自动隐藏
 * - 鼠标在 a / button 上时光标自动放大
 * - 与 prefers-reduced-motion 兼容（保持显示但停止 RAF 平滑）
 */
import { useEffect, useRef } from "react";

export function CyberCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(hover: none)").matches) return;

    const cursor = cursorRef.current!;
    const dot = dotRef.current!;
    const glow = glowRef.current!;

    let mx = -100, my = -100;
    let cx = -100, cy = -100;
    let gx = -100, gy = -100;

    document.documentElement.style.cursor = "none";
    const styleEl = document.createElement("style");
    styleEl.textContent = "*, a, button, input, textarea, select { cursor: none !important; }";
    document.head.appendChild(styleEl);

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
    };
    document.addEventListener("mousemove", onMove);

    let raf = 0;
    const tick = () => {
      cx += (mx - cx) * 0.22;
      cy += (my - cy) * 0.22;
      gx += (mx - gx) * 0.08;
      gy += (my - gy) * 0.08;
      cursor.style.transform = `translate(${cx}px, ${cy}px) translate(-50%,-50%)`;
      dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%,-50%)`;
      glow.style.transform = `translate(${gx}px, ${gy}px) translate(-50%,-50%)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const onOver = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest("a, button, [data-cursor='link']")) cursor.classList.add("is-link");
    };
    const onOut = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest("a, button, [data-cursor='link']")) cursor.classList.remove("is-link");
    };
    document.addEventListener("mouseover", onOver);
    document.addEventListener("mouseout", onOut);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseout", onOut);
      document.documentElement.style.cursor = "";
      styleEl.remove();
    };
  }, []);

  return (
    <>
      <div ref={glowRef} className="cyberCursorGlow" aria-hidden="true" />
      <div ref={cursorRef} className="cyberCursor" aria-hidden="true">
        <svg viewBox="0 0 28 28" fill="none">
          <circle cx="14" cy="14" r="13" stroke="#4cc9f0" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="14" y1="3" x2="14" y2="9" stroke="#4cc9f0" strokeWidth="1.2" />
          <line x1="14" y1="19" x2="14" y2="25" stroke="#4cc9f0" strokeWidth="1.2" />
          <line x1="3" y1="14" x2="9" y2="14" stroke="#4cc9f0" strokeWidth="1.2" />
          <line x1="19" y1="14" x2="25" y2="14" stroke="#4cc9f0" strokeWidth="1.2" />
        </svg>
      </div>
      <div ref={dotRef} className="cyberCursorDot" aria-hidden="true" />

      <style jsx global>{`
        .cyberCursor {
          position: fixed; top: 0; left: 0; width: 28px; height: 28px;
          pointer-events: none; z-index: 9999; mix-blend-mode: screen;
          transform: translate(-50%, -50%);
          transition: width 220ms ease, height 220ms ease, opacity 200ms ease;
        }
        .cyberCursor svg { width: 100%; height: 100%; opacity: 0.9; }
        .cyberCursor.is-link { width: 46px; height: 46px; }
        .cyberCursorDot {
          position: fixed; top: 0; left: 0; width: 6px; height: 6px; border-radius: 50%;
          background: #4cc9f0; pointer-events: none; z-index: 9999;
          transform: translate(-50%, -50%); box-shadow: 0 0 12px #4cc9f0;
        }
        .cyberCursorGlow {
          position: fixed; top: 0; left: 0; width: 360px; height: 360px; border-radius: 50%;
          pointer-events: none; z-index: 0;
          background: radial-gradient(circle, rgba(76,201,240,0.18), transparent 60%);
          transform: translate(-50%, -50%); filter: blur(20px); mix-blend-mode: screen;
        }
        @media (hover: none) {
          .cyberCursor, .cyberCursorDot, .cyberCursorGlow { display: none; }
        }
      `}</style>
    </>
  );
}
