import { BoxComponent, ButtonComponent, RowComponent } from '@pug/components';
import { useTheme } from '../hooks/useTheme';
import { navigateTo, navigateBack } from '../state/navigationState';

export function NavigationBar() {
  const theme = useTheme();

  // 提取常量
  const BUTTON_PADDING = 10;
  const NAV_BAR_HEIGHT = 60;
  const NAV_BAR_PADDING = 10;
  
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

  return BoxComponent({
    width: '100%',
    height: NAV_BAR_HEIGHT,
    backgroundColor: theme.colors.surface,
    borderBottom: `1px solid ${theme.colors.border}`,
    padding: NAV_BAR_PADDING,
    children: RowComponent({
      justifyContent: 'space-around',
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
          ...primaryButtonProps,
          text: '首页',
          onClick: () => navigateTo('home'),
        }),
        ButtonComponent({
          ...primaryButtonProps,
          text: '详情',
          onClick: () => navigateTo('details'),
        }),
        ButtonComponent({
          ...primaryButtonProps,
          text: '设置',
          onClick: () => navigateTo('settings'),
        }),
      ],
    }),
  });
}
