# Cyber Tech 交互组件包

把这一组组件拷进 `web/src/components/`，在你的 Next.js 项目里即可使用。
全部带 `"use client"`，安全地用在 Server Components 树里。

---

## 组件清单

| 文件 | 作用 | 推荐放置位置 |
|---|---|---|
| `CyberCursor.tsx` | 自定义十字光标 + 拖尾光晕 | `layout.tsx` 根部（全局一次） |
| `ScrollProgress.tsx` | 顶部 2px 滚动进度条 | `layout.tsx` 根部 |
| `SectionDock.tsx` | 右侧悬浮区块指示点 | `HomePage.tsx` 内任意位置 |
| `MagneticButton.tsx` | 磁吸跟随的按钮 / 链接 | 替换 hero / cta 的 CTA |
| `SpotlightCard.tsx` | 鼠标聚光 + 可选 3D tilt 卡片 | 替换 serviceCards、datasetCards |
| `DecodeText.tsx` | 文字 decode 乱码归位 | hero meta、section eyebrow |
| `CountUp.tsx` | 进入视口数字滚动 | statsBand |
| `HeroDataFlowParticles.tsx` | 粒子向核心汇聚的数据流（替代现 `HeroParticles.tsx`） | hero |

---

## 接入步骤

### 1. layout.tsx 加全局组件

```tsx
import { CyberCursor } from "@/components/CyberCursor";
import { ScrollProgress } from "@/components/ScrollProgress";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <ScrollProgress />
        <CyberCursor />
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
```

### 2. HomePage.tsx 改造 hero

```tsx
import { HeroDataFlowParticles } from "@/components/HeroDataFlowParticles";
import { MagneticButton } from "@/components/MagneticButton";
import { DecodeText } from "@/components/DecodeText";
import { CountUp } from "@/components/CountUp";
import { SectionDock } from "@/components/SectionDock";

// 在 <main> 顶部加入
<SectionDock sections={[
  { id: "hero",     label: "// 01 HOME" },
  { id: "services", label: "// 02 SERVICES" },
  { id: "pipeline", label: "// 03 PIPELINE" },
  { id: "voice",    label: "// 04 VOICE AI" },
  { id: "datasets", label: "// 05 DATASETS" },
  { id: "contact",  label: "// 06 CONTACT" },
]} />

// hero 区
<section className="heroSection heroImmersive" id="hero">
  ...
  <HeroDataFlowParticles targetSelector="#heroVisual" />

  <div className="heroCopy">
    <span className="sectionLabel">
      <DecodeText text="AI 数据基础设施" />
    </span>
    ...
    <MagneticButton as="a" href="#contact" className="primaryButton">
      预约试用 →
    </MagneticButton>
  </div>

  <div className="heroMedia" id="heroVisual">
    <HeroOrbitVisual />
  </div>
</section>
```

### 3. statsBand 接 CountUp

```tsx
<strong>
  <CountUp to={200} suffix="+" />
</strong>
```

### 4. serviceCards / datasetCards 改 SpotlightCard

```tsx
{serviceCards.map((s) => (
  <SpotlightCard
    as="a"
    href={s.href}
    className="featureCard"
    tilt
    key={s.title}
  >
    <CyberIcon name={s.icon} />
    <h3>{s.title}</h3>
    ...
  </SpotlightCard>
))}
```

并在 `globals.css` 的 `.featureCard` 加上聚光层（已能直接使用 --mx/--my 变量）：

```css
.featureCard { position: relative; isolation: isolate; overflow: hidden; }
.featureCard::before {
  content: ""; position: absolute; inset: 0; z-index: -1;
  background: radial-gradient(
    600px circle at var(--mx, 50%) var(--my, 0%),
    rgba(76, 201, 240, 0.16), transparent 40%
  );
  opacity: 0; transition: opacity 280ms ease;
}
.featureCard:hover::before { opacity: 1; }
```

---

## 注意事项

- 这些组件都对 `prefers-reduced-motion: reduce` 友好（自动降级）
- `CyberCursor` 在 touch 设备会自动隐藏
- `MagneticButton` 的 `transform` 在悬停期间会被覆盖；若与 `[data-reveal]` 入场动画冲突，等入场结束后再启用即可
- `HeroDataFlowParticles` 需要 hero 区为 `position: relative`，且 `targetSelector` 指向的元素要在同一 hero 容器内
