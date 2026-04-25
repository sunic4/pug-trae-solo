import { BoxComponent, TextComponent, ButtonComponent, ColumnComponent, RowComponent, CheckboxComponent } from '@pug/components';
import { useTheme } from '../../hooks/useTheme';
import { signal, computed, effect } from '@pug/reactivity';

interface Feature {
  name: string;
  description: string;
  component: () => any;
}

export function FeaturesPage() {
  const theme = useTheme();
  
  // 状态管理示例
  const count = signal(0);
  const doubled = computed(() => count.value * 2);
  
  // 副作用示例
  effect(() => {
    console.log(`Count changed: ${count.value}`);
  });
  
  // 主题切换示例
  const darkMode = signal(false);
  
  const features: Feature[] = [
    {
      name: '响应式状态管理',
      description: '使用Signal和Computed进行状态管理',
      component: () => {
        return BoxComponent({
          padding: 16,
          backgroundColor: theme.colors.surface,
          borderRadius: 8,
          children: ColumnComponent({
            spacing: 12,
            children: [
              TextComponent({
                text: `Count: ${count.value}`,
                fontSize: 16,
                color: theme.colors.text,
              }),
              TextComponent({
                text: `Doubled: ${doubled.value}`,
                fontSize: 16,
                color: theme.colors.textSecondary,
              }),
              RowComponent({
                spacing: 8,
                children: [
                  ButtonComponent({
                    text: 'Increment',
                    onClick: () => count.value++,
                    padding: 8,
                    backgroundColor: theme.colors.primary,
                    color: theme.colors.onPrimary,
                  }),
                  ButtonComponent({
                    text: 'Decrement',
                    onClick: () => count.value--,
                    padding: 8,
                    backgroundColor: theme.colors.secondary,
                    color: theme.colors.onSecondary,
                  }),
                ],
              }),
            ],
          }),
        });
      },
    },
    {
      name: '主题系统',
      description: '支持主题切换和自定义',
      component: () => {
        return BoxComponent({
          padding: 16,
          backgroundColor: theme.colors.surface,
          borderRadius: 8,
          children: RowComponent({
            alignItems: 'center',
            spacing: 12,
            children: [
              TextComponent({
                text: 'Dark Mode',
                fontSize: 16,
                color: theme.colors.text,
              }),
              CheckboxComponent({
                checked: darkMode.value,
                onCheckedChange: (value) => darkMode.value = value,
              }),
            ],
          }),
        });
      },
    },
    {
      name: '插件系统',
      description: '可扩展的插件系统',
      component: () => {
        return BoxComponent({
          padding: 16,
          backgroundColor: theme.colors.surface,
          borderRadius: 8,
          children: TextComponent({
            text: '插件系统允许添加自定义功能',
            fontSize: 16,
            color: theme.colors.text,
          }),
        });
      },
    },
    {
      name: '导航系统',
      description: '完整的导航历史管理',
      component: () => {
        return BoxComponent({
          padding: 16,
          backgroundColor: theme.colors.surface,
          borderRadius: 8,
          children: TextComponent({
            text: '支持前进/后退导航和参数传递',
            fontSize: 16,
            color: theme.colors.text,
          }),
        });
      },
    },
  ];

  return BoxComponent({
    width: '100%',
    height: '100%',
    backgroundColor: theme.colors.background,
    padding: 20,
    children: ColumnComponent({
      spacing: 20,
      children: [
        // 页面标题
        TextComponent({
          text: '新功能展示',
          fontSize: 28,
          fontWeight: 600,
          color: theme.colors.text,
        }),
        
        // 功能列表
        ...features.map((feature) => {
          return ColumnComponent({
            spacing: 8,
            children: [
              TextComponent({
                text: feature.name,
                fontSize: 20,
                fontWeight: 500,
                color: theme.colors.text,
              }),
              TextComponent({
                text: feature.description,
                fontSize: 14,
                color: theme.colors.textSecondary,
              }),
              feature.component(),
            ],
          });
        }),
      ],
    }),
  });
}
