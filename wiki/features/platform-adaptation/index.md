---
id: "feat-24"
type: feature
status: done
title: "移动端平台适配 (SafeArea/DPI/屏幕方向)"
origin_type: req
depends_on: ["feat-15"]
created: "2026-05-01 18:50"
updated: "2026-05-01 18:50"
stale: false
---

# feat-24: 移动端平台适配 (SafeArea/DPI/屏幕方向)

## 实现思路概述

基于 feat-15 (原子组件)，实现移动端平台适配层，提供 Density 缩放、SafeArea 检测、屏幕方向响应三大能力。

1. **Density** — DPI 密度抽象，提供 dp/sp 到像素的转换，默认基于 `window.devicePixelRatio`
2. **SafeArea** — 安全区域检测，从 CSS env() 或视口推断 insets，为刘海屏/底部导航栏提供避让信息
3. **ScreenInfo** — 屏幕信息聚合，包含尺寸、方向、密度、安全区域，支持变化监听
4. **PlatformAdapter** — 统一平台适配器，整合上述能力，提供创建/销毁/监听生命周期

### Density 模型

```
物理像素 = dp值 × density.scale
文本像素 = sp值 × density.scale × fontScale
```

默认 scale = window.devicePixelRatio，DPI 分类遵循 Android 密度标准 (mdpi=160, hdpi=240, xhdpi=320, xxhdpi=480, xxxhdpi=640)。

### SafeArea 检测策略

优先级：CSS env() → 视口推断 → 默认零 insets

```
env(safe-area-inset-top)    → 顶部安全区域
env(safe-area-inset-bottom) → 底部安全区域 (Home Indicator)
env(safe-area-inset-left)   → 左侧安全区域 (横屏刘海)
env(safe-area-inset-right)  → 右侧安全区域 (横屏刘海)
```

### 屏幕方向

```
portrait:  height >= width
landscape: width > height
```

通过 `resize` 事件 + `screen.orientation` API 监听变化。

## 文件变更清单

| 操作 | 文件路径 | 说明 |
|------|---------|------|
| 新建 | `src/platform/density.ts` | Density 类型 + dp/sp 转换 |
| 新建 | `src/platform/safe-area.ts` | SafeArea 类型 + 检测逻辑 |
| 新建 | `src/platform/screen-info.ts` | ScreenInfo + ScreenOrientation + 变化监听 |
| 修改 | `src/platform/index.ts` | 模块导出 |
| 修改 | `src/index.ts` | 顶层导出更新 |
| 新建 | `src/platform/__tests__/platform.test.ts` | 平台适配单元测试 |

## 接口与类型定义

### density.ts

```typescript
interface Density {
  readonly scale: number
  readonly dpi: number
  readonly fontScale: number
}

function createDensity(scale?: number, fontScale?: number): Density
function dp(value: number, density: Density): number
function sp(value: number, density: Density): number
```

### safe-area.ts

```typescript
interface SafeArea {
  readonly top: number
  readonly bottom: number
  readonly left: number
  readonly right: number
}

function detectSafeArea(): SafeArea
```

### screen-info.ts

```typescript
type ScreenOrientation = 'portrait' | 'landscape'

interface ScreenInfo {
  readonly width: number
  readonly height: number
  readonly orientation: ScreenOrientation
  readonly density: Density
  readonly safeArea: SafeArea
}

interface PlatformAdapter {
  readonly screenInfo: ScreenInfo
  observe(callback: (info: ScreenInfo) => void): () => void
  dispose(): void
}

function detectScreenInfo(density?: Density): ScreenInfo
function createPlatformAdapter(canvas?: HTMLCanvasElement): PlatformAdapter
```

## 测试策略

| 项目 | 内容 |
|------|------|
| 测试金字塔 | 单元 100% |
| Mock 策略 | Mock window.devicePixelRatio / getComputedStyle / innerWidth/innerHeight |
| 关键路径 | 1) dp/sp 转换精度 2) SafeArea 检测 3) 屏幕方向判断 4) PlatformAdapter 生命周期 |
| 边界测试 | 1) density.scale=0 或负数 2) 零尺寸视口 3) 无 window 环境 |

## 风险与依赖

| 风险 | 缓解措施 |
|------|---------|
| CSS env() 兼容性 | 降级到视口推断 + 默认零 insets |
| SSR 环境无 window | 所有检测函数做 window 存在性检查 |
| devicePixelRatio 为 0 | clamp 到最小值 1 |

## DoD 验收标准

- [x] 构建零错误
- [x] 类型检查零 error
- [x] 单元测试 100% 通过
- [x] Density 正确计算 dp/sp 转换
- [x] SafeArea 正确检测 insets
- [x] ScreenInfo 正确判断屏幕方向
- [x] PlatformAdapter 正确管理生命周期
- [x] impl-checklist.yaml 所有条目 = done
