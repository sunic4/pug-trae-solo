---
id: "feat-05"
type: feature
status: done
title: "矢量图形绘制 (Rect/Circle/RoundRect/Path)"
origin_type: req
depends_on: ["feat-03"]
created: "2026-05-01 14:00"
updated: "2026-05-01 14:00"
stale: false
---

# feat-05: 矢量图形绘制 (Rect/Circle/RoundRect/Path)

## 实现思路概述

feat-03 已实现基础 DrawCommand/DrawScope，包含 Rect/Circle/RoundRect/Line 的填充与描边。本特性在此基础上扩展：

1. **VectorPath** — 不可变路径构建器，支持 moveTo/lineTo/quadraticCurveTo/bezierCurveTo/arcTo/closePath
2. **fillPath / strokePath** — 路径绘制命令
3. **BlendMode** — 混合模式支持（source-over/multiply/screen/overlay 等）
4. **Shadow** — 阴影效果（shadowBlur/shadowOffsetX/shadowOffsetY/shadowColor）

设计原则：
- VectorPath 采用 Builder 模式构建，构建完成后 freeze 为不可变对象
- 新增 DrawCommand 类型遵循现有工厂函数模式
- BlendMode/Shadow 作为绘制状态命令，与 save/restore 配合使用

## 文件变更清单

| 操作 | 文件路径 | 说明 |
|------|---------|------|
| 新建 | `src/renderer/path.ts` | VectorPath 路径构建器 |
| 修改 | `src/renderer/types.ts` | 新增 PathCommand/BlendMode/Shadow/VectorPath 类型 |
| 修改 | `src/renderer/draw-command.ts` | 新增 fillPath/strokePath/setBlendMode/setShadow 工厂函数 |
| 修改 | `src/renderer/draw-scope.ts` | 新增 fillPath/strokePath/setBlendMode/setShadow 方法 |
| 修改 | `src/renderer/index.ts` | 模块导出 |
| 修改 | `src/index.ts` | 顶层导出 |

## 接口与类型引用

### types.ts 新增

```typescript
type PathCommandType =
  | 'moveTo'
  | 'lineTo'
  | 'quadraticCurveTo'
  | 'bezierCurveTo'
  | 'arcTo'
  | 'closePath'

interface PathCommand {
  readonly type: PathCommandType
  readonly args: ReadonlyArray<number>
}

type BlendMode =
  | 'source-over'
  | 'source-atop'
  | 'source-in'
  | 'source-out'
  | 'destination-over'
  | 'destination-atop'
  | 'destination-in'
  | 'destination-out'
  | 'multiply'
  | 'screen'
  | 'overlay'
  | 'darken'
  | 'lighten'
  | 'color-dodge'
  | 'color-burn'
  | 'hard-light'
  | 'soft-light'
  | 'difference'
  | 'exclusion'
  | 'xor'

interface Shadow {
  readonly blur: number
  readonly offsetX: number
  readonly offsetY: number
  readonly color: Color
}

interface VectorPath {
  readonly commands: ReadonlyArray<PathCommand>
  readonly bounds: Rect
}
```

### path.ts

```typescript
interface VectorPathBuilder {
  moveTo(x: number, y: number): VectorPathBuilder
  lineTo(x: number, y: number): VectorPathBuilder
  quadraticCurveTo(cpx: number, cpy: number, x: number, y: number): VectorPathBuilder
  bezierCurveTo(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number): VectorPathBuilder
  arcTo(x1: number, y1: number, x2: number, y2: number, radius: number): VectorPathBuilder
  closePath(): VectorPathBuilder
  build(): VectorPath
}

function createVectorPathBuilder(): VectorPathBuilder
```

### draw-command.ts 新增

```typescript
function createFillPath(path: VectorPath, color: Color): DrawCommand
function createStrokePath(path: VectorPath, color: Color, strokeWidth?: number): DrawCommand
function createSetBlendMode(mode: BlendMode): DrawCommand
function createSetShadow(shadow: Shadow): DrawCommand
```

### draw-scope.ts 新增

```typescript
interface DrawScope {
  fillPath(path: VectorPath, color: Color): void
  strokePath(path: VectorPath, color: Color, strokeWidth?: number): void
  setBlendMode(mode: BlendMode): void
  setShadow(shadow: Shadow): void
}
```

## 测试策略

| 项目 | 内容 |
|------|------|
| 测试金字塔 | 单元 85% : 集成 15% |
| Mock 策略 | Mock CanvasRenderingContext2D |
| 关键路径 | 1) VectorPathBuilder 构建路径 2) fillPath/strokePath execute 3) BlendMode/Shadow 状态设置 |
| 边界测试 | 1) 空路径绘制 2) 单点路径 3) Shadow blur=0 |

## 风险与依赖

| 风险 | 缓解 |
|------|------|
| Canvas 2D blendMode 浏览器兼容性 | 仅使用广泛支持的 blendMode 值 |
| Path bounds 计算复杂度 | 采用增量计算，构建时维护 bounds |
| VectorPathBuilder 内存 | build() 后释放内部数组引用 |

## DoD 验收标准

- [x] 构建零错误
- [x] 类型检查零 error
- [x] 单元测试 100% 通过
- [x] VectorPath 支持 moveTo/lineTo/quadraticCurveTo/bezierCurveTo/arcTo/closePath
- [x] fillPath/strokePath 正确执行 Canvas 2D 路径绘制
- [x] BlendMode/Shadow 正确设置 Canvas 状态
- [x] impl-checklist.yaml 所有条目=done
