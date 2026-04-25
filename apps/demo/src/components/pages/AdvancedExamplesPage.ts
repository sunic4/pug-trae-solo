import { BoxComponent, TextComponent, ButtonComponent, ColumnComponent, RowComponent, TextInputComponent, CheckboxComponent } from '@pug/components';
import { useTheme } from '../../hooks/useTheme';
import { signal, computed, effect } from '@pug/reactivity';

export function AdvancedExamplesPage() {
  const theme = useTheme();

  // 表单处理示例
  const formData = signal({
    name: '',
    email: '',
    age: '',
    agree: false,
  });

  const formValid = computed(() => {
    return (
      formData.value.name !== '' &&
      formData.value.email.includes('@') &&
      formData.value.age !== '' &&
      formData.value.agree
    );
  });

  // 动画效果示例
  const animationProgress = signal(0);
  const animationDirection = signal(1);

  effect(() => {
    const interval = setInterval(() => {
      animationProgress.value += 0.01 * animationDirection.value;
      if (animationProgress.value >= 1) {
        animationDirection.value = -1;
      }
      if (animationProgress.value <= 0) {
        animationDirection.value = 1;
      }
    }, 16);
    return undefined;
  });

  // 状态管理示例
  const counter = signal(0);
  const doubleCounter = computed(() => counter.value * 2);
  const tripleCounter = computed(() => counter.value * 3);

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
          text: '高级示例',
          fontSize: 28,
          fontWeight: 600,
          color: theme.colors.text,
        }),

        // 表单处理示例
        BoxComponent({
          padding: 16,
          backgroundColor: theme.colors.surface,
          borderRadius: 12,
          children: ColumnComponent({
            spacing: 12,
            children: [
              TextComponent({
                text: '表单处理示例',
                fontSize: 20,
                fontWeight: 500,
                color: theme.colors.text,
              }),
              TextInputComponent({
                value: formData.value.name,
                onValueChange: (value) => {
                  formData.value = { ...formData.value, name: value };
                },
                placeholder: '请输入姓名',
                width: 400,
                padding: 12,
                backgroundColor: theme.colors.background,
                border: `1px solid ${theme.colors.border}`,

              }),
              TextInputComponent({
                value: formData.value.email,
                onValueChange: (value) => {
                  formData.value = { ...formData.value, email: value };
                },
                placeholder: '请输入邮箱',
                width: 400,
                padding: 12,
                backgroundColor: theme.colors.background,
                border: `1px solid ${theme.colors.border}`,

              }),
              TextInputComponent({
                value: formData.value.age,
                onValueChange: (value) => {
                  formData.value = { ...formData.value, age: value };
                },
                placeholder: '请输入年龄',
                width: 400,
                padding: 12,
                backgroundColor: theme.colors.background,
                border: `1px solid ${theme.colors.border}`,

              }),
              RowComponent({
                alignItems: 'center',
                spacing: 8,
                children: [
                  CheckboxComponent({
                    checked: formData.value.agree,
                    onCheckedChange: (value) => {
                      formData.value = { ...formData.value, agree: value };
                    },
                  }),
                  TextComponent({
                    text: '我同意条款和条件',
                    fontSize: 14,
                    color: theme.colors.text,
                  }),
                ],
              }),
              ButtonComponent({
                text: '提交表单',
                onClick: () => {
                  alert('表单提交成功！');
                },
                disabled: !formValid.value,
                padding: 12,
                backgroundColor: formValid.value ? theme.colors.primary : theme.colors.disabled,
                color: theme.colors.onPrimary,

              }),
            ],
          }),
        }),

        // 动画效果示例
        BoxComponent({
          padding: 16,
          backgroundColor: theme.colors.surface,
          borderRadius: 12,
          children: ColumnComponent({
            spacing: 12,
            children: [
              TextComponent({
                text: '动画效果示例',
                fontSize: 20,
                fontWeight: 500,
                color: theme.colors.text,
              }),
              BoxComponent({
                width: 400,
                height: 100,
                backgroundColor: theme.colors.background,

                children: BoxComponent({
                  width: 50,
                  height: 50,
                  x: animationProgress.value * 300,
                  y: 25,
                  backgroundColor: theme.colors.primary,
                  borderRadius: 25,
                }),
              }),
              TextComponent({
                text: '这是一个简单的动画效果，使用信号和副作用实现',
                fontSize: 14,
                color: theme.colors.textSecondary,
              }),
            ],
          }),
        }),

        // 复杂布局示例
        BoxComponent({
          padding: 16,
          backgroundColor: theme.colors.surface,
          borderRadius: 12,
          children: ColumnComponent({
            spacing: 12,
            children: [
              TextComponent({
                text: '复杂布局示例',
                fontSize: 20,
                fontWeight: 500,
                color: theme.colors.text,
              }),
              BoxComponent({
                width: 400,
                height: 200,
                backgroundColor: theme.colors.background,

                padding: 12,
                children: RowComponent({
                  spacing: 12,
                  children: [
                    BoxComponent({

                      backgroundColor: theme.colors.primary,
      
                      padding: 12,
                      children: TextComponent({
                        text: '左侧面板',
                        color: theme.colors.onPrimary,
                        textAlign: 'center',
                      }),
                    }),
                    ColumnComponent({

                      spacing: 12,
                      children: [
                        BoxComponent({
    
                          backgroundColor: theme.colors.secondary,
          
                          padding: 12,
                          children: TextComponent({
                            text: '顶部面板',
                            color: theme.colors.onSecondary,
                            textAlign: 'center',
                          }),
                        }),
                        BoxComponent({
    
                          backgroundColor: theme.colors.primary,
                          padding: 12,
                          children: TextComponent({
                            text: '底部面板',
                            color: theme.colors.onPrimary,
                            textAlign: 'center',
                          }),
                        }),
                      ],
                    }),
                  ],
                }),
              }),
              TextComponent({
                text: '这是一个复杂的布局示例，使用嵌套的Row和Column组件',
                fontSize: 14,
                color: theme.colors.textSecondary,
              }),
            ],
          }),
        }),

        // 状态管理示例
        BoxComponent({
          padding: 16,
          backgroundColor: theme.colors.surface,
          borderRadius: 12,
          children: ColumnComponent({
            spacing: 12,
            children: [
              TextComponent({
                text: '状态管理示例',
                fontSize: 20,
                fontWeight: 500,
                color: theme.colors.text,
              }),
              RowComponent({
                justifyContent: 'center',
                spacing: 16,
                children: [
                  ButtonComponent({
                    text: '-',
                    onClick: () => counter.value--,
                    padding: 12,
                    backgroundColor: theme.colors.secondary,
                    color: theme.colors.onSecondary,
    
                  }),
                  TextComponent({
                    text: `计数器: ${counter.value}`,
                    fontSize: 24,
                    fontWeight: 600,
                    color: theme.colors.text,
                  }),
                  ButtonComponent({
                    text: '+',
                    onClick: () => counter.value++,
                    padding: 12,
                    backgroundColor: theme.colors.primary,
                    color: theme.colors.onPrimary,
    
                  }),
                ],
              }),
              RowComponent({
                justifyContent: 'space-around',
                children: [
                  TextComponent({
                    text: `双倍: ${doubleCounter.value}`,
                    fontSize: 16,
                    color: theme.colors.textSecondary,
                  }),
                  TextComponent({
                    text: `三倍: ${tripleCounter.value}`,
                    fontSize: 16,
                    color: theme.colors.textSecondary,
                  }),
                ],
              }),
              TextComponent({
                text: '这是一个状态管理示例，使用信号和计算信号实现',
                fontSize: 14,
                color: theme.colors.textSecondary,
              }),
            ],
          }),
        }),
      ],
    }),
  });
}