"use client";

/**
 * DecodeText · 文字 decode 乱码归位动画
 *
 * 用法：
 *   <DecodeText text="AI DATA INFRASTRUCTURE" />
 *   <DecodeText text="..." delay={400} speed={1.5} />
 */
import { useEffect, useRef, useState } from "react";

const CHARS = "!<>-_\\/[]{}—=+*^?#$@%&АБВГД01";

type Props = {
  text: string;
  /** 启动延迟（ms） */
  delay?: number;
  /** 每个字符显现的速度倍率（越大越快） */
  speed?: number;
  className?: string;
};

export function DecodeText({ text, delay = 200, speed = 1.5, className }: Props) {
  const [out, setOut] = useState(text);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const t = setTimeout(() => {
      let frame = 0;
      const total = text.length * speed + 10;
      function step() {
        const s = text
          .split("")
          .map((c, i) => {
            if (frame > i * speed) return c;
            if (c === " ") return " ";
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          })
          .join("");
        setOut(s);
        frame++;
        if (frame < total) requestAnimationFrame(step);
        else setOut(text);
      }
      requestAnimationFrame(step);
    }, delay);

    return () => clearTimeout(t);
  }, [text, delay, speed]);

  return <span className={className}>{out}</span>;
}
