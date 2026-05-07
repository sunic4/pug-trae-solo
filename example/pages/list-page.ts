import { composable } from '@/core/composable'
import { remember } from '@/core/remember'
import type { ComposerContext, ComposableNode } from '@/core/types'
import { mutableStateOf } from '@/core/state'
import { Column } from '@/components/layout/column'
import { Row } from '@/components/layout/row'
import { Box } from '@/components/basic/box'
import { Surface } from '@/components/layout/surface'
import { Button } from '@/components/interaction/button'
import { M, AppColors } from '../theme/app-theme'
import type { ComponentNode } from '@/components/basic/types'

interface ListItemData {
  readonly id: number
  readonly title: string
  readonly desc: string
  readonly tag: string
  readonly tagColor: { r: number; g: number; b: number; a: number }
}

const DEMO_ITEMS: ListItemData[] = [
  { id: 1, title: '响应式状态系统', desc: 'Snapshot + Context 驱动的细粒度更新', tag: 'Core', tagColor: AppColors.primary },
  { id: 2, title: 'Composable 追踪', desc: '运行时 HOC 自动管理依赖与重组', tag: 'Core', tagColor: AppColors.primary },
  { id: 3, title: 'Canvas 渲染管线', desc: 'Hybrid 混合模式，增量脏区域渲染', tag: 'Render', tagColor: AppColors.success },
  { id: 4, title: '自研布局引擎', desc: 'Column/Row 线性布局，约束测量体系', tag: 'Layout', tagColor: AppColors.warning },
  { id: 5, title: '手势识别系统', desc: 'Tap/LongPress/Drag/Pinch 多手势竞技', tag: 'Input', tagColor: { r: 156, g: 39, b: 176, a: 1 } },
  { id: 6, title: 'Modifier 链', desc: 'Builder + Freeze 模式，不可变修饰符', tag: 'Layout', tagColor: AppColors.warning },
  { id: 7, title: '属性动画系统', desc: 'Compose 风格 Animatable + AnimationSpec', tag: 'Animation', tagColor: { r: 255, g: 112, b: 67, a: 1 } },
  { id: 8, title: 'ErrorBoundary', desc: '全局捕获 + 分级恢复策略', tag: 'Safety', tagColor: AppColors.error },
  { id: 9, title: 'LazyColumn 虚拟列表', desc: '可视区域渲染，支持大量数据项', tag: 'Perf', tagColor: { r: 0, g: 150, b: 136, a: 1 } },
  { id: 10, title: 'DrawBatch 批量绘制', desc: '命令合并减少 Canvas 状态切换', tag: 'Perf', tagColor: { r: 0, g: 150, b: 136, a: 1 } },
  { id: 11, title: 'LayerTree 脏区域', desc: '增量更新仅重绘变化部分', tag: 'Render', tagColor: AppColors.success },
  { id: 12, title: 'NavController 导航', desc: '路由栈管理 + NavHost 内容切换', tag: 'Nav', tagColor: { r: 121, g: 134, b: 203, a: 1 } },
]

function ListPage(_props: {}, ctx: ComposerContext): ComposableNode | null {
  const itemCount = remember(ctx, () => mutableStateOf(DEMO_ITEMS.length, ctx.snapshot))

  function renderListItem(item: ListItemData): ComponentNode {
    return Surface([
      Row(M.mod().fillMaxWidth(), 'spaceBetween', 'center', [
        M.body(item.title, 15),
        Box(M.mod().background(item.tagColor, 10).padding(8, 2), 'center', [
          M.caption(item.tag, 10, { color: AppColors.onPrimary }),
        ]),
      ]),
      M.spacer(6),
      M.caption(item.desc),
    ], { modifier: M.mod().fillMaxWidth().padding(14), color: AppColors.cardBg, elevation: 1, borderRadius: 10 })
  }

  const visibleItems = DEMO_ITEMS.slice(0, itemCount.value)

  return Column(M.mod().padding(16).fillMaxSize(), 'start', 'start', [
    Row(M.mod().fillMaxWidth(), 'spaceBetween', 'center', [
      M.heading('虚拟列表', 24),
      M.caption(`${itemCount.value} 项`),
    ]),
    M.spacer(12),
    Column(
      M.mod(),
      'start',
      'start',
      visibleItems.map(item => [
        renderListItem(item),
        M.spacer(10),
      ]).flat(),
    ),
    M.spacer(24),
    Row(M.mod(), 'start', 'center', [
      Button(() => { itemCount.value = Math.max(3, itemCount.value - 2) }, '减少'),
      M.gap(8),
      Button(() => { itemCount.value = Math.min(DEMO_ITEMS.length, itemCount.value + 2) }, '增加', { backgroundColor: AppColors.success }),
    ]),
    M.spacer(24),
  ])
}

export const ListPageComposable = composable<{}>(ListPage)
