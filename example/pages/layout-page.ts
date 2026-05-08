import { composable } from 'pug-canvas-ui'
import type { CompositionContext } from 'pug-canvas-ui'
import { Column, Row, Box, Modifier } from 'pug-canvas-ui'
import { M, AppColors } from '../theme/app-theme'

function LayoutPage(ctx: CompositionContext, _props?: Record<string, never>): void {
  M.stack(ctx, () => {
    M.title(ctx, '布局系统', 22)
    M.caption(ctx, 'Column / Row / Box / Surface 组合展示')
    M.vSpacer(ctx, 16)

    M.card(ctx, () => {
      M.body(ctx, 'Column — 垂直排列')
      M.vSpacer(ctx, 10)
      Column(ctx, Modifier.create().freeze(), 'start', 'start', () => {
        M.coloredBox(ctx, AppColors.primary, { width: 200, height: 36 }, 'center', () => {
          M.body(ctx, 'Item 1 (顶部对齐)', undefined, { color: AppColors.onPrimary })
        })
        M.vSpacer(ctx, 6)
        M.coloredBox(ctx, AppColors.success, { width: 200, height: 36 }, 'center', () => {
          M.body(ctx, 'Item 2 (绿色)', undefined, { color: AppColors.onPrimary })
        })
        M.vSpacer(ctx, 6)
        M.coloredBox(ctx, AppColors.warning, { width: 200, height: 36 }, 'center', () => {
          M.body(ctx, 'Item 3 (橙色)')
        })
      })
    })
    M.vSpacer(ctx, 12)

    M.card(ctx, () => {
      M.body(ctx, 'Column — 不同 Arrangement')
      M.vSpacer(ctx, 10)

      Column(ctx, Modifier.create().freeze(), 'center', 'start', () => {
        M.caption(ctx, 'center')
        Row(ctx, Modifier.create().freeze(), 'center', 'center', () => {
          M.coloredBox(ctx, { r: 156, g: 39, b: 176, a: 1 }, { width: 50, height: 28 }, 'center', () => {
            M.caption(ctx, 'A', 11, { color: AppColors.onPrimary })
          })
          M.gap(ctx, 4)
          M.coloredBox(ctx, { r: 0, g: 150, b: 136, a: 1 }, { width: 50, height: 28 }, 'center', () => {
            M.caption(ctx, 'B', 11, { color: AppColors.onPrimary })
          })
        })
      })

      M.vSpacer(ctx, 8)
      Column(ctx, Modifier.create().freeze(), 'end', 'start', () => {
        M.caption(ctx, 'end')
        Row(ctx, Modifier.create().freeze(), 'end', 'center', () => {
          M.coloredBox(ctx, { r: 255, g: 112, b: 67, a: 1 }, { width: 50, height: 28 }, 'center', () => {
            M.caption(ctx, 'C', 11, { color: AppColors.onPrimary })
          })
          M.gap(ctx, 4)
          M.coloredBox(ctx, { r: 244, g: 67, b: 54, a: 1 }, { width: 50, height: 28 }, 'center', () => {
            M.caption(ctx, 'D', 11, { color: AppColors.onPrimary })
          })
        })
      })

      M.vSpacer(ctx, 8)
      Column(ctx, Modifier.create().freeze(), 'spaceBetween', 'start', () => {
        M.caption(ctx, 'spaceBetween')
        M.coloredBox(ctx, AppColors.primary, { width: 104, height: 28 }, 'center', () => {
          M.caption(ctx, 'Top', 11, { color: AppColors.onPrimary })
        })
        M.coloredBox(ctx, AppColors.success, { width: 104, height: 28 }, 'center', () => {
          M.caption(ctx, 'Bottom', 11, { color: AppColors.onPrimary })
        })
      })
    })
    M.vSpacer(ctx, 12)

    M.card(ctx, () => {
      M.body(ctx, 'Row — 水平排列')
      M.vSpacer(ctx, 10)

      Column(ctx, Modifier.create().freeze(), 'start', 'start', () => {
        M.caption(ctx, 'start alignment')
        M.vSpacer(ctx, 4)
        Row(ctx, Modifier.create().freeze(), 'start', 'center', () => {
          M.coloredBox(ctx, { r: 33, g: 150, b: 243, a: 1 }, { width: 46, height: 32 }, 'center', () => {
            M.caption(ctx, '1', 11, { color: AppColors.onPrimary })
          })
          M.gap(ctx, 4)
          M.coloredBox(ctx, { r: 76, g: 175, b: 80, a: 1 }, { width: 46, height: 32 }, 'center', () => {
            M.caption(ctx, '2', 11, { color: AppColors.onPrimary })
          })
          M.gap(ctx, 4)
          M.coloredBox(ctx, { r: 255, g: 152, b: 0, a: 1 }, { width: 46, height: 32 }, 'center', () => {
            M.caption(ctx, '3', 11)
          })
        })
      })

      M.vSpacer(ctx, 8)
      Column(ctx, Modifier.create().freeze(), 'start', 'start', () => {
        M.caption(ctx, 'spaceBetween + center')
        M.vSpacer(ctx, 4)
        Row(ctx, Modifier.create().freeze(), 'spaceBetween', 'center', () => {
          M.coloredBox(ctx, { r: 156, g: 39, b: 176, a: 1 }, { width: 52, height: 32 }, 'center', () => {
            M.caption(ctx, 'Left', 11, { color: AppColors.onPrimary })
          })
          M.coloredBox(ctx, { r: 0, g: 150, b: 136, a: 1 }, { width: 52, height: 32 }, 'center', () => {
            M.caption(ctx, 'Right', 11, { color: AppColors.onPrimary })
          })
        })
      })
    })
    M.vSpacer(ctx, 12)

    M.card(ctx, () => {
      M.body(ctx, 'Box — 叠加/居中容器')
      M.vSpacer(ctx, 10)
      Row(ctx, Modifier.create().freeze(), 'start', 'center', () => {
        Column(ctx, Modifier.create().freeze(), 'start', 'start', () => {
          M.caption(ctx, 'start')
          M.vSpacer(ctx, 2)
          M.coloredBox(ctx, AppColors.sectionBg, { width: 90, height: 32 }, 'start', () => {
            M.caption(ctx, 'S ←', 11)
          })
        })
        M.gap(ctx, 8)
        Column(ctx, Modifier.create().freeze(), 'start', 'start', () => {
          M.caption(ctx, 'center')
          M.vSpacer(ctx, 2)
          M.coloredBox(ctx, AppColors.sectionBg, { width: 90, height: 32 }, 'center', () => {
            M.caption(ctx, '← C →', 11)
          })
        })
        M.gap(ctx, 8)
        Column(ctx, Modifier.create().freeze(), 'start', 'start', () => {
          M.caption(ctx, 'end')
          M.vSpacer(ctx, 2)
          M.coloredBox(ctx, AppColors.sectionBg, { width: 90, height: 32 }, 'end', () => {
            M.caption(ctx, '→ E', 11)
          })
        })
      })
    })
    M.vSpacer(ctx, 12)

    M.card(ctx, () => {
      M.body(ctx, 'Surface 样式变体')
      M.vSpacer(ctx, 10)
      Row(ctx, Modifier.create().freeze(), 'center', 'center', () => {
        M.coloredBox(ctx, { r: 227, g: 242, b: 253, a: 1 }, { width: 64, height: 44 }, 'center', () => {
          M.caption(ctx, 'e=0', 11)
        })
        M.gap(ctx, 8)
        M.coloredBox(ctx, { r: 255, g: 243, b: 224, a: 1 }, { width: 64, height: 44 }, 'center', () => {
          M.caption(ctx, 'e=2', 11)
        })
        M.gap(ctx, 8)
        M.coloredBox(ctx, { r: 232, g: 245, b: 233, a: 1 }, { width: 64, height: 44 }, 'center', () => {
          M.caption(ctx, 'e=4', 11)
        })
        M.gap(ctx, 8)
        Box(
          ctx,
          Modifier.create()
            .layoutSize(64, 44)
            .background({ r: 252, g: 228, b: 236, a: 1 }, 16)
            .padding(6)
            .freeze(),
          'center',
          () => {
            M.caption(ctx, 'r=16', 11)
          },
        )
      })
    })
    M.vSpacer(ctx, 12)

    M.card(ctx, () => {
      M.body(ctx, '嵌套布局 — Column > Row > Box')
      M.vSpacer(ctx, 10)
      const colors = [AppColors.primary, AppColors.success, AppColors.warning] as const
      const labels = ['第一行', '第二行', '第三行'] as const
      Column(ctx, Modifier.create().freeze(), 'start', 'start', () => {
        for (let i = 0; i < 3; i++) {
          Row(ctx, Modifier.create().fillMaxWidth().freeze(), 'spaceBetween', 'center', () => {
            M.body(ctx, labels[i]!, 13)
            Row(ctx, Modifier.create().freeze(), 'center', 'center', () => {
              M.coloredBox(ctx, colors[i]!, { width: 40, height: 24 }, 'center', () => {
                M.caption(ctx, `${i + 1}A`, 10, { color: AppColors.onPrimary })
              })
              M.gap(ctx, 4)
              M.coloredBox(ctx, colors[i]!, { width: 40, height: 24 }, 'center', () => {
                M.caption(ctx, `${i + 1}B`, 10, { color: AppColors.onPrimary })
              })
              M.gap(ctx, 4)
              M.coloredBox(ctx, colors[i]!, { width: 40, height: 24 }, 'center', () => {
                M.caption(ctx, `${i + 1}C`, 10, { color: AppColors.onPrimary })
              })
            })
          })
          if (i < 2) M.vSpacer(ctx, 6)
        }
      })
    })
    M.vSpacer(ctx, 12)

    M.card(ctx, () => {
      M.body(ctx, 'Modifier 链式调用')
      M.vSpacer(ctx, 10)
      Column(ctx, Modifier.create().freeze(), 'start', 'start', () => {
        M.caption(ctx, 'fillMaxWidth + padding(16)')
        M.vSpacer(ctx, 4)
        Box(
          ctx,
          Modifier.create().fillMaxWidth().padding(16).background(AppColors.primary, 8).freeze(),
          'start',
          () => {
            M.caption(ctx, '全宽 + 内边距 + 圆角背景', 11, { color: AppColors.onPrimary })
          },
        )
        M.vSpacer(ctx, 8)
        M.caption(ctx, 'size(120, 40) + background')
        M.vSpacer(ctx, 4)
        M.coloredBox(ctx, AppColors.success, { width: 120, height: 40 }, 'center', () => {
          M.caption(ctx, '固定尺寸', 11, { color: AppColors.onPrimary })
        })
        M.vSpacer(ctx, 8)
        M.caption(ctx, 'fillMaxWidth + height(36) + background')
        M.vSpacer(ctx, 4)
        Box(
          ctx,
          Modifier.create().fillMaxWidth().setHeight(36).background(AppColors.warning, 6).freeze(),
          'center',
          () => {
            M.caption(ctx, '全宽 + 固定高度', 11)
          },
        )
      })
    })
  })
}

export const LayoutPageComposable = composable<Record<string, never>>(LayoutPage)
