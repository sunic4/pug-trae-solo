import { BoxComponent, TextComponent, ButtonComponent, ColumnComponent, CheckboxComponent } from '@pug/components';
import { useTheme } from '../../hooks/useTheme';
import { signal } from '@pug/reactivity';
import { navigateBack } from '../../state/navigationState';

export function SettingsPage() {
  const theme = useTheme();
  const notificationsEnabled = signal(true);
  const darkModeEnabled = signal(false);

  return BoxComponent({
    width: '100%',
    height: '100%',
    backgroundColor: theme.colors.background,
    padding: 20,
    children: ColumnComponent({
      alignItems: 'flex-start',
      children: [
        TextComponent({
          text: '设置页',
          fontSize: 24,
          fontWeight: 600,
          color: theme.colors.text,
          marginBottom: 20,
        }),
        TextComponent({
          text: '应用设置',
          fontSize: 18,
          fontWeight: 500,
          color: theme.colors.text,
          marginBottom: 15,
        }),
        BoxComponent({
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 15,
          children: [
            TextComponent({
              text: '启用通知',
              fontSize: 16,
              color: theme.colors.text,
              marginRight: 20,
            }),
            CheckboxComponent({
              checked: notificationsEnabled.value,
              onCheckedChange: (checked) => {
                notificationsEnabled.value = checked;
              },
            }),
          ],
        }),
        BoxComponent({
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 30,
          children: [
            TextComponent({
              text: '深色模式',
              fontSize: 16,
              color: theme.colors.text,
              marginRight: 20,
            }),
            CheckboxComponent({
              checked: darkModeEnabled.value,
              onCheckedChange: (checked) => {
                darkModeEnabled.value = checked;
              },
            }),
          ],
        }),
        ButtonComponent({
          text: '保存设置',
          onClick: () => {
            console.log('保存设置:', {
              notifications: notificationsEnabled.value,
              darkMode: darkModeEnabled.value,
            });
          },
          padding: 15,
          backgroundColor: theme.colors.primary,
          color: theme.colors.onPrimary,
          marginBottom: 15,
        }),
        ButtonComponent({
          text: '返回首页',
          onClick: () => {
            console.log('点击返回按钮');
            navigateBack();
          },
          padding: 15,
          backgroundColor: theme.colors.secondary,
          color: theme.colors.onSecondary,
        }),
      ],
    }),
  });
}
