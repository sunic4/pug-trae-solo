---
id: "feat-20"
type: feature
status: done
title: "弹窗组件 (Dialog/ModalBottomSheet/DropdownMenu/Popup)"
origin_type: req
depends_on: ["feat-18", "feat-11"]
created: "2026-05-01 18:45"
updated: "2026-05-01 18:45"
stale: false
---

# feat-20: 弹窗组件

## 实现思路概述

1. **Dialog** — 模态对话框，支持 title/content/buttons + onDismissRequest
2. **ModalBottomSheet** — 底部弹出面板，支持 content + onDismissRequest + peekHeight
3. **DropdownMenu** — 下拉菜单，支持 items + expanded/onDismissRequest
4. **Popup** — 轻量弹出层，支持 alignment/offset + content

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
- [x] Dialog 正确组合标题/内容/按钮
- [x] ModalBottomSheet 正确管理弹出/收起
- [x] DropdownMenu 正确管理展开/收起
- [x] Popup 正确管理弹出位置
- [x] impl-checklist.yaml 所有条目 = done
