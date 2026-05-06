---
id: "draw-batching-missing"
type: issue
status: reported
title: "渲染器缺少批量绘制合并 (Draw Batching)"
depends_on: []
severity: major
created: "2025-05-01T22:20"
updated: "2025-05-01T22:20"
stale: false
---

## 问题描述

当前渲染器逐条执行 DrawCommand，每个命令独立设置 `fillStyle`/`strokeStyle`/`font` 等上下文属性。当连续多个同类命令使用相同颜色时，存在冗余的属性设置开销。

## 复现步骤

1. 绘制 100 个同色矩形 → 100 次 `fillStyle` 赋值，99 次是冗余的
2. 大量 DrawCall 时掉帧风险增加

## 期望行为

将连续的同色/同态绘制命令合并为批处理，减少 Canvas 上下文状态切换次数。

## 影响范围

- 大量绘制场景下的渲染性能
- 特别影响虚拟列表、数据可视化等场景
