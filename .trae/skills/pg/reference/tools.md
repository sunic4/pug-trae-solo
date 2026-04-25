# pg 工具用法

## search-yaml.py

```bash
python pg/tools/search-yaml.py --dir {目录} [--filter key=value]... [--query "关键词"] [--sort-by FIELD [--order asc|desc]] [--full] [--json]
```

filter 语法：`key=value` 精确匹配，`key~=value` 子串/元素包含。

```bash
# 按 doc_type 筛
python pg/tools/search-yaml.py --dir pg/compound --filter doc_type=learning
python pg/tools/search-yaml.py --dir pg/compound --filter doc_type=decision --filter status=active

# 全文搜索
python pg/tools/search-yaml.py --dir pg/compound --query "shadow database"

# 按 tag
python pg/tools/search-yaml.py --dir pg/compound --filter tags~=prisma

# 按时间排序
python pg/tools/search-yaml.py --dir pg/compound --sort-by date --order desc
python pg/tools/search-yaml.py --dir pg/library-docs --sort-by last_reviewed --order asc

# JSON 输出
python pg/tools/search-yaml.py --dir pg/compound --filter doc_type=trick --json
```

## validate-yaml.py

```bash
# 校验单文件
python pg/tools/validate-yaml.py --file {路径} --yaml-only

# 校验必填字段
python pg/tools/validate-yaml.py --dir {目录} --require doc_type --require status

# JSON 输出
python pg/tools/validate-yaml.py --dir pg/features --json
```
