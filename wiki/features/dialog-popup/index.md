---
id: "feat-20"
type: feature
status: done
title: "弹窗组件 (Dialog/ModalBottomSheet/DropdownMenu/Popup) — L1 覆盖层组件"
origin_type: req
depends_on: ["feat-18", "feat-11"]
created: "2026-05-01 18:45"
updated: "2026-05-07 00:00"
stale: false
---

# feat-20: 弹窗组件 (Dialog/ModalBottomSheet/DropdownMenu/Popup)

## 实现思路概述

基于 L0 组件和手势系统，实现 L1 层弹窗/覆盖层组件。

**Emit-based 弹窗组件特征**：
- ctx-first 参数：`fn(ctx: CompositionContext, ...props): void`
- 返回 void，通过 `ctx.startGroup()` / `ctx.endGroup()` 发射容器节点
- 内部组合 Surface（半透明背景）+ content + buttons

### 组件签名（实际 API）

```typescript
function Dialog(
  ctx: CompositionContext,
  onDismissRequest: () => void,
  content?: () => void,
  options?: DialogOptions,
): void;

function ModalBottomSheet(
  ctx: CompositionContext,
  onDismissRequest: () => void,
  content?: () => void,
  options?: ModalBottomSheetOptions,
): void;

function DropdownMenu(
  ctx: CompositionContext,
  expanded: boolean,
  onDismissRequest: () => void,
  items: DropdownItem[],
  modifier?: ReadonlyModifier,
): void;

function Popup(
  ctx: CompositionContext,
  contentFn?: () => void,
  modifier?: ReadonlyModifier,
  alignment?: Alignment,
  offset?: { x: number; y: number },
  onDismissRequest?: (() => void) | null,
): void;
```

### 使用示例

```typescript
const showDialog = remember(rootCtx, () => mutableStateOf(false));

setContent(canvas, (rootCtx) => {
  Column(rootCtx, Modifier.create().padding(16).freeze(), 'center', 'center', () => {
    Button(rootCtx, 'Show Dialog', () => { showDialog.value = true; });

    if (showDialog.value) {
      Dialog(rootCtx, () => { showDialog.value = false; }, () => {
        Column(rootCtx, Modifier.create().padding(24).freeze(), 'spacedBy(16)', 'center', () => {
          Text(rootCtx, 'Confirm Action', Modifier.create().freeze(), {
            fontSize: 20, fontWeight: 'bold',
          });
          Text(rootCtx, 'Are you sure you want to proceed?');
          Row(rootCtx, Modifier.create().freeze(), 'spacedBy(12)', 'end', () => {
            Button(rootCtx, 'Cancel', () => { showDialog.value = false; });
            Button(rootCtx, 'OK', () => { showDialog.value = false; });
          });
        });
      });
    }
  });
});
```

## 文件变更清单

| 操作 | 文件路径 | 说明 |
|------|---------|------|
| 新建 | `src/components/overlay/dialog.ts` | Dialog 模态对话框 |
| 新建 | `src/components/overlay/modal-bottom-sheet.ts` | ModalBottomSheet 底部面板 |
| 新建 | `src/components/overlay/dropdown-menu.ts` | DropdownMenu 下拉菜单 |
| 新建 | `src/components/overlay/popup.ts` | Popup 弹出层 |
| 新建 | `src/components/overlay/index.ts` | 弹窗组件导出 |
| 新建 | `src/components/__tests__/overlay-components.test.ts` | 弹窗组件 单元测试 |
| 修改 | `src/index.ts` | 顶层导出更新 |

## DoD 验收标准

- [x] 构建零错误
- [x] 类型检查零 error
- [x] 单元测试 100% 通过
- [x] 所有组件签名：ctx-first + void 返回
- [x] Dialog 正确组合半透明背景 + 内容 + 按钮
- [x] ModalBottomSheet 正确管理弹出/收起
- [x] DropdownMenu 正确管理展开/收起
- [x] Popup 正确管理弹出位置
- [x] impl-checklist.yaml 所有条目 = done
