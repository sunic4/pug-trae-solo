---
id: "modifier-chain-builder-freeze-pattern"
type: architecture
status: accepted
title: "Modifier 链 — Builder + Freeze 混合模式"
depends_on:
  - "../road-map/canvas-ui-runtime.md"
  - "./component-model-pure-function-call-chain.md"
created: "2026-04-30 17:20"
updated: "2026-04-30 17:22"
stale: false
---

# ADR: Modifier 链 — Builder + Freeze 混合模式

## 背景

在确定纯函数调用链组件模型后，需要设计 Modifier 系统的内部数据结构：

> **如何高效地组合多个 Modifier 元素？如何平衡性能与内存安全？**

## 决策结果

选择 **Builder + Freeze 混合模式**：
- 构建阶段使用可变数组（O(1) append）
- 构建完成后 `freeze()` 冻结为只读
- 运行时安全共享冻结后的 Modifier

### 核心实现

```typescript
class Modifier {
  private elements: Modifier.Element[] = [];
  private frozen = false;

  static create(): Modifier { return new Modifier(); }

  then(element: Modifier.Element): this {
    if (this.frozen) throw new Error('Modifier is frozen');
    this.elements.push(element);
    return this;
  }

  // 常用快捷方法
  padding(all: Dp): this { return this.then(PaddingElement(all)); }
  width(dp: Dp): this { return this.then(WidthElement(dp)); }
  fillMaxSize(): this { return this.then(FillMaxSizeElement()); }
  background(color: Color): this { return this.then(BackgroundElement(color)); }
  clickable(onClick: () => void): this { return this.then(ClickableElement(onClick)); }

  freeze(): ReadonlyModifier {
    this.frozen = true;
    Object.freeze(this.elements);
    return this as ReadonlyModifier;
  }

  get size(): number { return this.elements.length; }
  get(index: number): Modifier.Element { return this.elements[index]; }
}

interface ReadonlyModifier {
  readonly size: number;
  get(index: number): Modifier.Element;
}
```

### 使用规范

```typescript
// ✅ 正确用法
const modifier = Modifier.create()
  .padding(16.dp)
  .fillMaxWidth()
  .background(Color.Blue)
  .freeze();

// ❌ 错误用法（忘记 freeze）
const bad = Modifier.create().padding(8.dp); // 可变，不安全
```

## 正面影响

1. **性能最优**：数组连续内存，O(1) append，O(n) 遍历
2. **GC 压力低**：单数组对象 vs 链表多节点
3. **运行时安全**：freeze 后不可变，可自由共享引用
4. **调试友好**：开发模式可检测非法修改

## 实现约束

1. **必须调用 freeze()**：组件接收的 Modifier 必须是 ReadonlyModifier
2. **元素顺序重要**：从外到内执行（padding 先于 background）
3. **元素类型完整**：Layout / Draw / Input / Animation 四大类

## 可逆性评估

🟢 **完全可逆** (~3 文件，~200 行代码)

## 决策记录

| 时间 | 决策者 | 决策内容 |
|------|--------|---------|
| 2026-04-30 17:22 | 用户 + AI | 采用 Builder+Freeze 混合模式 |
