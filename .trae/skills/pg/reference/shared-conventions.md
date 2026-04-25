# pg 共享口径

## 目录结构

```
pg/
├── requirements/      需求（为什么要有，只记现状）
│   └── {slug}.md
├── architecture/      架构（怎么搭的，只记现状）
│   ├── ARCHITECTURE.md
│   └── {type}-{slug}.md
├── roadmap/           规划（接下来怎么做）
│   └── {slug}/
│       ├── {slug}-roadmap.md
│       └── {slug}-items.yaml
├── features/          功能 spec
│   └── YYYY-MM-DD-{slug}/
├── issues/            bug spec
│   └── YYYY-MM-DD-{slug}/
├── refactors/         重构 spec
│   └── YYYY-MM-DD-{slug}/
├── compound/          知识沉淀
│   └── YYYY-MM-DD-{doc_type}-{slug}.md
├── tools/             共享脚本
└── reference/         共享参考
```

## 命名规则

- requirements: `{slug}.md`（长效，不带日期）
- architecture: `{type}-{slug}.md`（长效，type 段用于同类聚合）
- roadmap: `{slug}/{slug}-roadmap.md`
- features/issues/refactors: `YYYY-MM-DD-{slug}/`（日期用创建当天）
- compound: `YYYY-MM-DD-{doc_type}-{slug}.md`（日期用归档当天）

## 元数据口径

### feature spec

共用 `doc_type`、`feature`、`status`、`summary`、`tags`。status 流：brainstorm=`confirmed`、design=`draft`/`approved`、acceptance 见对应技能。

### issue spec

共用 `doc_type`、`issue`、`status`、`tags`。

### compound

`doc_type` ∈ {learning, trick, decision, explore}。各模式保留专属字段（learning 的 `track`、trick 的 `type`、decision 的 `category`、explore 的 `type`）。

## checklist.yaml 生命周期

- design 阶段生成，只提取 steps 和 checks
- implement 只更新 `steps[].status`（pending → done）
- acceptance 只更新 `checks[].status`（pending → passed/failed）
- ff 模式不生成 checklist

## roadmap ↔ feature 衔接

items.yaml 状态机：`planned → in-progress`（pg-dev design 启动时）→ `done`（pg-dev acceptance 完成时）。`planned → dropped`（pg-doc roadmap update 时）。

design.md frontmatter 加 `roadmap` + `roadmap_item` 字段标识来源。无 roadmap 来源则留空。

## 归档检索

动手前搜 `pg/compound/` + `pg/architecture/`。搜到冲突 decision 必须正面回应。

## 代码反射检查

| 触发场景 | 停下来问 |
|---|---|
| 往很长文件追加代码 | 这是第 N+1 件事？是就新建文件 |
| 给很多方法的类加方法 | 把类推向"什么都能干"？ |
| 函数超一屏 | 做几件事？几件就拆 |
| 加特殊分支 if | 抽象维度选错了？ |
| copy-paste 代码 | 能抽共用？ |
| 函数第 4+ 个参数 | 做的事太多了？ |
| 新写"万能工具类" | 真没归属？ |

停下来后结论用户定。超范围动作跟用户对齐再决定。
