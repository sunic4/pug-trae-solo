import { composable } from '@/core/composable'
import type { ComposerContext, ComposableNode } from '@/core/types'
import { Column } from '@/components/layout/column'
import { Row } from '@/components/layout/row'
import { Box } from '@/components/basic/box'
import { Surface } from '@/components/layout/surface'
import { M, AppColors } from '../theme/app-theme'

function LayoutPage(_props: {}, _ctx: ComposerContext): ComposableNode | null {
  return Column(M.mod().padding(12).fillMaxSize(), 'start', 'start', [
    M.heading('布局系统', 22),
    M.spacer(12),

    Surface([
      M.body('Column (垂直排列)', 14),
      M.spacer(8),
      Column(M.mod(), 'start', 'start', [
        Box(M.mod().background(AppColors.primary).layoutSize(180, 36), 'center', [
          M.body('Item 1', undefined, { color: AppColors.onPrimary }),
        ]),
        M.spacer(6),
        Box(M.mod().background(AppColors.success).layoutSize(180, 36), 'center', [
          M.body('Item 2', undefined, { color: AppColors.onPrimary }),
        ]),
        M.spacer(6),
        Box(M.mod().background(AppColors.warning).layoutSize(180, 36), 'center', [
          M.body('Item 3'),
        ]),
      ]),
    ], { modifier: M.mod().fillMaxWidth().padding(12), color: AppColors.cardBg, elevation: 2, borderRadius: 8 }),
    M.spacer(12),

    Surface([
      M.body('Row (水平排列)', 14),
      M.spacer(8),
      Row(M.mod(), 'center', 'center', [
        Box(M.mod().background({ r: 156, g: 39, b: 176, a: 1 }).layoutSize(50, 36), 'center', [
          M.body('A', undefined, { color: AppColors.onPrimary }),
        ]),
        M.gap(6),
        Box(M.mod().background({ r: 0, g: 150, b: 136, a: 1 }).layoutSize(50, 36), 'center', [
          M.body('B', undefined, { color: AppColors.onPrimary }),
        ]),
        M.gap(6),
        Box(M.mod().background({ r: 255, g: 112, b: 67, a: 1 }).layoutSize(50, 36), 'center', [
          M.body('C', undefined, { color: AppColors.onPrimary }),
        ]),
      ]),
    ], { modifier: M.mod().fillMaxWidth().padding(12), color: AppColors.cardBg, elevation: 2, borderRadius: 8 }),
    M.spacer(12),

    Surface([
      M.body('Box 对齐方式', 14),
      M.spacer(8),
      Row(M.mod(), 'start', 'center', [
        Column(M.mod(), 'start', 'start', [
          M.caption('start'),
          M.spacer(2),
          Box(M.mod().background(AppColors.sectionBg).layoutSize(100, 28), 'start', [
            M.caption('S'),
          ]),
        ]),
        M.gap(12),
        Column(M.mod(), 'start', 'start', [
          M.caption('center'),
          M.spacer(2),
          Box(M.mod().background(AppColors.sectionBg).layoutSize(100, 28), 'center', [
            M.caption('C'),
          ]),
        ]),
        M.gap(12),
        Column(M.mod(), 'start', 'start', [
          M.caption('end'),
          M.spacer(2),
          Box(M.mod().background(AppColors.sectionBg).layoutSize(100, 28), 'end', [
            M.caption('E'),
          ]),
        ]),
      ]),
    ], { modifier: M.mod().fillMaxWidth().padding(12), color: AppColors.cardBg, elevation: 2, borderRadius: 8 }),
    M.spacer(12),

    Surface([
      M.body('Surface 容器', 14),
      M.spacer(8),
      Row(M.mod(), 'center', 'center', [
        Surface([M.caption('Surface')], { modifier: M.mod().layoutSize(70, 50).padding(6), color: { r: 227, g: 242, b: 253, a: 1 }, elevation: 1, borderRadius: 6 }),
        M.gap(10),
        Surface([M.caption('Surface')], { modifier: M.mod().layoutSize(70, 50).padding(6), color: { r: 255, g: 243, b: 224, a: 1 }, elevation: 2, borderRadius: 6 }),
      ]),
    ], { modifier: M.mod().fillMaxWidth().padding(12), color: AppColors.cardBg, elevation: 2, borderRadius: 8 }),
  ])
}

export const LayoutPageComposable = composable<{}>(LayoutPage)
