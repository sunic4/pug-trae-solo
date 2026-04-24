import { BoxComponent, TextComponent, ButtonComponent, ColumnComponent } from '@pug/components';
import { useTheme } from '../../hooks/useTheme';
import { navigateTo } from '../../state/navigationState';

export function HomePage() {
  const theme = useTheme();

  return BoxComponent({
    width: '100%',
    height: '100%',
    backgroundColor: theme.colors.background,
    padding: 20,
    children: ColumnComponent({
      alignItems: 'center',
      spacing: 20,
      children: [
        // 页面标题
        TextComponent({
          text: '组件示例导航',
          fontSize: 28,
          fontWeight: 600,
          color: theme.colors.text,
        }),
        
        // 导航按钮
        ButtonComponent({
          text: '文本组件示例',
          onClick: () => {
            console.log('导航到文本组件示例页');
            navigateTo('details', { page: 'text' });
          },
          padding: 15,
          backgroundColor: theme.colors.primary,
          color: theme.colors.onPrimary,
        }),
        
        ButtonComponent({
          text: '按钮组件示例',
          onClick: () => {
            console.log('导航到按钮组件示例页');
            navigateTo('details', { page: 'button' });
          },
          padding: 15,
          backgroundColor: theme.colors.primary,
          color: theme.colors.onPrimary,
        }),
        
        ButtonComponent({
          text: '复选框组件示例',
          onClick: () => {
            console.log('导航到复选框组件示例页');
            navigateTo('details', { page: 'checkbox' });
          },
          padding: 15,
          backgroundColor: theme.colors.primary,
          color: theme.colors.onPrimary,
        }),
        
        ButtonComponent({
          text: '文本输入组件示例',
          onClick: () => {
            console.log('导航到文本输入组件示例页');
            navigateTo('details', { page: 'textinput' });
          },
          padding: 15,
          backgroundColor: theme.colors.primary,
          color: theme.colors.onPrimary,
        }),
        
        ButtonComponent({
          text: '布局组件示例',
          onClick: () => {
            console.log('导航到布局组件示例页');
            navigateTo('details', { page: 'layout' });
          },
          padding: 15,
          backgroundColor: theme.colors.primary,
          color: theme.colors.onPrimary,
        }),
        
        ButtonComponent({
          text: '设置页面',
          onClick: () => {
            console.log('导航到设置页面');
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
