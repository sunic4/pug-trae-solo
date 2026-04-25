---
name: pg-refactor
description: 代码重构——行为不变、结构变。含扫描(phase 1)、方案(phase 2)、执行(phase 3)。小重构走 ff，补测试走 test 模式。
---

# pg-refactor

## 启动

| 用户诉求 | 模式 |
|---|---|
| 优化 / 重构 / 重写 / 拆一下 | 标准流程 |
| 小重构 / 快速优化 | mode=ff |
| 补测试 / 加测试 | mode=test |

## Phase 1：扫描

和用户确认扫描范围（文件/模块），按四层找优化点：
- L1 行为等价迁移信号（Parallel Change / Strangler Fig）
- L2 代码级重构信号（超长函数、重复片段、深层嵌套）
- L3 结构拆分信号（大类、职责混杂、容器展示混合）
- L4 性能信号（重复计算、N+1、无虚拟化）

写 `{slug}-scan.md`，用户勾选要做的条目。

## Phase 2：方案

1. 排顺序（依赖前置、低风险优先）
2. 每条补执行细节 + 验证方式
3. 用户 review → 抽 checklist.yaml

## Phase 3：执行

- 一步一做，不批量
- AI 自证项跑测试，HUMAN 验证项停下来等人
- 行为等价自检：每步问"有没有改外部可观察行为？"

## Fastforward 模式

入场 3 检查（不过就退回标准流程）：
1. 行为真的不变？
2. 范围真的小？（≤1 文件，≤3 处改动）
3. 有测试能自证？

通过 → 用经典方法（Extract Function / Guard Clauses / Memoization 等）直接改，跑测试自证，一句话汇报。

ff 模式不产文件。

## Test 模式

补测试专用。测试覆盖是结构改善的一种——让代码从 untested/testable 变成 tested。

1. 确认目标模块和测试框架
2. 读代码梳理公开接口和关键路径
3. 列出测试清单：正常路径 + 边界 + 异常
4. 用户确认范围 → 写测试 → 跑测试自证
5. 不可测的结构先指出，建议重构后再补

test 模式不产 spec 文件，测试代码本身就是产物。

## 文件结构

```
pg/refactors/YYYY-MM-DD-{slug}/
├── {slug}-scan.md             ← phase 1
├── {slug}-refactor-design.md  ← phase 2
├── {slug}-checklist.yaml      ← phase 2
└── {slug}-apply-notes.md      ← phase 3
```
