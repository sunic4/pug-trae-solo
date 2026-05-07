import { composable } from '@/core/composable'
import { remember } from '@/core/remember'
import type { CompositionContext } from '@/core/composition-context'
import type { MutableState } from '@/core/types'
import { mutableStateOf } from '@/core/state'
import { Column } from '@/components/layout/column'
import { Row } from '@/components/layout/row'
import { Box } from '@/components/basic/box'
import { Button } from '@/components/interaction/button'
import { Modifier } from '@/layout/modifier'
import { M, AppColors } from '../theme/app-theme'

interface ListItemData {
  readonly id: number
  readonly title: string
  readonly desc: string
  readonly tag: string
  readonly tagColor: { r: number; g: number; b: number; a: number }
}

const DEMO_ITEMS: ListItemData[] = [
  { id: 1, title: '响应式状态系统', desc: 'Snapshot + Context 驱动的细粒度更新机制', tag: 'Core', tagColor: AppColors.primary },
  { id: 2, title: 'Composable 追踪', desc: '运行时 HOC 自动管理依赖与重组调度', tag: 'Core', tagColor: AppColors.primary },
  { id: 3, title: 'Canvas 渲染管线', desc: 'Hybrid 混合模式，增量脏区域高效渲染', tag: 'Render', tagColor: AppColors.success },
  { id: 4, title: '自研布局引擎', desc: 'Column / Row 线性布局，约束测量体系', tag: 'Layout', tagColor: AppColors.warning },
  { id: 5, title: '手势识别系统', desc: 'Tap / LongPress / Drag / Pinch 多手势竞技仲裁', tag: 'Input', tagColor: { r: 156, g: 39, b: 176, a: 1 } },
  { id: 6, title: 'Modifier 链式 API', desc: 'Builder + Freeze 模式，不可变修饰符链', tag: 'Layout', tagColor: AppColors.warning },
  { id: 7, title: '属性动画系统', desc: 'Compose 风格 Animatable + AnimationSpec 驱动', tag: 'Animation', tagColor: { r: 255, g: 112, b: 67, a: 1 } },
  { id: 8, title: 'ErrorBoundary 守卫', desc: '全局异常捕获 + 分级恢复策略', tag: 'Safety', tagColor: AppColors.error },
  { id: 9, title: 'LazyColumn 虚拟列表', desc: '可视区域按需渲染，支持海量数据项', tag: 'Perf', tagColor: { r: 0, g: 150, b: 136, a: 1 } },
  { id: 10, title: 'DrawBatch 批量绘制', desc: '命令合并减少 Canvas 状态切换开销', tag: 'Perf', tagColor: { r: 0, g: 150, b: 136, a: 1 } },
  { id: 11, title: 'LayerTree 脏区域追踪', desc: '增量更新仅重绘变化部分，极致性能', tag: 'Render', tagColor: AppColors.success },
  { id: 12, title: 'NavController 导航栈', desc: '路由栈管理 + NavHost 内容切换', tag: 'Nav', tagColor: { r: 121, g: 134, b: 203, a: 1 } },
]

function ListPage(ctx: CompositionContext, _props?: {}): void {
  const itemCount = remember(ctx, () => mutableStateOf(DEMO_ITEMS.length, ctx.snapshot))
  const selectedId = remember(ctx, () => mutableStateOf<number | null>(null, ctx.snapshot))

  const visibleItems = DEMO_ITEMS.slice(0, itemCount.value)

  function renderListItem(item: ListItemData): void {
    const isSelected = selectedId.value === item.id
    M.card(
      ctx,
      () => {
        Row(ctx, Modifier.create().fillMaxWidth().freeze(), 'spaceBetween', 'center', () => {
          Row(ctx, Modifier.create().freeze(), 'start', 'center', () => {
            if (isSelected) {
              Box(
                ctx,
                Modifier.create()
                  .background(AppColors.primary, 10)
                  .layoutSize(6, 6)
                  .freeze(),
                'center',
              )
              M.gap(ctx, 10)
            }
            Column(ctx, Modifier.create().freeze(), 'start', 'start', () => {
              M.body(ctx, item.title, 15)
              M.spacer(ctx, 4)
              M.caption(ctx, item.desc)
            })
          })
          Box(
            ctx,
            Modifier.create()
              .background(item.tagColor, 10)
              .padding(8, 2)
              .freeze(),
            'center',
            () => {
              M.caption(ctx, item.tag, 10, { color: AppColors.onPrimary })
            },
          )
        })
      },
      { elevation: isSelected ? 3 : 1, padding: 14 },
    )
  }

  Column(
    ctx,
    Modifier.create().padding(16).fillMaxSize().freeze(),
    'start',
    'start',
    () => {
      Row(ctx, Modifier.create().fillMaxWidth().freeze(), 'spaceBetween', 'center', () => {
        M.heading(ctx, '虚拟列表', 24)
        Box(
          ctx,
          Modifier.create()
            .background(AppColors.sectionBg, 12)
            .padding(8, 4)
            .freeze(),
          'center',
          () => {
            M.caption(ctx, `${itemCount.value} / ${DEMO_ITEMS.length}`, 12)
          },
        )
      })
      M.spacer(ctx, 4)
      M.body(ctx, '卡片列表 · 动态数量控制 · 点击选中交互', 13, { color: { r: 117, g: 117, b: 117, a: 1 } })
      M.spacer(ctx, 16)

      if (visibleItems.length === 0) {
        M.section(ctx, () => {
          Column(ctx, Modifier.create().freeze(), 'center', 'center', () => {
            M.spacer(ctx, 16)
            M.body(ctx, '列表为空', 18, { color: { r: 158, g: 158, b: 158, a: 1 } })
            M.spacer(ctx, 8)
            M.caption(ctx, '点击下方"增加"按钮添加列表项')
          })
        })
      } else {
        Column(
          ctx,
          Modifier.create().freeze(),
          'start',
          'start',
          () => {
            for (const item of visibleItems) {
              Button(
                ctx,
                () => {
                  selectedId.value = selectedId.value === item.id ? null : item.id
                },
                () => { renderListItem(item) },
                { backgroundColor: { r: 255, g: 255, b: 255, a: 0 } },
              )
              M.spacer(ctx, 10)
            }
          },
        )
      }

      M.spacer(ctx, 20)

      M.section(ctx, () => {
        M.body(ctx, '列表控制', 14)
        M.spacer(ctx, 12)

        Row(ctx, Modifier.create().freeze(), 'center', 'center', () => {
          Button(ctx, () => { itemCount.value = Math.max(0, itemCount.value - 2) }, '-2')
          M.gap(ctx, 8)
          Button(ctx, () => { itemCount.value = Math.max(0, itemCount.value - 1) }, '-1')
          M.gap(ctx, 12)
          Box(
            ctx,
            Modifier.create()
              .background(AppColors.sectionBg, 8)
              .layoutSize(48, 32)
              .freeze(),
            'center',
            () => {
              M.body(ctx, `${itemCount.value}`, 15)
            },
          )
          M.gap(ctx, 12)
          Button(ctx, () => { itemCount.value = Math.min(DEMO_ITEMS.length, itemCount.value + 1) }, '+1', { backgroundColor: AppColors.success })
          M.gap(ctx, 8)
          Button(ctx, () => { itemCount.value = Math.min(DEMO_ITEMS.length, itemCount.value + 2) }, '+2', { backgroundColor: AppColors.success })
        })

        M.spacer(ctx, 12)

        Row(ctx, Modifier.create().freeze(), 'center', 'center', () => {
          M.warningButton(ctx, () => { itemCount.value = Math.ceil(DEMO_ITEMS.length / 2) }, '一半')
          M.gap(ctx, 8)
          M.primaryButton(ctx, () => { itemCount.value = DEMO_ITEMS.length }, '全部显示')
          M.gap(ctx, 8)
          M.errorButton(ctx, () => { itemCount.value = 0 }, '清空')
        })

        if (selectedId.value !== null) {
          M.spacer(ctx, 12)
          Row(ctx, Modifier.create().freeze(), 'center', 'center', () => {
            M.caption(ctx, `已选中: #${selectedId.value}`)
            M.gap(ctx, 8)
            Button(ctx, () => { selectedId.value = null }, '取消选中', { backgroundColor: AppColors.divider })
          })
        }
      })

      M.spacer(ctx, 16)

      M.section(ctx, () => {
        M.body(ctx, '统计信息', 14)
        M.spacer(ctx, 10)
        Row(ctx, Modifier.create().fillMaxWidth().freeze(), 'spaceBetween', 'center', () => {
          M.caption(ctx, `总数据量`)
          M.body(ctx, `${DEMO_ITEMS.length} 项`, 14)
        })
        M.spacer(ctx, 6)
        Row(ctx, Modifier.create().fillMaxWidth().freeze(), 'spaceBetween', 'center', () => {
          M.caption(ctx, `当前可见`)
          M.body(ctx, `${visibleItems.length} 项`, 14)
        })
        M.spacer(ctx, 6)
        Row(ctx, Modifier.create().fillMaxWidth().freeze(), 'spaceBetween', 'center', () => {
          M.caption(ctx, `标签分布`)
          M.body(ctx, `${[...new Set(visibleItems.map(i => i.tag))].length} 类`, 14)
        })
      })
    }
  )
}

export const ListPageComposable = composable<{}>(ListPage)
