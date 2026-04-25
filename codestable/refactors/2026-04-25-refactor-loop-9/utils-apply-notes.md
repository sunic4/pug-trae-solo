---
doc_type: refactor-apply-notes
refactor: 2026-04-25-refactor-loop-9
---

# utils.ts 文件重构执行记录

## 步骤 1: 优化 getThemeFromContext 函数

- **完成时间**: 2026-04-25
- **改动文件**: `packages/components/src/utils.ts`
- **改动内容**:
  - 简化 getThemeFromContext 函数的实现，直接传递 appContext 参数
- **验证结果**: TypeScript 类型检查通过（只显示 baseUrl 废弃警告，无实际类型错误）
- **偏离**: 无

## 步骤 2: 添加计算文本宽度的工具函数

- **完成时间**: 2026-04-25
- **改动文件**: `packages/components/src/utils.ts`
- **改动内容**:
  - 添加 calculateTextWidth 函数，用于计算文本宽度
  - 支持浏览器环境和非浏览器环境
- **验证结果**: TypeScript 类型检查通过（只显示 baseUrl 废弃警告，无实际类型错误）
- **偏离**: 无

## 步骤 3: 添加计算文本高度的工具函数

- **完成时间**: 2026-04-25
- **改动文件**: `packages/components/src/utils.ts`
- **改动内容**:
  - 添加 calculateTextHeight 函数，用于计算文本高度
  - 支持自定义行高
- **验证结果**: TypeScript 类型检查通过（只显示 baseUrl 废弃警告，无实际类型错误）
- **偏离**: 无

## 步骤 4: 添加处理颜色的工具函数

- **完成时间**: 2026-04-25
- **改动文件**: `packages/components/src/utils.ts`
- **改动内容**:
  - 添加 adjustColorBrightness 函数，用于调整颜色亮度
  - 添加 calculateWrappedTextHeight 函数，用于计算文本换行后的高度
- **验证结果**: TypeScript 类型检查通过（只显示 baseUrl 废弃警告，无实际类型错误）
- **偏离**: 无

## 验证结果

- **类型检查**: TypeScript 类型检查通过（只显示 baseUrl 废弃警告，无实际类型错误）
- **测试套件**: 组件测试通过（6 个测试用例）

## 总结

本次重构成功完成了 utils.ts 文件的以下优化：
1. 优化了 getThemeFromContext 函数的实现，使其更加简洁
2. 添加了 calculateTextWidth 函数，用于计算文本宽度
3. 添加了 calculateTextHeight 函数，用于计算文本高度
4. 添加了 adjustColorBrightness 函数，用于调整颜色亮度
5. 添加了 calculateWrappedTextHeight 函数，用于计算文本换行后的高度

所有测试都已通过，重构工作已完成。