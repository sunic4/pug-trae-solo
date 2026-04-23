import { TextComponent, BoxComponent, CheckboxComponent } from '@pug/components';
import { useTheme } from '../hooks/useTheme';
import { isChecked } from '../state/appState';

// 复选框示例组件
export function CheckboxDemo() {
  const theme = useTheme();

  return BoxComponent({
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    padding: 20,
    children: [
      TextComponent({
        text: 'Checkbox Component',
        fontSize: 18,
        color: theme.colors.text,
        marginBottom: 10,
      }),
      CheckboxComponent({
        checked: isChecked.value,
        onCheckedChange: (checked) => isChecked.value = checked,
        label: 'Check me',
      }),
      BoxComponent({
        height: 10,
      }),
      TextComponent({
        text: `Checked: ${isChecked.value}`,
        fontSize: 14,
        color: theme.colors.textSecondary,
      }),
    ],
  });
}
