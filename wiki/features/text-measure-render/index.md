---
id: "feat-08"
type: feature
status: done
title: "文本测量、排版与绘制"
origin_type: req
depends_on: ["feat-03", "feat-06"]
created: "2026-05-01 16:00"
updated: "2026-05-01 16:00"
stale: false
---

# feat-08: 文本测量、排版与绘制

## 实现思路概述

基于 feat-03 (Canvas 2D 渲染管线) 和 feat-06 (布局引擎)，实现文本测量、排版与绘制能力：

1. **TextStyle** — 文本样式配置（字体、大小、颜色、行高、对齐）
2. **TextMeasurer** — 基于 Canvas measureText 的文本测量器
3. **TextLayout** — 多行文本排版结果（行分割、位置计算）
4. **DrawScope 扩展** — drawText/drawMultilineText 方法

设计原则：
- 文本测量使用 Canvas 2D measureText API
- 多行排版按 \n 分割 + maxWidth 换行
- TextMeasurer 可作为 Measurable 集成到布局引擎

## 文件变更清单

| 操作 | 文件路径 | 说明 |
|------|---------|------|
| 新建 | `src/renderer/text-style.ts` | TextStyle 类型 + TextMeasurer + TextLayout |
| 修改 | `src/renderer/types.ts` | 新增 TextStyle/TextLayout/TextMeasurer 类型 |
| 修改 | `src/renderer/draw-command.ts` | 新增 createDrawText/createDrawMultilineText |
| 修改 | `src/renderer/draw-scope.ts` | 新增 drawText/drawMultilineText 方法 |
| 修改 | `src/renderer/index.ts` | 模块导出 |
| 修改 | `src/index.ts` | 顶层导出 |

## 接口与类型引用

### text-style.ts

```typescript
interface TextStyle {
  fontFamily: string
  fontSize: number
  fontWeight: 'normal' | 'bold'
  color: Color
  lineHeight?: number
  letterSpacing?: number
  textAlign?: 'left' | 'center' | 'right'
  maxLines?: number
  overflow?: 'clip' | 'ellipsis'
}

interface TextLayoutResult {
  readonly lines: ReadonlyArray<TextLine>
  readonly width: number
  readonly height: number
  readonly didOverflow: boolean
}

interface TextLine {
  readonly text: string
  readonly x: number
  readonly y: number
  readonly width: number
}

interface TextMeasurer {
  measure(text: string, style: TextStyle, maxWidth?: number): TextLayoutResult
}
```

## 测试策略

| 项目 | 内容 |
|------|------|
| 测试金字塔 | 单元 85% : 集成 15% |
| Mock 策略 | Mock CanvasRenderingContext2D.measureText |
| 关键路径 | 1) 单行文本测量 2) 多行换行 3) 省略号截断 |
| 边界测试 | 1) 空文本 2) 超长单行 3) maxLines=1 |

## DoD 验收标准

- [x] 构建零错误
- [x] 类型检查零 error
- [x] 单元测试 100% 通过
- [x] TextMeasurer 正确测量单行/多行文本
- [x] DrawScope 支持 drawText/drawMultilineText
