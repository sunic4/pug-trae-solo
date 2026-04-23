import { TextComponent, BoxComponent, ListComponent } from '@pug/components';
import { useTheme } from '../hooks/useTheme';

// 列表示例组件
export function ListDemo() {
  const theme = useTheme();

  // 列表项数据
  const listItems = [
    { key: '1', content: TextComponent({ text: 'Item 1' }) },
    { key: '2', content: TextComponent({ text: 'Item 2' }) },
    { key: '3', content: TextComponent({ text: 'Item 3' }) },
    { key: '4', content: TextComponent({ text: 'Item 4' }) },
    { key: '5', content: TextComponent({ text: 'Item 5' }) },
  ];

  return BoxComponent({
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    padding: 20,
    marginBottom: 20,
    children: [
      TextComponent({
        text: 'List Component',
        fontSize: 18,
        color: theme.colors.text,
        marginBottom: 10,
      }),
      ListComponent({
        items: listItems,
        direction: 'vertical',
        spacing: 10,
        padding: 10,
        height: 150,
      }),
    ],
  });
}
