"use client";

/**
 * SpotlightCard · 鼠标聚光卡片
 *
 * - 通过 CSS 变量 --mx / --my 让卡片背景上的 radial-gradient 跟随鼠标
 * - 可选叠加 3D tilt（tilt 属性）
 *
 * 用法：
 *   <SpotlightCard className="svc-card" tilt>
 *     ...content...
 *   </SpotlightCard>
 *
 * 配套 CSS（card 上）：
 *   .my-card { position: relative; isolation: isolate; overflow: hidden; }
 *   .my-card::before {
 *     content: ""; position: absolute; inset: 0; z-index: -1; opacity: 0;
 *     transition: opacity 300ms ease;
 *     background: radial-gradient(600px circle at var(--mx,50%) var(--my,0%),
 *                  rgba(76,201,240,0.16), transparent 40%);
 *   }
 *   .my-card:hover::before { opacity: 1; }
 */
import {
  useRef,
  type ReactNode,
  type HTMLAttributes
} from "react";

type Props = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  /** 是否同时启用 3D tilt */
  tilt?: boolean;
  /** tilt 强度，默认 4（度） */
  tiltAmount?: number;
  /** 渲染为何种 tag（用于 <a> 卡片） */
  as?: "div" | "a";
  href?: string;
};

export function SpotlightCard({
  children,
  tilt = false,
  tiltAmount = 4,
  as = "div",
  className,
  style,
  ...rest
}: Props) {
  const ref = useRef<HTMLDivElement | HTMLAnchorElement>(null);

  function onMove(e: React.MouseEvent) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const mx = e.clientX - r.left;
    const my = e.clientY - r.top;
    el.style.setProperty("--mx", `${mx}px`);
    el.style.setProperty("--my", `${my}px`);
    if (tilt) {
      const nx = mx / r.width - 0.5;
      const ny = my / r.height - 0.5;
      el.style.transform = `perspective(1200px) rotateX(${-ny * tiltAmount}deg) rotateY(${nx * tiltAmount}deg)`;
    }
  }
  function onLeave() {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "";
  }

  const mergedStyle: React.CSSProperties = {
    transformStyle: "preserve-3d",
    transition: "transform 240ms ease",
    ...style
  };

  if (as === "a") {
    return (
      <a
        ref={ref as React.RefObject<HTMLAnchorElement>}
        className={className}
        style={mergedStyle}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        {...(rest as unknown as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {children}
      </a>
    );
  }
  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className={className}
      style={mergedStyle}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      {...rest}
    >
      {children}
    </div>
  );
}
