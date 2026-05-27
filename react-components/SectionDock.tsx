"use client";

/**
 * SectionDock · 右侧悬浮区块指示器
 *
 * 用法：
 *   <SectionDock sections={[
 *     { id: "hero",      label: "// 01 HOME" },
 *     { id: "services",  label: "// 02 SERVICES" },
 *     { id: "pipeline",  label: "// 03 PIPELINE" },
 *   ]} />
 *
 * - 每个 section 必须在页面上有对应 id 的元素
 * - 滚动时自动高亮当前 section
 */
import { useEffect, useState } from "react";

type Item = { id: string; label: string };

export function SectionDock({ sections }: { sections: Item[] }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const els = sections.map((s) => document.getElementById(s.id)).filter(Boolean) as HTMLElement[];
    const onScroll = () => {
      const mid = window.scrollY + window.innerHeight * 0.4;
      let idx = 0;
      els.forEach((el, i) => { if (el.offsetTop <= mid) idx = i; });
      setActive(idx);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [sections]);

  return (
    <>
      <nav className="sectionDock" aria-label="区块导航">
        {sections.map((s, i) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            data-label={s.label}
            className={i === active ? "is-active" : ""}
          />
        ))}
      </nav>
      <style jsx>{`
        .sectionDock {
          position: fixed; right: 24px; top: 50%; transform: translateY(-50%);
          z-index: 30; display: flex; flex-direction: column; gap: 14px;
        }
        .sectionDock a {
          position: relative; width: 8px; height: 8px; border-radius: 50%;
          background: rgba(143, 214, 255, 0.2);
          transition: all 220ms ease;
        }
        .sectionDock a.is-active {
          background: #4cc9f0;
          box-shadow: 0 0 14px #4cc9f0;
          transform: scale(1.4);
        }
        .sectionDock a::after {
          content: attr(data-label);
          position: absolute; right: 22px; top: 50%; transform: translateY(-50%);
          padding: 4px 10px; border-radius: 4px;
          background: rgba(7, 13, 32, 0.95);
          border: 1px solid rgba(143, 214, 255, 0.22);
          color: #e7f0ff; font-family: "JetBrains Mono", monospace;
          font-size: 10px; letter-spacing: 0.1em; white-space: nowrap;
          opacity: 0; pointer-events: none;
          transition: opacity 200ms ease;
        }
        .sectionDock a:hover::after { opacity: 1; }
        @media (max-width: 1100px) { .sectionDock { display: none; } }
      `}</style>
    </>
  );
}
