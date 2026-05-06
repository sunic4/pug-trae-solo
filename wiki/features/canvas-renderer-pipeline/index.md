---
id: "feat-03"
type: feature
status: done
title: "Canvas 2D 渲染管线基础 (DrawCommand/DrawScope)"
origin_type: req
depends_on: []
created: "2026-05-01 11:00"
updated: "2026-05-01 11:00"
stale: false
---

# feat-03: Canvas 2D 渲染管线基础 (DrawCommand/DrawScope)

## 实现思路概述

实现 Canvas 2D 渲染管线的基础层：
1. **DrawCommand** — 不可变绘制指令，封装 Canvas 2D API 调用
2. **DrawScope** — 绘制作用域，提供声明式绘制 API
3. **CanvasHost** — Canvas 宿主，管理 Canvas 上下文和渲染循环
4. **HybridRenderer** — 混合渲染器，MVP 阶段实现 Immediate Mode + 基础脏标记

## 文件变更清单

| 操作 | 文件路径 | 说明 |
|------|---------|------|
| 新建 | `src/renderer/types.ts` | 渲染器共享类型 |
| 新建 | `src/renderer/draw-command.ts` | DrawCommand 实现 |
| 新建 | `src/renderer/draw-scope.ts` | DrawScope 声明式绘制 API |
| 新建 | `src/renderer/canvas-host.ts` | CanvasHost 实现 |
| 修改 | `src/renderer/index.ts` | 模块导出 |
| 修改 | `src/index.ts` | 顶层导出 |

## 接口与类型引用

### types.ts

```typescript
type NodeId = number
type CommandType = 'fillRect' | 'strokeRect' | 'fillCircle' | 'strokeCircle' | 'fillText' | 'strokeText' | 'clipRect' | 'save' | 'restore' | 'setAlpha' | 'drawLine' | 'fillRoundRect' | 'strokeRoundRect'
interface Rect { readonly x: number; readonly y: number; readonly width: number; readonly height: number }
interface Point { readonly x: number; readonly y: number }
interface Color { readonly r: number; readonly g: number; readonly b: number; readonly a: number }
```

### draw-command.ts

```typescript
interface DrawCommand {
  readonly type: CommandType
  readonly args: ReadonlyArray<unknown>
  readonly bounds: Rect
  execute(ctx: CanvasRenderingContext2D): void
}
```

### draw-scope.ts

```typescript
interface DrawScope {
  fillRect(rect: Rect, color: Color): void
  strokeRect(rect: Rect, color: Color, strokeWidth?: number): void
  fillCircle(center: Point, radius: number, color: Color): void
  fillText(text: string, position: Point, color: Color, fontSize?: number): void
  drawLine(start: Point, end: Point, color: Color, strokeWidth?: number): void
  fillRoundRect(rect: Rect, radius: number, color: Color): void
  setAlpha(alpha: number): void
  save(): void
  restore(): void
  getCommands(): DrawCommand[]
}
```

### canvas-host.ts

```typescript
interface CanvasHost {
  readonly canvas: HTMLCanvasElement
  readonly ctx: CanvasRenderingContext2D
  render(commands: DrawCommand[]): void
  clear(): void
  dispose(): void
}
```

## 测试策略

| 项目 | 内容 |
|------|------|
| 测试金字塔 | 单元 85% : 集成 15% |
| Mock 策略 | Mock CanvasRenderingContext2D |
| 关键路径 | 1) DrawCommand execute 2) DrawScope 生成命令 3) CanvasHost render |
| 边界测试 | 1) 空 commands 2) alpha 越界 |

## DoD 验收标准

- [x] 构建零错误
- [x] 类型检查零 error
- [x] 单元测试 100% 通过
