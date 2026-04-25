import { BoxComponent, ButtonComponent, RowComponent, ColumnComponent } from '@pug/components';
import { useTheme } from '../hooks/useTheme';
import { navigateTo, navigateBack, Page } from '../state/navigationState';
import { signal } from '@pug/reactivity';

export function NavigationBar() {
  const theme = useTheme();
  const menuOpen = signal(false);

  // 提取常量
  const BUTTON_PADDING = 10;
  const NAV_BAR_HEIGHT = 60;
  const NAV_BAR_PADDING = 10;
  const DROP_DOWN_HEIGHT = 200;
  
  // 提取按钮配置
  const primaryButtonProps = {
    padding: BUTTON_PADDING,
    backgroundColor: theme.colors.primary,
    color: theme.colors.onPrimary,
  };
  
  const secondaryButtonProps = {
    padding: BUTTON_PADDING,
    backgroundColor: theme.colors.secondary,
    color: theme.colors.onSecondary,
  };

  const menuButtonProps = {
    padding: BUTTON_PADDING,
    backgroundColor: theme.colors.surface,
    color: theme.colors.text,
    border: `1px solid ${theme.colors.border}`,
  };

  // 导航项
  const navItems: { text: string; route: Page }[] = [
    { text: '首页', route: 'home' },
    { text: '详情', route: 'details' },
    { text: '设置', route: 'settings' },
    { text: '功能', route: 'features' },
    { text: '性能', route: 'performance' },
    { text: '测试', route: 'testing' },
    { text: '高级示例', route: 'advanced' },
  ];

  return BoxComponent({
    width: '100%',
    height: menuOpen.value ? NAV_BAR_HEIGHT + DROP_DOWN_HEIGHT : NAV_BAR_HEIGHT,
    backgroundColor: theme.colors.surface,
    borderBottom: `1px solid ${theme.colors.border}`,
    padding: NAV_BAR_PADDING,
    children: ColumnComponent({
      children: [
        // 顶部导航栏
        RowComponent({
          justifyContent: 'space-between',
          alignItems: 'center',
          children: [
            ButtonComponent({
              ...secondaryButtonProps,
              text: '返回',
              onClick: () => {
                navigateBack();
              },
            }),
            ButtonComponent({
              ...menuButtonProps,
              text: menuOpen.value ? '关闭菜单' : '菜单',
              onClick: () => {
                menuOpen.value = !menuOpen.value;
              },
            }),
          ],
        }),
        // 下拉菜单
        menuOpen.value ? BoxComponent({
          width: '100%',
          height: DROP_DOWN_HEIGHT,
          backgroundColor: theme.colors.surface,
          padding: NAV_BAR_PADDING,
          children: ColumnComponent({
            spacing: 8,
            children: navItems.map((item) => {
              return ButtonComponent({
                ...primaryButtonProps,
                text: item.text,
                onClick: () => {
                  navigateTo(item.route);
                  menuOpen.value = false;
                },
              });
            }),
          }),
        }) : null,
      ],
    }),
  });
}
