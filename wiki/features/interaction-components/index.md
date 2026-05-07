---
id: "feat-19"
type: feature
status: done
title: "交互组件库 (Button/Slider/Checkbox/TextField/FAB) — L0+L1 交互组件"
origin_type: req
depends_on: ["feat-11", "feat-12", "feat-18"]
created: "2026-05-01 18:03"
updated: "2026-05-07 00:00"
stale: false
---

# feat-19: 交互组件库 (Button/Slider/Checkbox/TextField/FAB)

## 实现思路概述

基于手势识别器、焦点管理和 L0 基础组件，实现交互组件。

**Emit-based 交互组件特征**：
- ctx-first 参数：`fn(ctx: CompositionContext, ...props): void`
- 返回 void，通过 `ctx.emitLeaf()` 发射节点
- 集成 clickable/draggable 等 Gesture Modifier
- Button/FAB 为 L1 组合组件（内部组合 Surface + Text）

### 组件签名（实际 API）

```typescript
function Button(
  ctx: CompositionContext,
  text: string,
  onClick: () => void,
  modifier?: ReadonlyModifier,
  options?: ButtonOptions,
): void;

function FAB(
  ctx: CompositionContext,
  onClick: () => void,
  modifier?: ReadonlyModifier,
  options?: FABOptions,
): void;

function Slider(
  ctx: CompositionContext,
  value: number,
  onValueChange: (value: number) => void,
  modifier?: ReadonlyModifier,
  options?: SliderOptions,
): void;

function Checkbox(
  ctx: CompositionContext,
  checked: boolean,
  onCheckedChange: (checked: boolean) => void,
  modifier?: ReadonlyModifier,
  options?: CheckboxOptions,
): void;

function TextField(
  ctx: CompositionContext,
  value: string,
  onValueChange: (value: string) => void,
  modifier?: ReadonlyModifier,
  placeholder?: string,
  singleLine?: boolean,
  textStyle?: TextStyle,
  backgroundColor?: Color,
  cursorColor?: Color,
): void;
```

### 使用示例

```typescript
setContent(canvas, (rootCtx) => {
  const text = remember(rootCtx, () => mutableStateOf(''));
  const checked = remember(rootCtx, () => mutableStateOf(false));
  const sliderValue = remember(rootCtx, () => mutableStateOf(0.5));

  Column(rootCtx, Modifier.create().padding(16).freeze(), 'spacedBy(12)', 'start', () => {

    TextField(rootCtx, text.value, (v) => { text.value = v; },
      Modifier.create().fillMaxWidth().freeze(), 'Enter text...');

    Checkbox(rootCtx, checked.value, (v) => { checked.value = v; });

    Slider(rootCtx, sliderValue.value, (v) => { sliderValue.value = v; },
      Modifier.create().fillMaxWidth().freeze());

    Button(rootCtx, 'Submit', () => console.log('submit'),
      Modifier.create().fillMaxWidth().freeze());

    FAB(rootCtx, () => console.log('add'),
      Modifier.create().size(56, 56).freeze());
  });
});
```

## 文件变更清单

| 操作 | 文件路径 | 说明 |
|------|---------|------|
| 新建 | `src/components/interaction/button.ts` | Button 组件 |
| 新建 | `src/components/interaction/fab.ts` | FAB 组件 |
| 新建 | `src/components/interaction/slider.ts` | Slider 组件 |
| 新建 | `src/components/interaction/checkbox.ts` | Checkbox 组件 |
| 新建 | `src/components/interaction/text-field.ts` | TextField 组件 |
| 新建 | `src/components/interaction/index.ts` | 交互组件导出 |
| 新建 | `src/components/__tests__/interaction-components.test.ts` | 交互组件 单元测试 |
| 修改 | `src/index.ts` | 顶层导出更新 |

## DoD 验收标准

- [x] 构建零错误
- [x] 类型检查零 error
- [x] 单元测试 100% 通过
- [x] 所有组件签名：ctx-first + void 返回
- [x] Button 正确响应点击（clickable Modifier）
- [x] Slider 正确映射拖拽到值范围
- [x] Checkbox 正确切换状态
- [x] TextField 正确处理输入
- [x] FAB 正确响应点击 + 圆形裁剪
- [x] impl-checklist.yaml 所有条目 = done
