---
name: pg-dev
description: 新功能开发——从想法到验收。含头脑风暴(phase 0)、方案设计(phase 1)、实现(phase 2)、验收(phase 3)。小需求走 ff，微小改动走 tweak。
---

# pg-dev

## 启动：判断阶段

Glob `pg/features/` 已有产物自动判断：

| 已有产物 | 阶段 |
|---|---|
| 无 / 只有 brainstorm | phase 0 或 1 |
| design.md(approved) + checklist.yaml | phase 2 |
| 代码已写完 | phase 3 |
| 用户说"快速/直接干" | mode=ff |
| 用户说"改个配置/微小改动" | mode=tweak |

## Phase 0：头脑风暴（可选）

想法模糊时才走：

1. 问三个问题：解决什么问题？核心行为？明确不做？
2. 能答清 → 直接进 phase 1
3. 答不清 → 讨论收敛，落 `brainstorm.md`
4. 范围超出单 feature → 转 `pg-doc`(roadmap)

## Phase 1：方案设计

**唯一必须文档**：`{slug}-design.md`

启动必做：
1. 读 `pg/architecture/ARCHITECTURE.md`
2. 读需求相关代码
3. grep 防术语冲突
4. 搜 `pg/compound/` 查已有决策/踩坑

设计写三类：
- **名词**：新增实体、数据结构、对外契约
- **动词骨架**：关键编排、主流程、推进步骤
- **跨层纪律**：错误语义、幂等性、挂载点清单

不写：循环怎么写、辅助函数怎么拆、日志格式。

写完 → 用户整体 review → 抽 checklist.yaml → 进 phase 2。

模板见 `reference/design-template.md`。

## Phase 2：实现

三条纪律：
1. 按 checklist 顺序走，不跳步不合并
2. 只动设计声明的文件，范围外记"顺手发现"不改
3. 设计没说的事不自己拍板，停下来回去谈

写完输出汇报：动了哪些文件、是否触碰方案外、是否引入新概念。

### 中断协议

实现中遇到阻塞时：

| 遇到 | 动作 |
|---|---|
| 需先修 bug | 暂停 checklist，告知用户切 `pg-fix`，修完回来从暂停点继续 |
| 需先重构 | 暂停 checklist，告知用户切 `pg-refactor`，重构完回来继续 |
| 需先补依赖 | 暂停，和用户确认是纳入当前 feature 还是另起 |

暂停时在 checklist 当前步骤标注 `status: blocked` + `blocked_by: {原因}`。恢复时从该步骤重新开始。

## Phase 3：验收

逐层对照 design.md：
1. 接口契约 + 行为决策核对，偏差当场修
2. 测试约束核对
3. 架构归并（提炼进 architecture doc，按需）
4. 产出 `{slug}-acceptance.md`

### 验收收尾推荐

验收通过后逐条问（用户说"不用"立刻跳过）：

1. 本 feature 新增了用户可感能力？→ 是则推荐补 `pg-doc`(req)
2. 有踩坑或经验值得记？→ 推荐沉淀 `pg-doc`(learn)
3. 做了重要技术选型/约束？→ 推荐记 `pg-doc`(decide)
4. 需要更新开发者/用户指南？→ 推荐 `pg-doc`(guide)
5. 新增了公开 API？→ 推荐 `pg-doc`(libdoc)

推荐不是强制，不把用户拖入新工作流。

## Fastforward 模式

小需求专用，不写 design doc，不写 checklist。

1. 搜 `pg/compound/` 查踩坑/决策
2. 读 `pg/architecture/` 相关文档
3. 直接写代码，守住：先想放哪、扫文件状况、最少代码、不顺手改邻居
4. 变复杂了 → 切回标准流程

## Tweak 模式

微小改动专用（改配置、改文案、调参数），不写任何文档。

1. 确认改动范围：单文件 ≤3 行
2. 直接改，改完一句话汇报
3. 超出范围 → 切 ff 或标准流程

## 文件结构

```
pg/features/YYYY-MM-DD-{slug}/
├── {slug}-brainstorm.md   ← phase 0（可选）
├── {slug}-design.md       ← phase 1（必须）
├── {slug}-checklist.yaml  ← phase 1 抽出
└── {slug}-acceptance.md   ← phase 3（必须）
```

## 硬性规则

- 阶段间需用户确认才推进
- 术语先 grep 再用，冲突就换名
- 新逻辑默认放新文件
- 不替用户做决定，不确定的明着写出来
