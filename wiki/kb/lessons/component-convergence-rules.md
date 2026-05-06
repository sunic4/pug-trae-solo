---
title: "组件收敛决策规则 — 何时合并/删除"
type: knowledge
status: verified
category: lesson
source: "cc-fix - 2026-05-02"
see_also: ["content-slot-component", "component-convergence-lesson"]
created: "2026-05-02T10:30"
updated: "2026-05-02T10:30"
---

# 组件收敛决策规则

## 一句话总结

当两个组件的 MeasurePolicy + Modifier 构建逻辑 + 回调语义高度重叠时，应合并为一个，通过参数或 children 组合区分变体。

## 先错后对

### ❌ 错误做法：为每种 UI 变体创建独立组件

快速迭代中组件数量膨胀到 31 个，出现以下重复：

| 被删除组件 | 合并到 | 重叠原因 |
|-----------|--------|---------|
| IconButton | Button | 都是 clickable + background + content |
| RadioButton | Checkbox | 都是 boolean toggle + ConstrainedMeasurePolicy(24,24) |
| Switch | Checkbox | 都是 boolean toggle + clickable + background |

**后果**：
- 3 个 boolean toggle 组件（Checkbox, Switch, RadioButton）— 功能等价
- 2 个图标按钮组件（IconButton, FAB）— 结构相同
- 大量镜像代码和重复测试
- 公共 API 表面积过大，学习成本高

### ✅ 正确做法：用决策矩阵指导收敛

```
问自己以下问题：

1. 两者的 MeasurePolicy 是否相同或可参数化？
   → 是 → 继续判断
   → 否 → 可能确实需要独立组件

2. 两者的 Modifier 构建逻辑是否相同？
   → 是 → 继续判断
   → 否 → 检查是否只是默认值不同

3. 核心交互语义是否相同？
   → 是（都是 toggle/click/navigate）→ **合并**
   → 否（一个是选择器，一个是导航触发器）→ **保留**

4. 区别仅在于视觉样式？
   → 通过 modifier 参数 / 默认值区分 → **合并**
   → 需要完全不同的渲染逻辑 → **保留**
```

## 具体规则

| 规则 | 条件 | 动作 | 示例 |
|------|------|------|------|
| **R1: 内容参数化** | A 的专用字符串参数可被 B 的 children 替代 | 删除 A，B 增加 children | IconButton → `Button(children:[Text(icon)])` |
| **R2: 功能等价** | A 和 B 做同一件事，仅视觉微调 | 保留更通用者 | Switch → Checkbox（都是 toggle） |
| **R3: 无容器支撑** | 选择类组件缺少 Group 容器 | 直接删除 | RadioButton（无 RadioGroup） |
| **R4: 策略复用** | MeasurePolicy 逻辑与已有策略 >80% 相同 | 复用共享策略 | Popup → BoxAlignmentMeasurePolicy |

## 本次收敛结果

```
31 个组件 → 28 个组件 (-9%)
删除: IconButton, RadioButton, Switch (3 个)
改造: Button(label→children), FAB(icon→children) (2 个)
简化: Popup(内联策略→共享) (1 个)
验证: typecheck 零错误, 705 测试全通过
```

## 为什么这样做（5 Whys）

1. **为什么会有这么多重复组件？** → 快速迭代时每个 UI 变体都新建了组件
2. **为什么不早发现？** → 缺乏统一的组件审计标准和收敛决策规则
3. **为什么需要规则？** → "感觉重复"是主观的，需要客观的判断矩阵
4. **为什么选这 4 条规则？** → 覆盖了 MeasurePolicy、Modifier、语义、策略 4 个维度
5. **根因**：缺乏 Composition-over-Inheritance 的设计原则作为新增组件的前置检查

## 预防措施

新增组件前强制检查清单：

```typescript
// 新建组件 X 前回答：
// 1. 现有组件能否通过 children/modifier 参数实现相同效果？
// 2. X 的 MeasurePolicy 是否与 shared/measure-policies.ts 中某个策略相同？
// 3. X 是否只是一个现有组件的"预设默认值"变体？（如果是 → 用工厂函数而非新组件）
```
