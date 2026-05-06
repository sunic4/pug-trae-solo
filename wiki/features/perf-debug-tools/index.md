---
id: "feat-25"
type: feature
status: done
title: "性能监控与调试工具 (FPS/Recomposition Counter/Layout Inspector)"
origin_type: req
depends_on: ["feat-02", "feat-04", "feat-06"]
created: "2026-05-01 19:10"
updated: "2026-05-01 19:10"
stale: false
---

# feat-25: 性能监控与调试工具

## 实现思路概述

基于 feat-02 (重组调度器)、feat-04 (图层脏区域)、feat-06 (布局引擎)，实现运行时性能监控和调试工具。

1. **FPSMonitor** — 帧率监控，统计 FPS/帧时间/丢帧率，支持回调通知
2. **RecompositionCounter** — 重组计数器，追踪各 Scope 的重组次数和耗时
3. **LayoutInspector** — 布局检查器，收集布局树结构信息用于调试可视化

### FPS 监控模型

```
每帧记录 timestamp → 计算 delta → 统计 FPS
FPS = 1000 / 平均帧时间
丢帧 = 帧时间 > 16.67ms (60fps 阈值)
```

### 重组计数模型

```
Recomposer.performRecompose() → 记录 scopeId + 耗时
按 scope 聚合: { scopeId, count, totalMs, avgMs }
```

### 布局检查模型

```
遍历 LayoutNode 树 → 收集 { id, position, size, depth }
扁平化输出用于调试
```

## 文件变更清单

| 操作 | 文件路径 | 说明 |
|------|---------|------|
| 新建 | `src/platform/perf-monitor.ts` | FPSMonitor + RecompositionCounter + LayoutInspector |
| 新建 | `src/platform/__tests__/perf-monitor.test.ts` | 性能监控单元测试 |
| 修改 | `src/platform/index.ts` | 模块导出更新 |
| 修改 | `src/index.ts` | 顶层导出更新 |

## 接口与类型定义

### perf-monitor.ts

```typescript
interface FPSStats {
  readonly fps: number
  readonly frameTimeMs: number
  readonly droppedFrames: number
  readonly totalFrames: number
}

interface FPSMonitor {
  readonly stats: FPSStats
  readonly isRunning: boolean
  start(): void
  stop(): void
  reset(): void
}

interface RecompositionInfo {
  readonly scopeId: string
  readonly count: number
  readonly totalMs: number
  readonly avgMs: number
}

interface RecompositionCounter {
  record(scopeId: string, durationMs: number): void
  getStats(): RecompositionInfo[]
  reset(): void
}

interface LayoutNodeInfo {
  readonly id: number
  readonly x: number
  readonly y: number
  readonly width: number
  readonly height: number
  readonly depth: number
}

interface LayoutInspector {
  inspect(root: { id: number; position: { x: number; y: number }; measureResult: { width: number; height: number } | null; children: unknown[] }): LayoutNodeInfo[]
}

function createFPSMonitor(onUpdate?: (stats: FPSStats) => void): FPSMonitor
function createRecompositionCounter(): RecompositionCounter
function createLayoutInspector(): LayoutInspector
```

## 测试策略

| 项目 | 内容 |
|------|------|
| 测试金字塔 | 单元 100% |
| Mock 策略 | Mock requestAnimationFrame / performance.now |
| 关键路径 | 1) FPS 计算 2) 重组计数聚合 3) 布局树遍历 |
| 边界测试 | 1) 零帧 2) 空重组记录 3) 空布局树 |

## 风险与依赖

| 风险 | 缓解措施 |
|------|---------|
| FPS 监控影响性能 | 轻量统计，避免每帧分配对象 |
| 重组计数内存泄漏 | 限制最大记录条数 |

## DoD 验收标准

- [x] 构建零错误
- [x] 类型检查零 error
- [x] 单元测试 100% 通过
- [x] FPSMonitor 正确统计帧率
- [x] RecompositionCounter 正确聚合重组信息
- [x] LayoutInspector 正确遍历布局树
- [x] impl-checklist.yaml 所有条目 = done
