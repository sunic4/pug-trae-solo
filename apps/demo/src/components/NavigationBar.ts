import { BoxComponent, ButtonComponent, RowComponent } from '@pug/components';
import { useTheme } from '../hooks/useTheme';
import { navigateTo, navigateBack } from '../state/navigationState';

export function NavigationBar() {
  const theme = useTheme();

  return BoxComponent({
    width: '100%',
    height: 60,
    backgroundColor: theme.colors.surface,
    borderBottom: `1px solid ${theme.colors.border}`,
    padding: 10,
    children: RowComponent({
      justifyContent: 'space-around',
      alignItems: 'center',
      children: [
        ButtonComponent({
          text: '返回',
          onClick: () => {
            console.log('点击返回按钮');
            navigateBack();
          },
          padding: 10,
          backgroundColor: theme.colors.secondary,
          color: theme.colors.onSecondary,
        }),
        ButtonComponent({
          text: '首页',
          onClick: () => navigateTo('home'),
          padding: 10,
          backgroundColor: theme.colors.primary,
          color: theme.colors.onPrimary,
        }),
        ButtonComponent({
          text: '详情',
          onClick: () => navigateTo('details'),
          padding: 10,
          backgroundColor: theme.colors.primary,
          color: theme.colors.onPrimary,
        }),
        ButtonComponent({
          text: '设置',
          onClick: () => navigateTo('settings'),
          padding: 10,
          backgroundColor: theme.colors.primary,
          color: theme.colors.onPrimary,
        }),
      ],
    }),
  });
}
