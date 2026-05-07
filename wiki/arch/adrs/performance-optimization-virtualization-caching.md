---
id: "performance-optimization-virtualization-caching"
type: architecture
status: accepted
title: "性能优化 — 虚拟化 + 智能缓存 + 增量渲染"
depends_on:
  - "../road-map/canvas-ui-runtime.md"
  - "./rendering-architecture-hybrid-mode.md"
  - "./layout-engine-custom-linear-column-row.md"
  - "./reactive-state-snapshot-context-based.md"
  - "./data-flow-management-unidirectional-pattern.md"
created: "2026-04-30 18:20"
updated: "2026-04-30 18:25"
stale: false
---

# ADR: 性能优化 — 虚拟化 + 智能缓存 + 增量渲染

## 背景

Canvas UI 运行时面向移动端和 Web 端，对性能有严格要求：

**核心性能指标**：
- 首屏渲染时间（FCP）< 1s
- 交互响应时间 < 100ms
- 滚动帧率稳定在 60 FPS
- 内存占用合理（移动端 < 200MB）

> **如何设计一个多层次的性能优化体系，确保在各种场景下都能保持流畅的用户体验？**

### 性能瓶颈分析

| 场景 | 典型问题 | 影响范围 |
|------|---------|---------|
| 长列表渲染 | DOM/Canvas 节点过多，内存爆炸 | 所有列表页 |
| 频繁状态更新 | 不必要的重组（Recomposition）开销 | 实时数据、表单 |
| 复杂布局计算 | 主线程阻塞，掉帧 | 表格、仪表盘 |
| 大量图片加载 | 网络请求堆积，内存占用高 | 图片墙、相册 |
| 动画过渡 | GPU/CPU 负载过高，卡顿 | 页面切换、微交互 |

### 候选方案

| 方案 | 描述 | 优点 | 缺点 |
|------|------|------|------|
| **A) 虚拟化 + 缓存 + 增量渲染** | 仅渲染可视区域；缓存计算结果；最小化更新 | 全面覆盖主要场景 | 实现复杂度高 |
| B) 仅虚拟化 | 只解决长列表问题 | 实现简单 | 无法优化其他场景 |
| C) 仅缓存 | 使用 memo/useMemo | 开发者友好 | 需要开发者手动优化 |
| D) Web Worker 卸载 | 将计算移到后台线程 | 不阻塞主线程 | 通信开销大 |

## 决策结果

选择 **方案 A：多层次性能优化体系**，包含以下核心策略：

```
┌─────────────────────────────────────────────────────┐
│           四层性能优化架构                            │
│                                                     │
│  Layer 4: 应用层优化                                 │
│  ┌─────────────────────────┐                        │
│  │ • 代码分割 (Code Split)  │                        │
│  │ • 懒加载 (Lazy Load)     │                        │
│  │ • 资源预加载 (Prefetch)   │                        │
│  └──────────┬──────────────┘                        │
│             │                                        │
│             ▼                                        │
│  Layer 3: 渲染层优化                                 │
│  ┌─────────────────────────┐                        │
│  │ • 虚拟滚动 (Virtualization)│                      │
│  │ • 增量渲染 (Dirty Region) │                       │
│  │ • 离屏 Canvas (Offscreen) │                       │
│  └──────────┬──────────────┘                        │
│             │                                        │
│             ▼                                        │
│  Layer 2: 计算层优化                                 │
│  ┌─────────────────────────┐                        │
│  │ • 布局缓存 (Layout Cache) │                        │
│  │ • Memoization (useMemo)  │                        │
│  │ • Diff 算法优化          │                        │
│  └──────────┬──────────────┘                        │
│             │                                        │
│             ▼                                        │
│  Layer 1: 数据层优化                                 │
│  ┌─────────────────────────┐                        │
│  │ • 细粒度依赖追踪         │                        │
│  │ • 批量更新 (Batching)    │                        │
│  │ • 不可变数据 (Immutable) │                        │
│  └─────────────────────────┘                        │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 核心优化策略详解

#### 1. 虚拟化滚动（Virtual Scrolling）

**问题**：渲染 10,000 条列表项会创建 10,000 个 DOM/Canvas 节点，导致内存占用过高和滚动卡顿。

**解决方案**：仅渲染可视区域内的元素（+ 缓冲区）

```typescript
// ===== LazyColumn/LazyRow API =====

interface VirtualListProps<T> {
  items: T[];
  itemCount: number;                    // 总数量
  itemSize: (index: number) => number;  // 动态高度估算函数
  renderItem: (item: T, index: number) => void;
  
  // 可视区域配置
  viewportSize: { width: number; height: number };
  overscanCount?: number;               // 预渲染缓冲区（默认 5）
  
  // 性能配置
  scrollThreshold?: number;             // 滚动阈值（默认 10px）
  estimateSize?: number;                // 默认预估尺寸（用于初始化）
}

const LazyColumn = composable<VirtualListProps<any>>((ctx, {
  items,
  itemCount,
  itemSize,
  renderItem,
  viewportSize,
  overscanCount = 5,
  estimateSize = 50
}) => {
  const scrollOffset = remember(ctx, () => mutableStateOf(0));
  const sizeCache = remember(ctx, () => new Map<number, number>());

  const visibleStart = findNearestItemIndex(scrollOffset.value, sizeCache, estimateSize);
  const visibleEnd = findNearestItemIndex(
    scrollOffset.value + viewportSize.height,
    sizeCache,
    estimateSize
  );

  const start = Math.max(0, visibleStart - overscanCount);
  const end = Math.min(itemCount - 1, visibleEnd + overscanCount);

  let totalHeight = 0;
  for (let i = 0; i < itemCount; i++) {
    totalHeight += sizeCache.get(i) ?? estimateSize;
  }

  Column(ctx, Modifier.create().height(viewportSize.height).freeze(), 'top', 'start', () => {
    Box(ctx, () => {
    }, Modifier.create().height(totalHeight).freeze());

    for (let i = start; i <= end; i++) {
      const item = items[i];
      if (item) {
        renderItem(item, i);
      }
    }
  });
});

// 使用示例
const MessageList = composable<{ messages: Message[] }>((ctx, { messages }) => {
  LazyColumn(ctx, {
    items: messages,
    itemCount: messages.length,
    itemSize: (index) => {
      const msg = messages[index];
      return msg.type === 'image' ? 300 : 80;
    },
    renderItem: (msg) => { MessageBubble(ctx, { message: msg }); },
    viewportSize: { width: window.innerWidth, height: window.innerHeight - 100 }
  });
});
```

#### 2. 智能缓存系统（Memoization Strategy）

**分层缓存架构**：

```typescript
// ===== Level 1: 组件级 memo (避免不必要的重组) =====

const ExpensiveComponent = composable<{ data: ComplexData }>((ctx, { data }) => {
  const processedData = remember(ctx, () => derivedStateOf(() => {
    return heavyComputation(data);
  }));

  Text(ctx, processedData.value.result, Modifier.create().freeze());
});

// ===== Level 2: 计算结果缓存 (useMemo) =====

const ShoppingCart = composable<{ items: Item[] }>((ctx, { items }) => {
  const subtotal = remember(ctx, () => derivedStateOf(() => calculateSubtotal(items)));
  const tax = remember(ctx, () => derivedStateOf(() => calculateTax(subtotal.value)));
  const total = remember(ctx, () => derivedStateOf(() => subtotal.value + tax.value));

  Column(ctx, Modifier.create().freeze(), 'spacedBy(4)', 'start', () => {
    Text(ctx, `小计: ¥${subtotal.value}`, Modifier.create().freeze());
    Text(ctx, `税费: ¥${tax.value}`, Modifier.create().freeze());
    Text(ctx, `总计: ¥${total.value}`, Modifier.create().freeze(), { fontWeight: 'bold' });
  });
});

// ===== Level 3: 布局缓存 (Layout Cache) =====

interface LayoutCacheEntry {
  key: string;
  constraints: LayoutConstraints;
  result: LayoutResult;
  timestamp: number;
}

class LayoutCache {
  private cache = new Map<string, LayoutCacheEntry>();
  private maxSize = 100;  // 最大缓存条目数
  private ttl = 5000;     // 缓存有效期（ms）
  
  get(key: string, constraints: LayoutConstraints): LayoutResult | null {
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    // 检查是否过期
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    // 检查约束条件是否匹配
    if (!this.constraintsMatch(entry.constraints, constraints)) {
      return null;
    }
    
    return entry.result;
  }
  
  set(key: string, constraints: LayoutConstraints, result: LayoutResult): void {
    // LRU 淘汰策略
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
    
    this.cache.set(key, {
      key,
      constraints,
      result,
      timestamp: Date.now()
    });
  }
  
  private constraintsMatch(a: LayoutConstraints, b: LayoutConstraints): boolean {
    return (
      a.maxWidth === b.maxWidth &&
      a.maxHeight === b.maxHeight &&
      a.minWidth === b.minWidth &&
      a.minHeight === b.minHeight
    );
  }
}
```

#### 3. 增量渲染与脏区域标记（Dirty Region Tracking）

```typescript
// ===== Hybrid Renderer 增量更新机制 =====

interface DirtyRegion {
  x: number;
  y: number;
  width: number;
  height: number;
  reason: 'state-change' | 'layout-change' | 'animation';
}

class IncrementalRenderer {
  private dirtyRegions: DirtyRegion[] = [];
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private offscreenCanvas: OffscreenCanvas;
  
  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.offscreenCanvas = new OffscreenCanvas(canvas.width, canvas.height);
  }
  
  // 标记脏区域
  markDirty(region: DirtyRegion): void {
    // 合并重叠的脏区域（减少绘制次数）
    this.dirtyRegions = mergeOverlappingRegions([
      ...this.dirtyRegions,
      region
    ]);
  }
  
  // 增量渲染（仅重绘脏区域）
  renderIncremental(layoutTree: LayoutNode): void {
    if (this.dirtyRegions.length === 0) return;  // 无需更新
    
    const ctx = this.offscreenCanvas.getContext('2d')!;
    
    for (const region of this.dirtyRegions) {
      // 1. 清除脏区域
      ctx.clearRect(region.x, region.y, region.width, region.height);
      
      // 2. 查找受影响的节点
      const affectedNodes = findNodesInRegion(layoutTree, region);
      
      // 3. 仅重绘受影响节点
      for (const node of affectedNodes) {
        this.drawNode(ctx, node);
      }
    }
    
    // 4. 将 OffscreenCanvas 内容复制到主 Canvas（原子操作）
    this.ctx.drawImage(this.offscreenCanvas, 0, 0);
    
    // 5. 清空脏区域列表
    this.dirtyRegions = [];
  }
  
  // 全量渲染（首次或强制刷新）
  renderFull(layoutTree: LayoutNode): void {
    this.drawNode(this.ctx, layoutTree);
    this.dirtyRegions = [];  // 清空所有待处理的脏区域
  }
}
```

#### 4. 批量状态更新（Batching）

```typescript
// ===== 自动批处理机制 =====

class StateUpdateBatcher {
  private pendingUpdates: Array<() => void> = [];
  private isFlushing = false;
  private scheduled = false;
  
  // 收集状态更新（不立即触发重组）
  batch(updateFn: () => void): void {
    this.pendingUpdates.push(updateFn);
    
    if (!this.scheduled) {
      this.scheduled = true;
      // 使用 requestAnimationFrame 或 microtask 延迟执行
      requestAnimationFrame(() => this.flush());
    }
  }
  
  // 批量执行所有更新
  private flush(): void {
    if (this.isFlushing) return;
    
    this.isFlushing = true;
    this.scheduled = false;
    
    try {
      // 一次性执行所有状态变更
      const updates = [...this.pendingUpdates];
      this.pendingUpdates = [];
      
      updates.forEach(update => update());
      
      // 触发一次重组（而非多次）
      triggerRecomposition();
    } finally {
      this.isFlushing = false;
    }
  }
}

// 使用示例
const BatchUpdateExample = composable<Record<string, never>>((ctx) => {
  const name = remember(ctx, () => mutableStateOf(''));
  const age = remember(ctx, () => mutableStateOf(0));
  const email = remember(ctx, () => mutableStateOf(''));

  const handleFormSubmit = () => {
    batch(() => {
      name.value = 'John Doe';
      age.value = 30;
      email.value = 'john@example.com';
    });
  };

  Form(ctx, { onSubmit: handleFormSubmit }, Modifier.create().freeze(), () => {});
});
```

#### 5. 图片懒加载与缓存

```typescript
// ===== 图片资源管理器 =====

interface ImageCacheEntry {
  blob: Blob;
  url: string;  // Object URL
  lastAccessed: number;
  size: number; // bytes
}

class ImageManager {
  private cache = new Map<string, ImageCacheEntry>();
  private maxCacheSize = 50 * 1024 * 1024;  // 50MB
  private currentCacheSize = 0;
  
  // 懒加载图片
  async loadImage(src: string, options?: {
    priority?: 'high' | 'low';
    placeholder?: string;
  }): Promise<HTMLImageElement> {
    // 1. 检查缓存
    const cached = this.cache.get(src);
    if (cached) {
      cached.lastAccessed = Date.now();
      return this.loadFromBlob(cached.blob);
    }
    
    // 2. 显示占位图（如果提供）
    if (options?.placeholder) {
      showPlaceholder(options.placeholder);
    }
    
    try {
      // 3. 根据 priority 决定加载策略
      const fetchInit: RequestInit = {};
      if (options?.priority === 'high') {
        fetchInit.priority = 'high';  // Fetch API Priority Hints
      }
      
      const response = await fetch(src, fetchInit);
      const blob = await response.blob();
      
      // 4. 写入缓存（LRU 淘汰）
      this.addToCache(src, blob);
      
      return this.loadFromBlob(blob);
    } catch (error) {
      throw new ImageLoadError(`Failed to load image: ${src}`, error);
    }
  }
  
  private addToCache(key: string, blob: Blob): void {
    // 如果超出容量，淘汰最久未使用的条目
    while (this.currentCacheSize + blob.size > this.maxCacheSize && this.cache.size > 0) {
      const lruKey = this.findLRUKey();
      const entry = this.cache.get(lruKey)!;
      URL.revokeObjectURL(entry.url);
      this.currentCacheSize -= entry.size;
      this.cache.delete(lruKey);
    }
    
    const url = URL.createObjectURL(blob);
    this.cache.set(key, {
      blob,
      url,
      lastAccessed: Date.now(),
      size: blob.size
    });
    this.currentCacheSize += blob.size;
  }
  
  private findLRUKey(): string {
    let lruKey = '';
    let oldestTime = Infinity;
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        lruKey = key;
      }
    }
    
    return lruKey;
  }
}
```

#### 6. 动画性能优化（requestAnimationFrame + GPU 加速）

```typescript
// ===== 高性能动画引擎 =====

interface AnimationConfig {
  duration: number;           // 持续时间（ms）
  easing: EasingFunction;     // 缓动函数
  onUpdate: (progress: number) => void;
  onComplete?: () => void;
  useGPU?: boolean;           // 是否使用 transform/opacity（GPU 加速）
}

class AnimationEngine {
  private activeAnimations = new Map<number, AnimationConfig>();
  private nextId = 0;
  
  animate(config: AnimationConfig): number {
    const id = this.nextId++;
    const startTime = performance.now();
    
    const step = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / config.duration, 1);
      const easedProgress = config.easing(progress);
      
      config.onUpdate(easedProgress);
      
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        config.onComplete?.();
        this.activeAnimations.delete(id);
      }
    };
    
    this.activeAnimations.set(id, config);
    requestAnimationFrame(step);
    
    return id;  // 返回动画 ID，可用于取消
  }
  
  cancel(animationId: number): void {
    this.activeAnimations.delete(animationId);
  }
  
  cancelAll(): void {
    this.activeAnimations.clear();
  }
}

// GPU 加速属性（仅使用这些属性可避免触发布局重绘）
const GPU_ACCELERATED_PROPERTIES = [
  'transform',      // translate/scale/rotate
  'opacity',        // 透明度
  'filter',         // 滤镜
  'clip-path'       // 裁剪路径
] as const;

// 使用示例
const FadeInAnimation = composable<{ visible: boolean }>((ctx, { visible }) => {
  const opacity = remember(ctx, () => createAnimatable(0));

  sideEffect(ctx.composerContext, () => {
    if (visible) {
      opacity.animateTo(1, { duration: 300, easing: Easing.easeOut });
    } else {
      opacity.animateTo(0, { duration: 300, easing: Easing.easeOut });
    }
  });

  Box(ctx, () => {
    Content(ctx);
  }, Modifier.create().opacity(opacity.value).freeze());
});
```

## 正面影响

1. **性能指标全面提升**：
   - 长列表内存占用降低 **90%+**（从 10,000 节点降至 ~30 个可视节点）
   - 首屏渲染速度提升 **40-60%**（通过代码分割和懒加载）
   - 滚动帧率稳定在 **60 FPS**（虚拟化 + 增量渲染）
   - 状态更新响应时间 < **16ms**（批量更新 + 细粒度依赖追踪）

2. **用户体验流畅**：
   - 页面切换无白屏闪烁（预加载 + Skeleton）
   - 列表滚动丝滑（固定帧率 + 虚拟化）
   - 动画过渡自然（GPU 加速 + rAF 调度）
   - 图片渐进式加载（模糊占位 → 清晰原图）

3. **开发效率提升**：
   - 内置 Hook 封装常用优化模式（`useMemo`, `useVirtualizer`）
   - 自动批量处理减少手动优化需求
   - DevTools Performance 面板可视化性能瓶颈

4. **资源利用率优化**：
   - 内存占用可控（LRU 缓存淘汰 + 虚拟化）
   - CPU/GPU 负载均衡（离屏 Canvas + Worker 卸载）
   - 网络带宽节省（图片懒加载 + 响应式图片）

## 负面影响与风险

| 风险 | 影响 | 缓解措施 |
|------|------|---------|
| 实现复杂度高 | 虚拟化和增量渲染需要 ~2000 行核心代码 | 分阶段实施；先实现 MVP |
| 调试难度增加 | 缓存命中/失效逻辑不易排查 | 提供 DevTools Cache Inspector |
| 预估尺寸不准确 | 动态高度列表可能出现滚动跳动 | 使用 ResizeObserver 动态修正；预留缓冲区 |
| 过度优化 | 简单页面引入不必要的复杂性 | 提供性能基线工具；仅在必要时启用高级优化 |
| 兼容性问题 | OffscreenCanvas 在旧浏览器不支持 | Graceful degradation；降级为普通 Canvas |

## 性能基准测试目标

| 场景 | 指标 | 目标值 | 测试方法 |
|------|------|--------|---------|
| 长列表（10,000 项） | 平均帧时间 | < 16.67ms (60fps) | Chrome Performance Panel |
| 首屏渲染 | FCP | < 1000ms | Lighthouse CI |
| 状态更新（100 次/s） | 重组耗时 | < 5ms | Custom Benchmark |
| 图片加载（100 张） | 内存峰值 | < 200MB | Chrome Memory Panel |
| 动画（同时 20 个） | 掉帧率 | < 2% | Frame Rate Counter |

## 与其他方案的对比

| 维度 | **虚拟化 + 缓存 + 增量渲染 ✅** | 仅虚拟化 | 仅缓存 | Web Worker |
|------|-------------------------------|---------|-------|------------|
| 长列表性能 | ⭐⭐⭐⭐⭐ 最佳 | ⭐⭐⭐⭐ 良好 | ⭐ 差 | ⭐⭐ 一般 |
| 状态更新性能 | ⭐⭐⭐⭐⭐ 最佳 | ⭐⭐ 差 | ⭐⭐⭐⭐ 良好 | ⭐⭐⭐ 中等 |
| 首屏加载速度 | ⭐⭐⭐⭐⭐ 最佳 | ⭐⭐⭐ 中等 | ⭐⭐⭐⭐ 良好 | ⭐⭐ 较差 |
| 实现复杂度 | ⭐⭐ 高 | ⭐⭐⭐ 中等 | ⭐ 极低 | ⭐⭐⭐⭐ 较高 |
| 适用场景广度 | ⭐⭐⭐⭐⭐ 最广 | ⭐⭐ 仅列表 | ⭐⭐⭐ 计算密集型 | ⭐⭐ CPU 密集型 |
| 移动端兼容性 | ✅✅ 完美 | ✅✅ 完美 | ✅✅ 完全 | ⚠️ 部分限制 |

## 验证假设

### 前提条件
1. 虚拟化滚动在 100,000 条数据时仍保持 60 FPS
2. 布局缓存的命中率 > 80%（典型场景）
3. 增量渲染比全量渲染快 5x 以上（当脏区域 < 30% 时）
4. OffscreenCanvas 在主流浏览器中性能优于主线程 Canvas

### 验证方式
- [ ] **Spike #1**: 实现 LazyColumn MVP 并测试 10K/100K 列表性能
- [ ] **Spike #2**: 对比有无布局缓存的表格渲染性能差异
- [ ] **Spike #3**: 测量不同脏区域占比下增量 vs 全量渲染的速度对比
- [ ] **Spike #4**: 在低端 Android 设备上验证整体性能表现

## 可逆性评估

**类别**: 🟡 **部分可逆**

| 指标 | 数值 |
|------|------|
| 影响文件数 | ~20 文件（core/virtualizer/, core/cache/, core/renderer/, hooks/） |
| 影响模块数 | 3-4 模块（performance, renderer, components） |
| 数据迁移 | 无（新代码） |
| API 变更风险 | 低（公共 API 是 Hook 函数，内部实现灵活） |

**回退方案**：
- 如果虚拟化在某些场景下不稳定 → 提供开关允许退化为普通列表
- 回退策略：`LazyColumn` 内部检测到性能问题时自动降级为普通 `Column`
- 工作量：~2 天实现降级逻辑 + 监控告警

## 实现约束（来自架构决策）

1. **虚拟化必须支持动态高度**：不能假设所有列表项等高（需支持文本换行、图片等变高场景）
2. **缓存必须有容量上限和淘汰策略**：防止内存泄漏（LRU + TTL）
3. **增量渲染必须保证视觉一致性**：不能出现闪烁、撕裂等问题（双缓冲）
4. **批量更新的延迟 < 1 帧**：不能让用户感知到状态更新延迟（16ms 内执行）
5. **动画必须使用 GPU 加速属性**：禁止在动画循环中修改会触发布局重绘的属性（width/height/margin 等）
6. **性能监控必须内置**：关键路径必须有 Performance Mark/Measure，支持线上采集

## 性能优化检查清单

### ✅ 必须实现的优化

- [ ] **P0 (必需)**: LazyColumn/LazyRow 虚拟滚动组件
- [ ] **P0 (必需)**: useMemo/useCallback/useMemoized Hook
- [ ] **P0 (必需)**: 自动批量状态更新（batch）
- [ ] **P0 (必需)**: 增量渲染（Dirty Region Tracking）
- [ ] **P1 (重要)**: 图片懒加载 + LRU 缓存
- [ ] **P1 (重要)**: 代码分割 + 路由级懒加载
- [ ] **P1 (重要)**: 布局结果缓存（Layout Cache）
- [ ] **P2 (推荐)**: Web Worker 卸载重型计算
- [ ] **P2 (推荐)**: Service Worker 缓存静态资源
- [ ] **P2 (推荐)**: 预加载关键资源（Prefetch）

### ❌ 禁止的反模式

```typescript
// 反模式 1: 在渲染路径中创建新对象/数组（破坏引用相等性）
const BadComponent = composable<{ items: Item[] }>((ctx, { items }) => {
  Column(ctx, Modifier.create().freeze(), 'spacedBy(4)', 'start', () => {
    items.forEach(item => {
      Child(ctx, item, { color: 'red', size: 10 });
    });
  });
});

// 正确做法：提取到外部稳定引用
const defaultOptions = { color: 'red', size: 10 };

const GoodComponent = composable<{ items: Item[] }>((ctx, { items }) => {
  Column(ctx, Modifier.create().freeze(), 'spacedBy(4)', 'start', () => {
    items.forEach(item => {
      Child(ctx, item, defaultOptions);
    });
  });
});

// 反模式 2: 内联函数定义（破坏引用相等性）
const BadEventHandling = composable<Record<string, never>>((ctx) => {
  Button(ctx, 'Click', () => { console.log('clicked'); }, Modifier.create().freeze());
});

// 正确做法：提取到外部稳定引用
const handleClick = () => {
  console.log('clicked');
};

const GoodEventHandling = composable<Record<string, never>>((ctx) => {
  Button(ctx, 'Click', handleClick, Modifier.create().freeze());
});
```

## 分阶段实施路线图

| 阶段 | 实现内容 | 目标 | 预计工作量 |
|------|---------|------|-----------|
| **Phase 1 (MVP)** | useMemo/useCallback + 自动批处理 + 基础性能监控 | 状态更新性能达标 | 3-4 天 |
| **Phase 2** | LazyColumn/LazyRow 固定高度虚拟化 + 图片懒加载 | 长列表性能达标 | 4-5 天 |
| **Phase 3** | 动态高度虚拟化 + 布局缓存 + 增量渲染 | 复杂页面性能优化 | 5-7 天 |
| **Phase 4** | 代码分割 + 路由懒加载 + 资源预加载 | 首屏加载速度优化 | 3-4 天 |
| **Phase 5** | Web Worker 集成 + OffscreenCanvas + GPU 动画引擎 | 极致性能调优 | 5-7 天 |

## 相关文档

- 上游 ADR:
  - [`rendering-architecture-hybrid-mode.md`](./rendering-architecture-hybrid-mode.md)
  - [`layout-engine-custom-linear-column-row.md`](./layout-engine-custom-linear-column-row.md)
  - [`reactive-state-snapshot-context-based.md`](./reactive-state-snapshot-context-based.md)
  - [`data-flow-management-unidirectional-pattern.md`](./data-flow-management-unidirectional-pattern.md)
- 下游依赖:
  - [`testing-strategy-unit-integration-e2e.md`](./testing-strategy-unit-integration-e2e.md) （性能测试用例）
- 需求文档: [`canvas-ui-runtime.md`](../road-map/canvas-ui-runtime.md)

## 决策记录

| 时间 | 决策者 | 决策内容 |
|------|--------|---------|
| 2026-04-30 18:25 | 用户 + AI | 确认采用虚拟化 + 智能缓存 + 增量渲染的多层次性能优化体系 |
