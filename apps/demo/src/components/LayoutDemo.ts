import { TextComponent, BoxComponent, ColumnComponent, RowComponent } from '@pug/components';
import { useTheme } from '../hooks/useTheme';

// 布局示例组件
export function LayoutDemo() {
  const theme = useTheme();

  return BoxComponent({
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    padding: 20,
    marginBottom: 20,
    children: [
      TextComponent({
        text: 'Layout Components',
        fontSize: 18,
        color: theme.colors.text,
        marginBottom: 10,
      }),
      TextComponent({
        text: 'Column Component',
        fontSize: 16,
        fontWeight: 600,
        color: theme.colors.text,
        marginBottom: 5,
      }),
      ColumnComponent({
        padding: 10,
        spacing: 10,
        width: 200,
        children: [
          BoxComponent({
            backgroundColor: theme.colors.primary,
            width: 180,
            height: 40,
            borderRadius: 4,
          }),
          BoxComponent({
            backgroundColor: theme.colors.secondary,
            width: 180,
            height: 40,
            borderRadius: 4,
          }),
          BoxComponent({
            backgroundColor: theme.colors.error,
            width: 180,
            height: 40,
            borderRadius: 4,
          }),
        ],
      }),
      BoxComponent({
        height: 15,
      }),
      TextComponent({
        text: 'Row Component',
        fontSize: 16,
        fontWeight: 600,
        color: theme.colors.text,
        marginBottom: 5,
      }),
      RowComponent({
        padding: 10,
        spacing: 10,
        height: 40,
        children: [
          BoxComponent({
            backgroundColor: theme.colors.primary,
            width: 40,
            height: 40,
            borderRadius: 4,
          }),
          BoxComponent({
            backgroundColor: theme.colors.secondary,
            width: 40,
            height: 40,
            borderRadius: 4,
          }),
          BoxComponent({
            backgroundColor: theme.colors.error,
            width: 40,
            height: 40,
            borderRadius: 4,
          }),
        ],
      }),
    ],
  });
}
