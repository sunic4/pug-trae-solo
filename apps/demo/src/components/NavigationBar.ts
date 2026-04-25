import { BoxComponent, ButtonComponent, RowComponent } from '@pug/components';
import { useTheme } from '../hooks/useTheme';
import { navigateTo, navigateBack } from '../state/navigationState';
import { AppContext } from '@pug/core';

export function NavigationBar(appContext: AppContext) {
  const theme = useTheme();

  return BoxComponent({
    appContext,
    width: '100%',
    height: 60,
    backgroundColor: theme.colors.surface,
    borderBottom: `1px solid ${theme.colors.border}`,
    padding: 10,
    children: RowComponent({
      appContext,
      justifyContent: 'space-around',
      alignItems: 'center',
      children: [
        ButtonComponent({
          appContext,
          text: '返回',
          onClick: () => {
            navigateBack();
          },
          padding: 10,
          backgroundColor: theme.colors.secondary,
          color: theme.colors.onSecondary,
        }),
        ButtonComponent({
          appContext,
          text: '首页',
          onClick: () => navigateTo('home'),
          padding: 10,
          backgroundColor: theme.colors.primary,
          color: theme.colors.onPrimary,
        }),
        ButtonComponent({
          appContext,
          text: '详情',
          onClick: () => navigateTo('details'),
          padding: 10,
          backgroundColor: theme.colors.primary,
          color: theme.colors.onPrimary,
        }),
        ButtonComponent({
          appContext,
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
