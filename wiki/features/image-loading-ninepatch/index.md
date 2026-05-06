---
id: "feat-14"
type: feature
status: done
title: "图像加载、纹理管理九宫格"
origin_type: req
depends_on: ["feat-03"]
created: "2026-05-01 17:36"
updated: "2026-05-01 17:36"
stale: false
---

# feat-14: 图像加载、纹理管理九宫格

## 实现思路概述

基于 feat-03 (Canvas 2D 渲染管线)，实现图像加载、缓存和九宫格(NinePatch)绘制能力。

1. **ImageLoader** — 异步图像加载器，支持 URL/CanvasImageSource 加载，LRU 缓存策略
2. **NinePatch** — 九宫格绘制，将图像分为 9 个区域，边角固定、边拉伸、中重复
3. **DrawCommand 扩展** — 新增 drawImage/drawNinePatch 绘制指令
4. **DrawScope 扩展** — 新增 drawImage/drawNinePatch 方法

### 九宫格模型

```
┌───┬───────┬───┐
│ 1 │   2   │ 3 │  ← 固定宽度，高度拉伸
├───┼───────┼───┤
│ 4 │   5   │ 6 │  ← 宽高都拉伸
├───┼───────┼───┤
│ 7 │   8   │ 9 │  ← 固定宽度，高度拉伸
└───┴───────┴───┘
  ↑     ↑     ↑
固定  拉伸  固定
```

## 文件变更清单

| 操作 | 文件路径 | 说明 |
|------|---------|------|
| 新建 | `src/renderer/image-loader.ts` | ImageLoader + ImageCache + NinePatchConfig |
| 新建 | `src/renderer/__tests__/image-loader.test.ts` | 图像加载/缓存/九宫格 单元测试 |
| 修改 | `src/renderer/draw-command.ts` | 新增 drawImage/drawNinePatch 命令 |
| 修改 | `src/renderer/draw-scope.ts` | 新增 drawImage/drawNinePatch 方法 |
| 修改 | `src/renderer/index.ts` | 模块导出更新 |
| 修改 | `src/index.ts` | 顶层导出更新 |

## 接口与类型定义

### image-loader.ts

```typescript
interface ImageResource {
  readonly source: CanvasImageSource
  readonly width: number
  readonly height: number
  readonly isLoaded: boolean
}

interface NinePatchConfig {
  readonly left: number
  readonly top: number
  readonly right: number
  readonly bottom: number
}

interface ImageLoader {
  load(src: string): Promise<ImageResource>
  get(src: string): ImageResource | null
  preload(srcs: string[]): Promise<void>
  evict(src: string): void
  clear(): void
  dispose(): void
}
```

## 测试策略

| 项目 | 内容 |
|------|------|
| 测试金字塔 | 单元 90% : 集成 10% |
| Mock 策略 | Mock Image 构造函数和加载回调 |
| 关键路径 | 1) 图像加载和缓存 2) LRU 淘汰 3) 九宫格绘制参数 4) DrawCommand 扩展 |
| 边界测试 | 1) 加载失败处理 2) 缓存为空 3) 九宫格区域为零 |

## 风险与依赖

| 风险 | 缓解措施 |
|------|---------|
| 图像加载失败 | 返回 null + 错误回调 |
| 缓存内存溢出 | LRU 策略 + 最大缓存数限制 |
| Canvas 跨域图片 | 加载时设置 crossOrigin |

## DoD 验收标准

- [x] 构建零错误
- [x] 类型检查零 error
- [x] 单元测试 100% 通过
- [x] ImageLoader 正确加载和缓存图像
- [x] LRU 缓存正确淘汰
- [x] NinePatch 正确计算九宫格区域
- [x] DrawCommand/DrawScope 正确扩展
- [x] impl-checklist.yaml 所有条目 = done
