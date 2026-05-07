---
id: "layout-engine-custom-linear-column-row"
type: architecture
status: accepted
title: "布局引擎 — 自研简化线性布局 (Column/Row, 无 Flexbox)"
depends_on:
  - "../road-map/canvas-ui-runtime.md"
  - "./rendering-architecture-hybrid-mode.md"
created: "2026-04-30 17:00"
updated: "2026-04-30 17:05"
stale: false
---

# ADR: 布局引擎 — 自研简化线性布局 (Column/Row)

## 背景

在确定使用 Hybrid 渲染架构后，需要选择布局引擎来计算 UI 元素的位置和尺寸：

> **如何以最简单高效的方式实现 UI 元素的排列和定位？**

传统方案包括：
- **Yoga/Taffy (WASM)**：完整的 W3C Flexbox 引擎（成熟但重量级）
- **CSS Layout API**：浏览器原生支持（功能受限）

但本项目有以下特殊约束：
1. **零外部依赖优先**（已决定自研 Snapshot 和渲染器）
2. **移动端性能敏感**（WASM 加载有延迟）
3. **API 简洁性要求**（不想引入 Flexbox 复杂概念）
4. **与 Compose 体验一致**（Column/Row 声明式风格）

## 决策结果

选择 **自研简化线性布局引擎**，核心设计为：

```
┌─ Column（垂直排列）───────────────┐
│  ┌─────┐                         │
│  │ Child1 │                      │ ← 从上到下
│  ├─────┤                         │
│  │ Child2 │                      │
│  ├─────┤                         │
│  │ Child3 │                      │ ← 底部对齐
│  └─────┘                         │
└───────────────────────────────────┘

┌─ Row（水平排列）─────────────────┐
│ [Child1] [Child2] [Child3]       │ ← 从左到右
└───────────────────────────────────┘
```

### 核心约束

❌ **禁止使用 W3C Flexbox 规范**
❌ **禁止使用 `display: flex` / flex-grow / flex-shrink 等概念**
✅ **仅提供 Column / Row 两种线性布局容器**
✅ **通过 Modifier 实现高级布局控制**

### 公共 API 设计

```typescript
// ===== 基础布局组件 =====

function Column(
  ctx: CompositionContext,
  modifier?: ReadonlyModifier,
  arrangement?: Arrangement,
  alignment?: Alignment,
  childrenFn?: () => void,
): void;

function Row(
  ctx: CompositionContext,
  modifier?: ReadonlyModifier,
  arrangement?: Arrangement,
  alignment?: Alignment,
  childrenFn?: () => void,
): void;

// ===== 使用示例 =====

const MyApp = composable<Record<string, never>>((ctx) => {
  Column(ctx, Modifier.create().fillMaxSize().padding(16).freeze(), 'spacedBy(10)', 'center', () => {
    Text(ctx, 'Title', Modifier.create().freeze(), { fontSize: 24 });

    Row(ctx, Modifier.create().fillMaxWidth().freeze(), 'spaceBetween', 'center', () => {
      Button(ctx, 'Cancel', () => {});
      Button(ctx, 'OK', () => {}, Modifier.create().primary().freeze());
    });
  });
});
```

### 核心数据结构与算法

```typescript
// ===== 布局约束系统 =====

interface Constraints {
  minWidth: number;
  maxWidth: number;
  minHeight: number;
  maxHeight: number;
  
  static loose(maxWidth: number, maxHeight: number): Constraints;
  static tight(width: number, height: number): Constraints;
  static unconstrained(): Constraints;
}

interface MeasureResult {
  width: number;
  height: number;
  alignmentLines?: Map<string, number>;
}

interface Placeable {
  measureResult: MeasureResult;
  position: { x: number; y: number };
  
  place(relativePosition: { x: number; y: number }): void;
}

// ===== 线性布局算法（简化版） =====

class LinearMeasurePolicy implements MeasurePolicy {
  constructor(
    private orientation: 'horizontal' | 'vertical',
    private arrangement: Arrangement,
    private alignment: Alignment,
    private crossAxisSize: SizeMode // fixed | wrap | fill
  ) {}
  
  measure(
    measurables: Measurable[],
    constraints: Constraints
  ): MeasureResult {
    
    const isHorizontal = this.orientation === 'horizontal';
    
    // 1. 测量所有子节点
    const placeables = measurables.map(m => m.measure(constraints));
    
    // 2. 计算主轴总尺寸
    const mainAxisTotal = placeables.reduce((sum, p) =>
      sum + (isHorizontal ? p.measureResult.width : p.measureResult.height),
      0
    );
    
    // 3. 计算交叉轴最大尺寸
    const crossAxisMax = Math.max(...placeables.map(p =>
      isHorizontal ? p.measureResult.height : p.measureResult.width
    ));
    
    // 4. 应用 Arrangement（分配间距）
    const positions = this.arrange(
      placeables,
      mainAxisTotal,
      isHorizontal ? constraints.maxWidth : constraints.maxHeight
    );
    
    // 5. 应用 Alignment（交叉轴对齐）
    this.align(placeables, positions, crossAxisMax);
    
    return {
      width: isHorizontal ? mainAxisTotal : crossAxisMax,
      height: isHorizontal ? crossAxisMax : mainAxisTotal
    };
  }
  
  private arrange(
    placeables: Placeable[],
    totalMainSize: number,
    availableSpace: number
  ): number[] {
    switch (this.arrangement) {
      case Arrangement.Start:
        return this.arrangeStart(placeables);
      
      case Arrangement.Center:
        return this.arrangeCenter(placeables, totalMainSize, availableSpace);
      
      case Arrangement.End:
        return this.arrangeEnd(placeables, totalMainSize, availableSpace);
      
      case Arrangement.SpaceEvenly:
        return this.arrangeSpaceEvenly(placeables, availableSpace);
      
      case Arrangement.SpaceBetween:
        return this.arrangeSpaceBetween(placeables, availableSpace);
      
      case Arrangement.spacedBy(gap):
        return this.arrangeSpacedBy(placeables, gap);
    }
  }
}
```

### Modifier 对布局的控制

```typescript
// ===== Modifier 链中的布局相关修饰符 =====

const Modifier = {
  // 尺寸控制
  size: (width: Dp, height: Dp) => new SizeModifier(width, height),
  width: (width: Dp) => new WidthModifier(width),
  height: (height: Dp) => new HeightModifier(height),
  fillMaxSize: () => new FillMaxSizeModifier(),
  fillMaxWidth: () => new FillMaxWidthModifier(),
  fillMaxHeight: () => new FillMaxHeightModifier(),
  wrapContentSize: () => new WrapContentSizeModifier(),
  
  // 内外边距
  padding: (padding: PaddingValues) => new PaddingModifier(padding),
  paddingAll: (dp: Dp) => new PaddingModifier(PaddingValues.all(dp)),
  
  // 偏移与定位
  offset: (x: Dp, y: Dp) => new OffsetModifier(x, y),
  absoluteOffset: (x: Dp, y: Dp) => new AbsoluteOffsetModifier(x, y),
  
  // 权重（在线性布局中分配剩余空间）
  weight: (weight: Float, fill: boolean = true) => new WeightModifier(weight, fill),
  
  // 对齐（在父容器中）
  align: (alignment: Alignment) => new AlignModifier(alignment),
};

// ===== 使用权重示例 =====

Column(ctx, Modifier.create().freeze(), 'spacedBy(8)', 'start', () => {
  Text(ctx, 'Header', Modifier.create().height(56).fillMaxWidth().freeze());

  Box(ctx, () => {
  }, Modifier.create().weight(1).fillMaxWidth().freeze());

  Text(ctx, 'Footer', Modifier.create().height(48).fillMaxWidth().freeze());
});
```

## 正面影响

1. **API 极简**：
   - 仅需理解 Column/Row + Modifier 即可完成 90% 布局
   - 无需学习 Flexbox 复杂概念（flex-grow/shrink/basis/wrap 等）
   - 与 Android Compose 体验 100% 一致

2. **零外部依赖**：
   - 纯 TypeScript 实现，无 WASM 加载延迟
   - 包体积 < 15KB gzipped（vs Yoga WASM ~60KB）
   - 调试友好，断点直接命中业务代码

3. **完全可控**：
   - 可针对 Canvas 场景深度优化（如 Dp 单位、密度缩放）
   - 可轻松扩展新布局类型（Grid、StaggeredFlow 等）
   - 可集成自定义测量逻辑（文本换行、图片 intrinsic size）

4. **性能可预测**：
   - 算法复杂度 O(n)（n = 子节点数）
   - 无正则表达式或复杂解析
   - 易于分析和优化热点路径

5. **与 Hybrid Renderer 完美配合**：
   - LayoutNode 可直接复用为渲染节点
   - dirty 标记自然传递到布局层
   - 无需额外的数据转换层

## 负面影响与风险

| 风险 | 影响 | 缓解措施 |
|------|------|---------|
| 功能子集有限 | 不支持复杂 Flexbox 特性（wrap、align-self、order） | 通过 Modifier + 组合解决大部分需求；未来可扩展 |
| 边界情况处理 | 需要自行实现所有边缘情况的布局行为 | 参考 W3C 规范编写测试用例；参考 Compose 源码 |
| 开发成本中等 | 预计 800-1200 行核心代码 | 分阶段实现：先 MVP（基本排列），再增强（对齐/权重） |
| 社区经验少 | 无法借鉴现有 Flexbox 库的 Bug 修复 | 充分测试；参考 Compose Layout 的实现 |
| 不符合 Web 标准 | 开发者如果熟悉 CSS 可能需要适应期 | 提供迁移指南；API 设计直觉化 |

## 功能覆盖度分析

| 布局需求 | Flexbox 方案 | **本方案 (Column/Row)** | 解决方式 |
|---------|-------------|------------------------|---------|
| 垂直排列 | ✅ flex-direction: column | ✅ `Column{}` | 原生支持 |
| 水平排列 | ✅ flex-direction: row | ✅ `Row{}` | 原生支持 |
| 等分空间 | ✅ flex-grow: 1 | ✅ `Modifier.weight(1f)` | 权重修饰符 |
| 居中对齐 | ✅ justify-content/align-items | ✅ `Arrangement.Center` | 排列参数 |
| 间距均匀 | ✅ gap / space-between | ✅ `Arrangement.spacedBy(10)` | 排列参数 |
| 固定尺寸 | ✅ width/height | ✅ `Modifier.size(100.dp, 50.dp)` | 尺寸修饰符 |
| 内边距 | ✅ padding | ✅ `Modifier.padding(16.dp)` | padding 修饰符 |
| 绝对偏移 | ✅ position: absolute | ✅ `Modifier.offset(10.dp, 20.dp)` | 偏移修饰符 |
| 自动换行 | ✅ flex-wrap: wrap | ⚠️ 不原生支持 | 可扩展 FlowRow 组件 |
| 自对齐 | ✅ align-self | ⚠️ 有限支持 | `Modifier.align()` |
| 嵌套布局 | ✅ 支持 | ✅ 支持 | Column/Row 可任意嵌套 |

**结论**：可覆盖 **90%+** 的常见移动端 UI 布局需求。

## 验证假设

### 前提条件
1. 大部分移动端 UI 可通过 Column/Row 嵌套表达（无需 Flexbox 高级特性）
2. 简化算法在 1000 个子节点时仍 < 5ms
3. Modifier 链式调用不会成为性能瓶颈（< 0.01ms/次）
4. 开发者可在 1 小时内掌握 Column/Row + Modifier API

### 验证方式
- [ ] **Spike #1**: 实现 Column/Row MVP + 基准性能测试
  - 场景：10/100/1000 个子节点
  - 指标：布局计算时间、内存占用
- [ ] **Spike #2**: 复刻 10 个常见移动端界面（设置页、聊天列表、商品详情等）
  - 验证：是否所有界面都可用 Column/Row 表达
  - 记录：无法表达的场景及占比
- [ ] **Spike #3**: Modifier 链性能测试
  - 测试：1-20 个 Modifier 链式组合的开销

## 可逆性评估

**类别**: 🟢 **高度可逆**

| 指标 | 数值 |
|------|------|
| 影响文件数 | ~6 文件（layout/column.ts, layout/row.ts, layout/modifier.ts 等） |
| 影响模块数 | 1 个模块（layout） |
| 数据迁移 | 无（新代码） |
| API 变更风险 | 低（公共 API 是 Column/Row 函数，内部实现可替换） |

**回退方案**：
- 如果发现功能不足 → 渐进式引入 Yoga WASM 作为可选后端
- 回退策略：保留 Column/Row API，内部实现切换为 Yoga 调用
- 工作量：~3 天适配层开发
- 用户代码无需修改

## 实现约束（来自架构决策）

1. **禁止 W3C Flexbox 术语**：API 中不允许出现 `flex-grow`、`flex-shrink`、`flex-basis`、`align-self` 等词汇
2. **必须使用 Dp 单位**：所有尺寸参数使用 `Dp`（密度无关像素），内部转换为物理像素
3. **Constraints 不可违反**：子节点必须尊重父节点传递的 Constraints（不能超出 maxWidth/maxHeight）
4. **Modifier 执行顺序**：从外到内（left-to-right 在链中表现为 right-to-left 执行）
5. **测量幂等性**：相同输入必须产生相同输出（便于 Skip 机制）
6. **IntrinsicSize 支持**：必须支持 min/max intrinsic width/height 计算（用于嵌套滚动场景）

## 分阶段实现路线图

| 阶段 | 实现内容 | 目标 | 预计工作量 |
|------|---------|------|-----------|
| **Phase 1 (MVP)** | 基本 Column/Row + size/padding/offset Modifier | 能排列元素 | 2-3 天 |
| **Phase 2** | Arrangement（居中/两端对齐/均匀分布）+ Alignment | 常见布局需求 | 2 天 |
| **Phase 3** | weight Modifier + fillMaxSize/fillMaxWidth | 弹性空间分配 | 1-2 天 |
| **Phase 4** | IntrinsicSize + 嵌套滚动支持 + Spacer | 复杂场景 | 2-3 天 |
| **Phase 5 (可选)** | FlowRow（自动换行）+ ConstraintLayout（相对定位） | 补充高级特性 | 3-4 天 |

## 相关文档

- 上游 ADR: [`rendering-architecture-hybrid-mode.md`](./rendering-architecture-hybrid-mode.md)
- 需求文档: [`canvas-ui-runtime.md`](../road-map/canvas-ui-runtime.md)
- Spike 计划: `linear-layout-spike.md` (待创建)

## 决策记录

| 时间 | 决策者 | 决策内容 |
|------|--------|---------|
| 2026-04-30 17:05 | 用户 + AI | 确认采用自研简化线性布局（Column/Row），禁止 W3C Flexbox，通过 Modifier 控制布局细节 |
