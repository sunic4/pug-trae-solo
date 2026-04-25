---
name: pg-doc
description: 文档与知识维护——架构、需求、知识沉淀、指南、规划、查询。按需生成，不自动触发。
---

# pg-doc

## 模式路由

| 用户诉求 | 模式 | 产物目录 |
|---|---|---|
| 架构文档 / 刷新架构 / 架构检查 | arch | pg/architecture/ |
| 需求文档 / 补 req | req | pg/requirements/ |
| 踩坑记录 / 经验总结 | learn | pg/compound/ |
| 可复用技巧 / 库用法 | trick | pg/compound/ |
| 技术决策 / ADR | decide | pg/compound/ |
| 代码探索 / 模块梳理 | explore | pg/compound/ |
| 开发者指南 / 用户指南 | guide | docs/ |
| API 参考 / 组件文档 | libdoc | docs/api/ |
| 大需求拆解 / 排期规划 | roadmap | pg/roadmap/ |
| 了解项目 / 看看项目 | explore | pg/compound/ |
| 查 / 找 / 为什么 / 上次怎么定的 | query | 无（只读） |

## 统一流程

1. **识别模式**：确认 doc_type 和目标
2. **查重叠**：`python pg/tools/search-yaml.py --dir pg/compound --query "{关键词}"`，命中则更新而非新建
3. **收集信息**：读代码/架构/已有文档
4. **起草**：按对应模板写完整初稿
5. **用户 review**：一次性展示，迭代到确认
6. **归档**：写入目标目录，更新索引

## 各模式要点

### arch
- 只记现状，不记计划
- 三种操作：backfill(补) / update(刷新) / check(检查)
- 结构化断言锚到 file:line

### req
- 只记已存在的能力，不记计划
- 用户故事 + 痛点 + 解法 + 边界

### learn / trick / decide / explore
- learn：踩坑(pitfall)或最佳实践(knowledge)
- trick：可复用处方(pattern / library / technique)
- decide：已拍板决策(tech-stack / architecture / constraint / convention)
- explore：定向代码探索(question / module-overview / spike)
- 必须查代码验证，不靠猜

### guide / libdoc
- guide：任务导向，教怎么做
- libdoc：参考导向，每个零件长什么样
- 产物在 docs/ 下，不在 pg/ 下

### roadmap
- 大需求拆解：概设 + 接口契约 + 子 feature 清单
- 接口契约写到可执行程度
- 依赖图必须是 DAG

### query
查询已有文档，不产出新文档：

1. 解析用户查询意图（查决策？查踩坑？查架构？）
2. 搜对应目录：`pg/compound/`、`pg/architecture/`、`pg/requirements/`、`pg/roadmap/`
3. 搜 `pg/features/` 和 `pg/issues/` 的 design/analysis 文档
4. 汇总结果，直接回答用户问题
5. 查不到 → 明确告知，不编造

## 文件命名

- compound: `YYYY-MM-DD-{doc_type}-{slug}.md`
- requirements: `{slug}.md`
- architecture: `{type}-{slug}.md`
- roadmap: `{slug}/{slug}-roadmap.md` + `{slug}-items.yaml`
- guide: `docs/{dev|user}/{slug}.md`
- libdoc: `docs/api/{slug}.md`

## 知识沉淀守护规则

1. 只增不删（除非 superseded）
2. 宁缺毋滥，AI 不编造内容
3. 起草前先查重叠，有命中让用户选：更新已有 / supersede / 确实不同主题
4. 写完检查 AGENTS.md 有没有指引 AI 查阅 pg/compound/，没有就提示用户
