"use client";

/**
 * CountUp · 数字滚动计数（进入视口时触发）
 *
 * 用法：
 *   <CountUp to={200} suffix="+" />
 *   <CountUp to={99.5} suffix="%" decimals={1} />
 */
import { useEffect, useRef, useState } from "react";

type Props = {
  to: number;
  /** 起始值，默认 0 */
  from?: number;
  /** 后缀（如 "+", "%"） */
  suffix?: string;
  /** 前缀 */
  prefix?: string;
  /** 持续时长 ms，默认 1400 */
  duration?: number;
  /** 小数位数，默认 0 */
  decimals?: number;
  className?: string;
};

export function CountUp({
  to, from = 0, suffix = "", prefix = "", duration = 1400, decimals = 0, className
}: Props) {
  const [v, setV] = useState(from);
  const ref = useRef<HTMLSpanElement>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting || startedRef.current) return;
        startedRef.current = true;
        const start = performance.now();
        const step = (t: number) => {
          const p = Math.min(1, (t - start) / duration);
          const eased = 1 - Math.pow(1 - p, 3);
          setV(from + (to - from) * eased);
          if (p < 1) requestAnimationFrame(step);
          else setV(to);
        };
        requestAnimationFrame(step);
        io.unobserve(el);
      });
    }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, [to, from, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}{v.toFixed(decimals)}{suffix}
    </span>
  );
}
