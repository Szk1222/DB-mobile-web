"use client";

/**
 * ScrollProgress · 顶部滚动进度条
 *
 * 用法：在 layout.tsx 的 <body> 顶部加一行
 *   <ScrollProgress />
 */
import { useEffect, useRef } from "react";

export function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const p = max > 0 ? window.scrollY / max : 0;
        el.style.transform = `scaleX(${p})`;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <>
      <div ref={ref} className="scrollProgressBar" aria-hidden="true" />
      <style jsx>{`
        .scrollProgressBar {
          position: fixed; top: 0; left: 0; right: 0; height: 2px; z-index: 60;
          background: linear-gradient(90deg, #0469cf 0%, #67e8f9 50%, #b14dff 100%);
          transform-origin: left; transform: scaleX(0);
          transition: transform 80ms linear;
        }
      `}</style>
    </>
  );
}
