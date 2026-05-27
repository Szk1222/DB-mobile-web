"use client";

/**
 * MagneticButton · 磁吸按钮
 *
 * - 鼠标靠近按钮时元素轻微跟随
 * - 离开时平滑回位
 * - 支持渲染为任意标签（默认 button；可传 as="a" 当链接）
 *
 * 用法：
 *   <MagneticButton className="btn btn-primary" href="#contact">预约试用</MagneticButton>
 */
import {
  forwardRef,
  useRef,
  useImperativeHandle,
  useEffect,
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type ReactNode
} from "react";

type CommonProps = {
  children: ReactNode;
  /** 磁吸强度 X 方向，默认 0.18 */
  strengthX?: number;
  /** 磁吸强度 Y 方向，默认 0.28 */
  strengthY?: number;
  className?: string;
};

type AsButton = CommonProps & ButtonHTMLAttributes<HTMLButtonElement> & { as?: "button" };
type AsAnchor = CommonProps & AnchorHTMLAttributes<HTMLAnchorElement> & { as: "a"; href: string };

type Props = AsButton | AsAnchor;

export const MagneticButton = forwardRef<HTMLElement, Props>(function MagneticButton(props, ref) {
  const { children, strengthX = 0.18, strengthY = 0.28, className, as = "button", ...rest } = props as AsButton & { as?: "a" | "button" };
  const elRef = useRef<HTMLElement>(null);
  useImperativeHandle(ref, () => elRef.current as HTMLElement, []);

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;
    if (typeof window === "undefined") return;
    if (window.matchMedia("(hover: none)").matches) return;

    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      el.style.transform = `translate(${x * strengthX}px, ${y * strengthY}px)`;
    };
    const onLeave = () => { el.style.transform = ""; };

    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [strengthX, strengthY]);

  if (as === "a") {
    return (
      <a
        ref={elRef as React.RefObject<HTMLAnchorElement>}
        className={className}
        style={{ transition: "transform 240ms cubic-bezier(.2,.7,.2,1)", display: "inline-flex" }}
        {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      ref={elRef as React.RefObject<HTMLButtonElement>}
      className={className}
      style={{ transition: "transform 240ms cubic-bezier(.2,.7,.2,1)", display: "inline-flex" }}
      {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {children}
    </button>
  );
});
