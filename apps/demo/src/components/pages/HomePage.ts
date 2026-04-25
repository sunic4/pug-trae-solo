import { BoxComponent, TextComponent, ButtonComponent, ColumnComponent } from '@pug/components';
import { useTheme } from '../../hooks/useTheme';
import { navigateTo } from '../../state/navigationState';
import { AppContext } from '@pug/core';

export function HomePage(appContext: AppContext) {
  const theme = useTheme();

  return BoxComponent({
    appContext,
    width: '100%',
    height: '100%',
    backgroundColor: theme.colors.background,
    padding: 20,
    children: ColumnComponent({
      appContext,
      alignItems: 'center',
      spacing: 20,
      children: [
        // 页面标题
        TextComponent({
          appContext,
          text: '组件示例导航',
          fontSize: 28,
          fontWeight: 600,
          color: theme.colors.text,
        }),
        
        // 导航按钮
        ButtonComponent({
          appContext,
          text: '文本组件示例',
          onClick: () => {
            navigateTo('details', { page: 'text' });
          },
          padding: 15,
          backgroundColor: theme.colors.primary,
          color: theme.colors.onPrimary,
        }),
        
        ButtonComponent({
          appContext,
          text: '按钮组件示例',
          onClick: () => {
            navigateTo('details', { page: 'button' });
          },
          padding: 15,
          backgroundColor: theme.colors.primary,
          color: theme.colors.onPrimary,
        }),
        
        ButtonComponent({
          appContext,
          text: '复选框组件示例',
          onClick: () => {
            navigateTo('details', { page: 'checkbox' });
          },
          padding: 15,
          backgroundColor: theme.colors.primary,
          color: theme.colors.onPrimary,
        }),
        
        ButtonComponent({
          appContext,
          text: '文本输入组件示例',
          onClick: () => {
            navigateTo('details', { page: 'textinput' });
          },
          padding: 15,
          backgroundColor: theme.colors.primary,
          color: theme.colors.onPrimary,
        }),
        
        ButtonComponent({
          appContext,
          text: '布局组件示例',
          onClick: () => {
            navigateTo('details', { page: 'layout' });
          },
          padding: 15,
          backgroundColor: theme.colors.primary,
          color: theme.colors.onPrimary,
        }),
        
        ButtonComponent({
          appContext,
          text: '设置页面',
          onClick: () => {
            navigateTo('settings');
          },
          padding: 15,
          backgroundColor: theme.colors.secondary,
          color: theme.colors.onSecondary,
        }),
      ],
    }),
  });
}
