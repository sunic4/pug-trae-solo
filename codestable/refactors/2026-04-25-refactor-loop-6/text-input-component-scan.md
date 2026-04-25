---
doc_type: refactor-scan
refactor: 2026-04-25-refactor-loop-6
status: draft
scope: TextInput 组件
---

# TextInput 组件重构扫描清单

## 总览

本次扫描范围涵盖了 TextInput 组件的实现：
- `packages/components/src/text-input.ts` - TextInput 组件实现

扫描发现了 4 个优化点，按分类分布如下：
- L1 行为等价迁移信号：1 个
- L2 代码级重构信号：3 个

按风险分布：
- 低风险：4 个

建议优先处理的优化点：
1. 统一组件 API 设计，只从 props 中获取 appContext
2. 使用 getThemeFromContext 函数获取主题
3. 优化 onClick 方法绑定方式
4. 优化 onKeyDown 方法实现

## 优化点清单

### 1. 统一组件 API 设计

**分类**：L1 行为等价迁移信号
**风险**：低
**文件**：`packages/components/src/text-input.ts`
**描述**：TextInput 组件的构造函数接受单独的 appContext 参数，与统一的组件 API 设计不一致。
**建议**：修改构造函数，只从 props 中获取 appContext，不再接受单独的 appContext 参数。
**影响范围**：TextInput 组件
**验证方式**：运行测试套件，确保组件创建和使用方式正确

### 2. 使用 getThemeFromContext 函数获取主题

**分类**：L2 代码级重构信号
**风险**：低
**文件**：`packages/components/src/text-input.ts`
**描述**：TextInput 组件的 draw 方法直接使用 useTheme() 函数获取主题，而不是从 appContext 中获取。
**建议**：修改 draw 方法，使用 getThemeFromContext 函数从 appContext 中获取主题。
**影响范围**：TextInput 组件
**验证方式**：运行测试套件，确保组件仍能正确获取主题

### 3. 优化 onClick 方法绑定方式

**分类**：L2 代码级重构信号
**风险**：低
**文件**：`packages/components/src/text-input.ts`
**描述**：TextInput 组件的构造函数中使用 bind 方法绑定 onClick 方法，这可能会影响性能。
**建议**：使用箭头函数或在构造函数中直接定义方法，避免使用 bind 方法。
**影响范围**：TextInput 组件
**验证方式**：运行测试套件，确保点击事件处理逻辑正确

### 4. 优化 onKeyDown 方法实现

**分类**：L2 代码级重构信号
**风险**：低
**文件**：`packages/components/src/text-input.ts`
**描述**：TextInput 组件的 onKeyDown 方法只支持 Backspace 和字母数字按键，不支持其他常用按键。
**建议**：优化 onKeyDown 方法，支持更多键盘按键，如 Enter、Tab、箭头键等。
**影响范围**：TextInput 组件
**验证方式**：运行测试套件，确保键盘输入处理逻辑正确
