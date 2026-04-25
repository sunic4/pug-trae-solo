import { BoxComponent, TextComponent, ButtonComponent, ColumnComponent, CheckboxComponent } from '@pug/components';
import { useTheme } from '../../hooks/useTheme';
import { signal } from '@pug/reactivity';
import { navigateBack } from '../../state/navigationState';
import { AppContext } from '@pug/core';

export function SettingsPage(appContext: AppContext) {
  const theme = useTheme();
  const notificationsEnabled = signal(true);
  const darkModeEnabled = signal(false);

  return BoxComponent({
    appContext,
    width: '100%',
    height: '100%',
    backgroundColor: theme.colors.background,
    padding: 20,
    children: ColumnComponent({
      appContext,
      alignItems: 'flex-start',
      children: [
        TextComponent({
          appContext,
          text: '设置页',
          fontSize: 24,
          fontWeight: 600,
          color: theme.colors.text,
          marginBottom: 20,
        }),
        TextComponent({
          appContext,
          text: '应用设置',
          fontSize: 18,
          fontWeight: 500,
          color: theme.colors.text,
          marginBottom: 15,
        }),
        BoxComponent({
          appContext,
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 15,
          children: [
            TextComponent({
              appContext,
              text: '启用通知',
              fontSize: 16,
              color: theme.colors.text,
              marginRight: 20,
            }),
            CheckboxComponent({
              appContext,
              checked: notificationsEnabled.value,
              onCheckedChange: (checked) => {
                notificationsEnabled.value = checked;
              },
            }),
          ],
        }),
        BoxComponent({
          appContext,
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 30,
          children: [
            TextComponent({
              appContext,
              text: '深色模式',
              fontSize: 16,
              color: theme.colors.text,
              marginRight: 20,
            }),
            CheckboxComponent({
              appContext,
              checked: darkModeEnabled.value,
              onCheckedChange: (checked) => {
                darkModeEnabled.value = checked;
              },
            }),
          ],
        }),
        ButtonComponent({
          appContext,
          text: '保存设置',
          onClick: () => {
            // 保存设置逻辑
          },
          padding: 15,
          backgroundColor: theme.colors.primary,
          color: theme.colors.onPrimary,
          marginBottom: 15,
        }),
        ButtonComponent({
          appContext,
          text: '返回首页',
          onClick: () => {
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
