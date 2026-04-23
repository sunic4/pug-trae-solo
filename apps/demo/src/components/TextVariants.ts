import { TextComponent, BoxComponent } from '@pug/components';
import { useTheme } from '../hooks/useTheme';

// 文本变体组件
export function TextVariants() {
  const theme = useTheme();

  return BoxComponent({
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    padding: 20,
    marginBottom: 20,
    children: [
      TextComponent({
        text: 'Text Variants',
        fontSize: 18,
        color: theme.colors.text,
        marginBottom: 10,
      }),
      TextComponent({
        text: 'Regular text',
        fontSize: 16,
        color: theme.colors.text,
        marginBottom: 5,
      }),
      TextComponent({
        text: 'Bold text',
        fontSize: 16,
        fontWeight: 600,
        color: theme.colors.text,
        marginBottom: 5,
      }),
      TextComponent({
        text: 'Secondary text',
        fontSize: 16,
        color: theme.colors.textSecondary,
        marginBottom: 5,
      }),
      TextComponent({
        text: 'Small text',
        fontSize: 14,
        color: theme.colors.text,
      }),
    ],
  });
}
