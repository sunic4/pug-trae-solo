import { composable, useState } from 'pug-canvas-ui'
import type { CompositionContext } from 'pug-canvas-ui'
import { Column, Row, Box, Modifier } from 'pug-canvas-ui'
import { M, AppColors } from '../theme/app-theme'

function NavigationPage(ctx: CompositionContext, _props?: Record<string, never>): void {
  const currentRoute = useState(ctx, '首页')
  const routeHistory = useState<readonly string[]>(ctx, ['首页'])

  const routes = ['首页', '发现', '通知', '我的'] as const
  const routeIcons: Record<string, string> = {
    '首页': '🏠',
    '发现': '🔍',
    '通知': '🔔',
    '我的': '👤',
  }

  const navigate = (route: string) => {
    currentRoute.value = route
    routeHistory.value = [...routeHistory.value, route]
  }

  const goBack = () => {
    if (routeHistory.value.length > 1) {
      const newHistory = [...routeHistory.value]
      newHistory.pop()
      currentRoute.value = newHistory[newHistory.length - 1] ?? '首页'
      routeHistory.value = newHistory
    }
  }

  M.stack(ctx, () => {
    M.title(ctx, '导航系统', 22)
    M.caption(ctx, 'NavController 路由栈管理演示')
    M.vSpacer(ctx, 16)

    M.card(ctx, () => {
      M.body(ctx, '路由栈')
      M.vSpacer(ctx, 10)
      Row(ctx, Modifier.create().fillMaxWidth().freeze(), 'spaceBetween', 'center', () => {
        M.caption(ctx, '当前路由')
        Box(
          ctx,
          Modifier.create().background(AppColors.primary, 12).padding(12, 4).freeze(),
          'center',
          () => {
            M.body(ctx, currentRoute.value, 14, { color: AppColors.onPrimary })
          },
        )
      })
      M.vSpacer(ctx, 8)
      Row(ctx, Modifier.create().fillMaxWidth().freeze(), 'spaceBetween', 'center', () => {
        M.caption(ctx, '栈深度')
        M.body(ctx, `${routeHistory.value.length}`)
      })
    })
    M.vSpacer(ctx, 12)

    M.card(ctx, () => {
      M.body(ctx, '路由导航')
      M.vSpacer(ctx, 10)
      Row(ctx, Modifier.create().fillMaxWidth().freeze(), 'spaceEvenly', 'center', () => {
        for (let i = 0; i < routes.length; i++) {
          const route = routes[i]!
          Box(
            ctx,
            Modifier.create()
              .layoutSize(60, 60)
              .background(currentRoute.value === route ? AppColors.primary : AppColors.sectionBg, 12)
              .freeze(),
            'center',
            () => {
              M.body(ctx, routeIcons[route] ?? '', 20)
            },
          )
          if (i < routes.length - 1) {
            M.gap(ctx, 8)
          }
        }
      })
      M.vSpacer(ctx, 12)
      Column(ctx, Modifier.create().fillMaxWidth().freeze(), 'start', 'start', () => {
        for (let i = 0; i < routes.length; i++) {
          const route = routes[i]!
          Row(
            ctx,
            Modifier.create()
              .fillMaxWidth()
              .background(currentRoute.value === route ? AppColors.primary : { r: 0, g: 0, b: 0, a: 0 })
              .padding(12, 8)
              .freeze(),
            'start',
            'center',
            () => {
              M.body(ctx, routeIcons[route] ?? '', 16)
              M.gap(ctx, 12)
              M.body(ctx, route, 14, currentRoute.value === route ? { color: AppColors.onPrimary } : undefined)
            },
          )
          if (i < routes.length - 1) {
            M.divider(ctx, AppColors.divider, 1)
          }
        }
      })
    })
    M.vSpacer(ctx, 12)

    M.card(ctx, () => {
      M.body(ctx, '路由历史')
      M.vSpacer(ctx, 10)
      M.caption(ctx, '最近访问的页面')
      M.vSpacer(ctx, 8)
      Column(ctx, Modifier.create().fillMaxWidth().freeze(), 'start', 'start', () => {
        const historySlice = routeHistory.value.slice(-5)
        for (let i = 0; i < historySlice.length; i++) {
          const h = historySlice[i]!
          Row(ctx, Modifier.create().fillMaxWidth().freeze(), 'start', 'center', () => {
            M.caption(ctx, `${routeHistory.value.length - historySlice.length + i + 1}.`)
            M.gap(ctx, 8)
            M.body(ctx, h, 13)
          })
          if (i < historySlice.length - 1) {
            M.vSpacer(ctx, 4)
          }
        }
      })
      M.vSpacer(ctx, 12)
      Row(ctx, Modifier.create().freeze(), 'center', 'center', () => {
        M.warningButton(ctx, goBack, '返回')
        M.gap(ctx, 8)
        M.errorButton(ctx, () => { routeHistory.value = ['首页']; currentRoute.value = '首页' }, '重置')
      })
    })
    M.vSpacer(ctx, 12)

    M.card(ctx, () => {
      M.body(ctx, '导航状态')
      M.vSpacer(ctx, 10)
      Row(ctx, Modifier.create().fillMaxWidth().freeze(), 'spaceBetween', 'center', () => {
        M.caption(ctx, 'Can Go Back')
        M.coloredBox(
          ctx,
          routeHistory.value.length > 1 ? AppColors.success : AppColors.divider,
          { width: 60, height: 24 },
          'center',
          () => {
            M.caption(ctx, routeHistory.value.length > 1 ? '是' : '否', 11, { color: AppColors.onPrimary })
          },
        )
      })
    })
    M.vSpacer(ctx, 16)

    M.section(ctx, () => {
      M.body(ctx, '导航系统说明')
      M.vSpacer(ctx, 8)
      M.caption(ctx, 'Pug Canvas UI 导航系统基于 NavController 实现路由栈管理，支持前进、返回等导航操作。')
    })
  })
}

export const NavigationPageComposable = composable<Record<string, never>>(NavigationPage)
