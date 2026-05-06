---
id: "feat-22"
type: feature
status: done
title: "进度指示器与 Snackbar"
origin_type: req
depends_on: ["feat-15", "feat-13"]
created: "2026-05-01 18:40"
updated: "2026-05-01 18:40"
stale: false
---

# feat-22: 进度指示器与 Snackbar

## 实现思路概述

1. **CircularProgressIndicator** — 圆形进度指示器，支持 progress/determinate/indeterminate + 颜色/粗细
2. **LinearProgressIndicator** — 线性进度条，支持 progress/determinate/indeterminate + 颜色/高度
3. **Snackbar** — 消息提示条，支持 message/action/onActionClick/duration

## 文件变更清单

| 操作 | 文件路径 | 说明 |
|------|---------|------|
| 新建 | `src/components/feedback/circular-progress.ts` | CircularProgressIndicator |
| 新建 | `src/components/feedback/linear-progress.ts` | LinearProgressIndicator |
| 新建 | `src/components/feedback/snackbar.ts` | Snackbar 消息提示 |
| 新建 | `src/components/feedback/index.ts` | 反馈组件导出 |
| 新建 | `src/components/__tests__/feedback-components.test.ts` | 反馈组件 单元测试 |
| 修改 | `src/index.ts` | 顶层导出更新 |

## DoD 验收标准

- [x] 构建零错误
- [x] 类型检查零 error
- [x] 单元测试 100% 通过
- [x] CircularProgressIndicator 正确管理进度值
- [x] LinearProgressIndicator 正确管理进度值
- [x] Snackbar 正确组合消息和操作
- [x] impl-checklist.yaml 所有条目 = done
