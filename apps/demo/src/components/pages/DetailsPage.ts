import { BoxComponent, TextComponent, ButtonComponent, ColumnComponent } from '@pug/components';
import { useTheme } from '../../hooks/useTheme';
import { navigateBack } from '../../state/navigationState';
import { navigationState } from '../../state/navigationState';

export function DetailsPage() {
  const theme = useTheme();
  const params = navigationState.value.params;

  return BoxComponent({
    width: '100%',
    height: '100%',
    backgroundColor: theme.colors.background,
    padding: 20,
    children: ColumnComponent({
      alignItems: 'center',
      children: [
        TextComponent({
          text: '详情页',
          fontSize: 24,
          fontWeight: 600,
          color: theme.colors.text,
          marginBottom: 20,
        }),
        TextComponent({
          text: '这是一个详情页面',
          fontSize: 16,
          color: theme.colors.text,
          marginBottom: 30,
        }),
        BoxComponent({
          padding: 20,
          backgroundColor: theme.colors.surface,
          borderRadius: 8,
          marginBottom: 30,
          children: TextComponent({
            text: `从首页传递的数据: ${params.message || '无数据'}`,
            fontSize: 14,
            color: theme.colors.text,
          }),
        }),
        ButtonComponent({
          text: '返回首页',
          onClick: navigateBack,
          padding: 15,
          backgroundColor: theme.colors.primary,
          color: theme.colors.onPrimary,
        }),
      ],
    }),
  });
}
