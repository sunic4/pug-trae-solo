import { BoxComponent, TextComponent, ButtonComponent, ColumnComponent, RowComponent, CheckboxComponent, TextInputComponent } from '@pug/components';
import { useTheme } from '../../hooks/useTheme';
import { navigateTo } from '../../state/navigationState';
import { signal } from '@pug/reactivity';

export function HomePage() {
  const theme = useTheme();
  
  // 状态管理
  const checkboxChecked = signal(false);
  const textInputValue = signal('');

  return BoxComponent({
    width: '100%',
    height: '100%',
    backgroundColor: theme.colors.background,
    padding: 20,
    children: ColumnComponent({
      alignItems: 'flex-start',
      spacing: 20,
      children: [
        // 页面标题
        TextComponent({
          text: '组件示例展示',
          fontSize: 28,
          fontWeight: 600,
          color: theme.colors.text,
        }),
        
        // 文本组件示例
        BoxComponent({
          width: '100%',
          padding: 15,
          backgroundColor: theme.colors.surface,
          borderRadius: 8,
          children: ColumnComponent({
            children: [
              TextComponent({
                text: 'Text 组件示例',
                fontSize: 18,
                fontWeight: 500,
                color: theme.colors.text,
                marginBottom: 10,
              }),
              TextComponent({
                text: '普通文本',
                fontSize: 16,
                color: theme.colors.text,
                marginBottom: 5,
              }),
              TextComponent({
                text: '粗体文本',
                fontSize: 16,
                fontWeight: 600,
                color: theme.colors.text,
              }),
            ],
          }),
        }),
        
        // 按钮组件示例
        BoxComponent({
          width: '100%',
          padding: 15,
          backgroundColor: theme.colors.surface,
          borderRadius: 8,
          children: ColumnComponent({
            children: [
              TextComponent({
                text: 'Button 组件示例',
                fontSize: 18,
                fontWeight: 500,
                color: theme.colors.text,
                marginBottom: 10,
              }),
              RowComponent({
                spacing: 10,
                children: [
                  ButtonComponent({
                    text: '主要按钮',
                    variant: 'primary',
                    onClick: () => {
                      console.log('主要按钮点击');
                      alert('主要按钮被点击了！');
                    },
                  }),
                  ButtonComponent({
                    text: '次要按钮',
                    variant: 'secondary',
                    onClick: () => {
                      console.log('次要按钮点击');
                      alert('次要按钮被点击了！');
                    },
                  }),
                ],
              }),
            ],
          }),
        }),
        
        // 复选框组件示例
        BoxComponent({
          width: '100%',
          padding: 15,
          backgroundColor: theme.colors.surface,
          borderRadius: 8,
          children: ColumnComponent({
            children: [
              TextComponent({
                text: 'Checkbox 组件示例',
                fontSize: 18,
                fontWeight: 500,
                color: theme.colors.text,
                marginBottom: 10,
              }),
              RowComponent({
                alignItems: 'center',
                spacing: 10,
                children: [
                  CheckboxComponent({
                    checked: checkboxChecked.value,
                    onCheckedChange: (checked) => {
                      checkboxChecked.value = checked;
                      console.log('复选框状态：', checked);
                    },
                  }),
                  TextComponent({
                    text: `复选框: ${checkboxChecked.value ? '选中' : '未选中'}`,
                    fontSize: 16,
                    color: theme.colors.text,
                  }),
                ],
              }),
            ],
          }),
        }),
        
        // 文本输入组件示例
        BoxComponent({
          width: '100%',
          padding: 15,
          backgroundColor: theme.colors.surface,
          borderRadius: 8,
          children: ColumnComponent({
            children: [
              TextComponent({
                text: 'TextInput 组件示例',
                fontSize: 18,
                fontWeight: 500,
                color: theme.colors.text,
                marginBottom: 10,
              }),
              TextInputComponent({
                value: textInputValue.value,
                onValueChange: (value: string) => {
                  textInputValue.value = value;
                  console.log('输入值变化：', value);
                },
                placeholder: '请输入文本...',
                width: 300,
              }),
              TextComponent({
                text: `输入内容: ${textInputValue.value}`,
                fontSize: 16,
                color: theme.colors.text,
                marginTop: 10,
              }),
            ],
          }),
        }),
        
        // 布局组件示例
        BoxComponent({
          width: '100%',
          padding: 15,
          backgroundColor: theme.colors.surface,
          borderRadius: 8,
          children: ColumnComponent({
            children: [
              TextComponent({
                text: '布局组件示例',
                fontSize: 18,
                fontWeight: 500,
                color: theme.colors.text,
                marginBottom: 10,
              }),
              
              // Row 布局示例
              TextComponent({
                text: 'Row 布局',
                fontSize: 16,
                fontWeight: 500,
                color: theme.colors.text,
                marginBottom: 5,
              }),
              RowComponent({
                spacing: 10,
                children: [
                  BoxComponent({
                    width: 50,
                    height: 50,
                    backgroundColor: theme.colors.primary,
                    borderRadius: 4,
                  }),
                  BoxComponent({
                    width: 50,
                    height: 50,
                    backgroundColor: theme.colors.secondary,
                    borderRadius: 4,
                  }),
                ],
              }),
            ],
          }),
        }),
        
        // 导航按钮
        ButtonComponent({
          text: '前往详情页',
          onClick: () => {
            console.log('导航到详情页');
            navigateTo('details', { message: 'Hello from Home Page!' });
          },
          padding: 15,
          backgroundColor: theme.colors.primary,
          color: theme.colors.onPrimary,
        }),
      ],
    }),
  });
}
