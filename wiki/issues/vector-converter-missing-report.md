---
id: "vector-converter-missing"
type: issue
status: reported
title: "动画系统缺少 VectorConverter 类型转换"
depends_on: []
severity: major
created: "2025-05-01T22:15"
updated: "2025-05-01T22:15"
stale: false
---

## 问题描述

当前 `Animatable<T>` 泛型约束 `T extends number`，只能对纯数字类型做动画。无法对 `Color`、`Rect`、`Point` 等复合类型做属性动画。

## 复现步骤

1. 尝试 `animateColorAsState(Color(0,0,0,1))` → 类型错误，Animatable 不支持 Color
2. 无法实现颜色过渡动画、位置过渡动画等常见需求

## 期望行为

通过 `TwoWayConverter<T, V>` 将复合类型拆解为 AnimationVector（数值数组），Animatable 基于向量做插值后再转换回原类型。

## 影响范围

- 动画系统无法支持颜色、尺寸、偏移等复合类型的动画
- 缺少 `animateColorAsState`、`animateOffsetAsState` 等高级 API
- 与 Compose 设计理念中 "属性驱动动画" 不一致
