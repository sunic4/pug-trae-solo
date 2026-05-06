---
id: "feat-26"
type: feature
status: done
title: "内存优化 (对象池/离屏Canvas管理/GC调优)"
origin_type: req
depends_on: ["feat-04", "feat-19"]
created: "2026-05-01 19:15"
updated: "2026-05-01 19:15"
stale: false
---

# feat-26: 内存优化 (对象池/离屏Canvas管理/GC调优)

## 实现思路概述

基于 feat-04 (图层管理) 和 feat-19 (虚拟列表)，实现内存优化基础设施。

1. **ObjectPool** — 通用对象池，预分配+回收复用，减少 GC 压力
2. **OffscreenCanvasManager** — 离屏 Canvas 生命周期管理，LRU 缓存+按需分配+显式释放
3. **GCAdvisor** — GC 调优建议器，监控内存使用并提供建议

### 对象池模型

```
acquire() → 从池中取对象 (池空则创建)
release(obj) → 归还对象 (池满则丢弃)
池容量上限 = maxSize
```

### 离屏 Canvas 管理

```
acquire(key, width, height) → 获取/创建离屏 Canvas
release(key) → 归还到缓存
evict(key) → 显式释放
LRU 淘汰策略，最大缓存数限制
```

## 文件变更清单

| 操作 | 文件路径 | 说明 |
|------|---------|------|
| 新建 | `src/platform/memory.ts` | ObjectPool + OffscreenCanvasManager + GCAdvisor |
| 新建 | `src/platform/__tests__/memory.test.ts` | 内存优化单元测试 |
| 修改 | `src/platform/index.ts` | 模块导出更新 |
| 修改 | `src/index.ts` | 顶层导出更新 |

## 接口与类型定义

### memory.ts

```typescript
interface ObjectPool<T> {
  acquire(): T
  release(obj: T): void
  readonly size: number
  readonly available: number
  clear(): void
}

interface OffscreenCanvasEntry {
  readonly canvas: OffscreenCanvas | HTMLCanvasElement
  readonly width: number
  readonly height: number
  readonly lastUsed: number
}

interface OffscreenCanvasManager {
  acquire(key: string, width: number, height: number): OffscreenCanvasEntry
  release(key: string): void
  evict(key: string): void
  readonly size: number
  clear(): void
  dispose(): void
}

interface MemoryStats {
  readonly poolSize: number
  readonly canvasCount: number
  readonly estimatedBytes: number
}

interface GCAdvisor {
  readonly stats: MemoryStats
  suggest(): string[]
  registerPool(name: string, pool: { size: number; available: number }): void
  unregisterPool(name: string): void
}

function createObjectPool<T>(factory: () => T, reset: (obj: T) => void, maxSize?: number): ObjectPool<T>
function createOffscreenCanvasManager(maxSize?: number): OffscreenCanvasManager
function createGCAdvisor(): GCAdvisor
```

## 测试策略

| 项目 | 内容 |
|------|------|
| 测试金字塔 | 单元 100% |
| Mock 策略 | Mock OffscreenCanvas / document.createElement |
| 关键路径 | 1) 对象池 acquire/release 2) 离屏 Canvas 缓存 3) LRU 淘汰 |
| 边界测试 | 1) 池满丢弃 2) 缓存满淘汰 3) 重复 acquire |

## 风险与依赖

| 风险 | 缓解措施 |
|------|---------|
| OffscreenCanvas 兼容性 | 降级到 HTMLCanvasElement |
| 对象池内存泄漏 | reset 函数清理引用 |

## DoD 验收标准

- [x] 构建零错误
- [x] 类型检查零 error
- [x] 单元测试 100% 通过
- [x] ObjectPool 正确复用对象
- [x] OffscreenCanvasManager 正确管理缓存
- [x] GCAdvisor 正确提供建议
- [x] impl-checklist.yaml 所有条目 = done
