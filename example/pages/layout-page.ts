import { composable } from './index'
import type { CompositionContext } from './index'
import { Column, Row, Box, Surface, Modifier, M, AppColors } from './index'

function LayoutPage(ctx: CompositionContext, _props?: Record<string, never>): void {
  Column(ctx, Modifier.create().padding(12).fillMaxSize().freeze(), 'start', 'start', () => {
    M.heading(ctx, '布局系统', 22)
    M.body(ctx, 'Column / Row / Box / Surface 组合展示', 13)
    M.spacer(ctx, 16)

    M.card(ctx, () => {
      M.body(ctx, 'Column — 垂直排列', 14)
      M.spacer(ctx, 10)
      Column(ctx, Modifier.create().freeze(), 'start', 'start', () => {
        Box(ctx, Modifier.create().background(AppColors.primary).layoutSize(200, 36).freeze(), 'center', () => {
          M.body(ctx, 'Item 1 (顶部对齐)', undefined, { color: AppColors.onPrimary })
        })
        M.spacer(ctx, 6)
        Box(ctx, Modifier.create().background(AppColors.success).layoutSize(200, 36).freeze(), 'center', () => {
          M.body(ctx, 'Item 2 (绿色)', undefined, { color: AppColors.onPrimary })
        })
        M.spacer(ctx, 6)
        Box(ctx, Modifier.create().background(AppColors.warning).layoutSize(200, 36).freeze(), 'center', () => {
          M.body(ctx, 'Item 3 (橙色)')
        })
      })
    }, { elevation: 2, padding: 12 })
    M.spacer(ctx, 12)

    M.card(ctx, () => {
      M.body(ctx, 'Column — 不同 Arrangement', 14)
      M.spacer(ctx, 10)

      Column(ctx, Modifier.create().freeze(), 'center', 'start', () => {
        M.caption(ctx, 'center')
        Row(ctx, Modifier.create().freeze(), 'center', 'center', () => {
          Box(ctx, Modifier.create().background({ r: 156, g: 39, b: 176, a: 1 }).layoutSize(50, 28).freeze(), 'center', () => {
            M.caption(ctx, 'A', 11, { color: AppColors.onPrimary })
          })
          M.gap(ctx, 4)
          Box(ctx, Modifier.create().background({ r: 0, g: 150, b: 136, a: 1 }).layoutSize(50, 28).freeze(), 'center', () => {
            M.caption(ctx, 'B', 11, { color: AppColors.onPrimary })
          })
        })
      })

      M.spacer(ctx, 8)
      Column(ctx, Modifier.create().freeze(), 'end', 'start', () => {
        M.caption(ctx, 'end')
        Row(ctx, Modifier.create().freeze(), 'end', 'center', () => {
          Box(ctx, Modifier.create().background({ r: 255, g: 112, b: 67, a: 1 }).layoutSize(50, 28).freeze(), 'center', () => {
            M.caption(ctx, 'C', 11, { color: AppColors.onPrimary })
          })
          M.gap(ctx, 4)
          Box(ctx, Modifier.create().background({ r: 244, g: 67, b: 54, a: 1 }).layoutSize(50, 28).freeze(), 'center', () => {
            M.caption(ctx, 'D', 11, { color: AppColors.onPrimary })
          })
        })
      })

      M.spacer(ctx, 8)
      Column(ctx, Modifier.create().freeze(), 'spaceBetween', 'start', () => {
        M.caption(ctx, 'spaceBetween')
        Box(ctx, Modifier.create().background(AppColors.primary).layoutSize(104, 28).freeze(), 'center', () => {
          M.caption(ctx, 'Top', 11, { color: AppColors.onPrimary })
        })
        Box(ctx, Modifier.create().background(AppColors.success).layoutSize(104, 28).freeze(), 'center', () => {
          M.caption(ctx, 'Bottom', 11, { color: AppColors.onPrimary })
        })
      })
    }, { elevation: 2, padding: 12 })
    M.spacer(ctx, 12)

    M.card(ctx, () => {
      M.body(ctx, 'Row — 水平排列', 14)
      M.spacer(ctx, 10)

      Column(ctx, Modifier.create().freeze(), 'start', 'start', () => {
        M.caption(ctx, 'start alignment')
        M.spacer(ctx, 4)
        Row(ctx, Modifier.create().freeze(), 'start', 'center', () => {
          Box(ctx, Modifier.create().background({ r: 33, g: 150, b: 243, a: 1 }).layoutSize(46, 32).freeze(), 'center', () => {
            M.caption(ctx, '1', 11, { color: AppColors.onPrimary })
          })
          M.gap(ctx, 4)
          Box(ctx, Modifier.create().background({ r: 76, g: 175, b: 80, a: 1 }).layoutSize(46, 32).freeze(), 'center', () => {
            M.caption(ctx, '2', 11, { color: AppColors.onPrimary })
          })
          M.gap(ctx, 4)
          Box(ctx, Modifier.create().background({ r: 255, g: 152, b: 0, a: 1 }).layoutSize(46, 32).freeze(), 'center', () => {
            M.caption(ctx, '3', 11)
          })
        })
      })

      M.spacer(ctx, 8)
      Column(ctx, Modifier.create().freeze(), 'start', 'start', () => {
        M.caption(ctx, 'spaceBetween + center')
        M.spacer(ctx, 4)
        Row(ctx, Modifier.create().freeze(), 'spaceBetween', 'center', () => {
          Box(ctx, Modifier.create().background({ r: 156, g: 39, b: 176, a: 1 }).layoutSize(52, 32).freeze(), 'center', () => {
            M.caption(ctx, 'Left', 11, { color: AppColors.onPrimary })
          })
          Box(ctx, Modifier.create().background({ r: 0, g: 150, b: 136, a: 1 }).layoutSize(52, 32).freeze(), 'center', () => {
            M.caption(ctx, 'Right', 11, { color: AppColors.onPrimary })
          })
        })
      })
    }, { elevation: 2, padding: 12 })
    M.spacer(ctx, 12)

    M.card(ctx, () => {
      M.body(ctx, 'Box — 叠加/居中容器', 14)
      M.spacer(ctx, 10)
      Row(ctx, Modifier.create().freeze(), 'start', 'center', () => {
        Column(ctx, Modifier.create().freeze(), 'start', 'start', () => {
          M.caption(ctx, 'start')
          M.spacer(ctx, 2)
          Box(ctx, Modifier.create().background(AppColors.sectionBg).layoutSize(90, 32).freeze(), 'start', () => {
            M.caption(ctx, 'S ←', 11)
          })
        })
        M.gap(ctx, 8)
        Column(ctx, Modifier.create().freeze(), 'start', 'start', () => {
          M.caption(ctx, 'center')
          M.spacer(ctx, 2)
          Box(ctx, Modifier.create().background(AppColors.sectionBg).layoutSize(90, 32).freeze(), 'center', () => {
            M.caption(ctx, '← C →', 11)
          })
        })
        M.gap(ctx, 8)
        Column(ctx, Modifier.create().freeze(), 'start', 'start', () => {
          M.caption(ctx, 'end')
          M.spacer(ctx, 2)
          Box(ctx, Modifier.create().background(AppColors.sectionBg).layoutSize(90, 32).freeze(), 'end', () => {
            M.caption(ctx, '→ E', 11)
          })
        })
      })
    }, { elevation: 2, padding: 12 })
    M.spacer(ctx, 12)

    M.card(ctx, () => {
      M.body(ctx, 'Surface 样式变体', 14)
      M.spacer(ctx, 10)
      Row(ctx, Modifier.create().freeze(), 'center', 'center', () => {
        Surface(ctx, () => {
          M.caption(ctx, 'e=0', 11)
        }, { modifier: Modifier.create().layoutSize(64, 44).padding(6).freeze(), color: { r: 227, g: 242, b: 253, a: 1 }, elevation: 0, borderRadius: 6 })
        M.gap(ctx, 8)
        Surface(ctx, () => {
          M.caption(ctx, 'e=2', 11)
        }, { modifier: Modifier.create().layoutSize(64, 44).padding(6).freeze(), color: { r: 255, g: 243, b: 224, a: 1 }, elevation: 2, borderRadius: 6 })
        M.gap(ctx, 8)
        Surface(ctx, () => {
          M.caption(ctx, 'e=4', 11)
        }, { modifier: Modifier.create().layoutSize(64, 44).padding(6).freeze(), color: { r: 232, g: 245, b: 233, a: 1 }, elevation: 4, borderRadius: 6 })
        M.gap(ctx, 8)
        Surface(ctx, () => {
          M.caption(ctx, 'r=16', 11)
        }, { modifier: Modifier.create().layoutSize(64, 44).padding(6).freeze(), color: { r: 252, g: 228, b: 236, a: 1 }, elevation: 2, borderRadius: 16 })
      })
    }, { elevation: 2, padding: 12 })
    M.spacer(ctx, 12)

    M.card(ctx, () => {
      M.body(ctx, '嵌套布局 — Column > Row > Box', 14)
      M.spacer(ctx, 10)
      Column(ctx, Modifier.create().freeze(), 'start', 'start', () => {
        for (let i = 0; i < 3; i++) {
          const colors = [AppColors.primary, AppColors.success, AppColors.warning]
          const labels = ['第一行', '第二行', '第三行']
          Row(ctx, Modifier.create().fillMaxWidth().freeze(), 'spaceBetween', 'center', () => {
            M.body(ctx, labels[i] ?? '', 13)
            Row(ctx, Modifier.create().freeze(), 'center', 'center', () => {
              Box(ctx, Modifier.create().background(colors[i] ?? AppColors.primary).layoutSize(40, 24).freeze(), 'center', () => {
                M.caption(ctx, `${i + 1}A`, 10, { color: AppColors.onPrimary })
              })
              M.gap(ctx, 4)
              Box(ctx, Modifier.create().background(colors[i] ?? AppColors.primary).layoutSize(40, 24).freeze(), 'center', () => {
                M.caption(ctx, `${i + 1}B`, 10, { color: AppColors.onPrimary })
              })
              M.gap(ctx, 4)
              Box(ctx, Modifier.create().background(colors[i] ?? AppColors.primary).layoutSize(40, 24).freeze(), 'center', () => {
                M.caption(ctx, `${i + 1}C`, 10, { color: AppColors.onPrimary })
              })
            })
          })
          if (i < 2) M.spacer(ctx, 6)
        }
      })
    }, { elevation: 2, padding: 12 })
    M.spacer(ctx, 12)

    M.card(ctx, () => {
      M.body(ctx, 'Modifier 链式调用', 14)
      M.spacer(ctx, 10)
      Column(ctx, Modifier.create().freeze(), 'start', 'start', () => {
        M.caption(ctx, 'fillMaxWidth + padding(16)')
        M.spacer(ctx, 4)
        Box(ctx, Modifier.create().fillMaxWidth().padding(16).background(AppColors.primary, 8).freeze(), 'start', () => {
          M.caption(ctx, '全宽 + 内边距 + 圆角背景', 11, { color: AppColors.onPrimary })
        })
        M.spacer(ctx, 8)
        M.caption(ctx, 'size(120, 40) + background')
        M.spacer(ctx, 4)
        Box(ctx, Modifier.create().layoutSize(120, 40).background(AppColors.success, 6).freeze(), 'center', () => {
          M.caption(ctx, '固定尺寸', 11, { color: AppColors.onPrimary })
        })
        M.spacer(ctx, 8)
        M.caption(ctx, 'fillMaxWidth + height(36) + background')
        M.spacer(ctx, 4)
        Box(ctx, Modifier.create().fillMaxWidth().setHeight(36).background(AppColors.warning, 6).freeze(), 'center', () => {
          M.caption(ctx, '全宽 + 固定高度', 11)
        })
      })
    }, { elevation: 2, padding: 12 })
  })
}

export const LayoutPageComposable = composable<Record<string, never>>(LayoutPage)
