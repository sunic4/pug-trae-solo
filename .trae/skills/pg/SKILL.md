---
name: pg
description: pg 入口——路由用户诉求到子技能，项目未初始化时自动初始化。
---

# pg

## 启动

1. Glob 项目根目录 `pg/` 是否存在
   - 不存在 → 执行初始化
   - 存在 → 路由

## 初始化

### 空项目

创建骨架：

```
pg/
├── requirements/.gitkeep
├── architecture/ARCHITECTURE.md    （占位：# Architecture Index）
├── roadmap/.gitkeep
├── features/.gitkeep
├── issues/.gitkeep
├── refactors/.gitkeep
├── compound/.gitkeep
├── tools/                          （从技能包复制 search-yaml.py + validate-yaml.py）
└── reference/                      （从技能包复制 shared-conventions.md + tools.md + code-dimensions.md）
```

### 已有项目迁移

检测到项目根目录有代码文件但无 `pg/` → 走迁移路径：

1. 扫描项目已有文档（README、docs/、.github/ 等）
2. 列出映射方案：哪些已有文档对应 pg 哪个目录，哪些需要新建
3. 逐条和用户确认
4. 确认后落盘：已有文档移入对应位置，缺的目录补 .gitkeep

检查根目录 `AGENTS.md`，不存在提醒用户创建。

## 路由表

| 用户诉求 | 路由到 |
|---|---|
| 新功能 / 加个X / 实现XX | `pg-dev` |
| 想法模糊 / 先聊聊 / brainstorm | `pg-dev`（phase 0） |
| 快速做 / 直接干 / fastforward | `pg-dev`（mode=ff） |
| 改个配置 / 改一下 / 微小改动 | `pg-dev`（mode=tweak） |
| Bug / 报错 / 异常 / 不对 | `pg-fix` |
| 线上挂了 / P0 / 紧急 | `pg-fix`（mode=urgent） |
| 优化 / 重构 / 重写 / 拆一下 | `pg-refactor` |
| 小重构 / 快速优化 | `pg-refactor`（mode=ff） |
| 补测试 / 加测试 | `pg-refactor`（mode=test） |
| 写文档 / 架构 / 需求 / 知识沉淀 | `pg-doc` |
| 大需求拆解 / 排期规划 | `pg-doc`（mode=roadmap） |
| 了解项目 / 看看项目 / 模块梳理 | `pg-doc`（mode=explore） |
| 查 / 找 / 为什么 / 上次怎么定的 | `pg-doc`（mode=query） |
| 继续 / 接着做 / 恢复 | 自动恢复（见下方） |

### 自动恢复

用户说"继续/接着做"时：
1. Glob `pg/features/` + `pg/issues/` + `pg/refactors/` 找未完成产物
2. 有且仅有一个 → 直接路由到对应技能并从断点继续
3. 多个 → 列出让用户选
4. 无 → 问用户想做什么

判不出来就问，不硬猜。
