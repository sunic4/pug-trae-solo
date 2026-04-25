import { BoxComponent, TextComponent, ButtonComponent, ColumnComponent, RowComponent } from '@pug/components';
import { useTheme } from '../../hooks/useTheme';
import { navigateTo, Page } from '../../state/navigationState';
import { signal } from '@pug/reactivity';

export function HomePage() {
  const theme = useTheme();
  const showWelcome = signal(true);

  // 组件示例数据
  const componentExamples = [
    { text: '文本组件示例', route: 'details' as Page, params: { page: 'text' }, icon: '📝' },
    { text: '按钮组件示例', route: 'details' as Page, params: { page: 'button' }, icon: '🔘' },
    { text: '复选框组件示例', route: 'details' as Page, params: { page: 'checkbox' }, icon: '☑️' },
    { text: '文本输入组件示例', route: 'details' as Page, params: { page: 'textinput' }, icon: '📱' },
    { text: '布局组件示例', route: 'details' as Page, params: { page: 'layout' }, icon: '📐' },
  ];

  // 功能页面数据
  const featurePages = [
    { text: '功能展示', route: 'features' as Page, icon: '✨' },
    { text: '性能测试', route: 'performance' as Page, icon: '⚡' },
    { text: '测试工具', route: 'testing' as Page, icon: '🧪' },
    { text: '高级示例', route: 'advanced' as Page, icon: '🚀' },
    { text: '设置页面', route: 'settings' as Page, icon: '⚙️' },
  ];

  return BoxComponent({
    width: '100%',
    height: '100%',
    backgroundColor: theme.colors.background,
    padding: 20,
    children: ColumnComponent({
      spacing: 20,
      children: [
        // 欢迎信息
        showWelcome.value ? BoxComponent({
          padding: 20,
          backgroundColor: theme.colors.surface,
          children: ColumnComponent({
            spacing: 12,
            children: [
              TextComponent({
                text: '欢迎使用 Canvas UI 框架',
                fontSize: 24,
                fontWeight: 600,
                color: theme.colors.text,
              }),
              TextComponent({
                text: '这是一个基于 Canvas 的响应式 UI 框架，灵感来源于 Android Compose。',
                fontSize: 16,
                color: theme.colors.textSecondary,
              }),
              ButtonComponent({
                text: '开始探索',
                onClick: () => {
                  showWelcome.value = false;
                },
                padding: 12,
                backgroundColor: theme.colors.primary,
                color: theme.colors.onPrimary,
              }),
            ],
          }),
        }) : null,

        // 页面标题
        TextComponent({
          text: '组件示例导航',
          fontSize: 28,
          fontWeight: 600,
          color: theme.colors.text,
        }),

        // 组件示例按钮
        TextComponent({
          text: '组件示例',
          fontSize: 20,
          fontWeight: 500,
          color: theme.colors.text,
        }),
        BoxComponent({
          padding: 16,
          backgroundColor: theme.colors.surface,
          children: ColumnComponent({
            spacing: 12,
            children: componentExamples.map((example) => {
              return ButtonComponent({
                text: `${example.icon} ${example.text}`,
                onClick: () => {
                  navigateTo(example.route, example.params);
                },
                padding: 15,
                backgroundColor: theme.colors.primary,
                color: theme.colors.onPrimary,
              });
            }),
          }),
        }),

        // 功能页面按钮
        TextComponent({
          text: '功能页面',
          fontSize: 20,
          fontWeight: 500,
          color: theme.colors.text,
        }),
        BoxComponent({
          padding: 16,
          backgroundColor: theme.colors.surface,
          children: RowComponent({
            justifyContent: 'space-around',
            spacing: 12,
            children: featurePages.map((page) => {
              return ButtonComponent({
                text: `${page.icon} ${page.text}`,
                onClick: () => {
                  navigateTo(page.route);
                },
                padding: 12,
                backgroundColor: theme.colors.secondary,
                color: theme.colors.onSecondary,
              });
            }),
          }),
        }),
      ],
    }),
  });
}
