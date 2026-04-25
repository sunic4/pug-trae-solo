import { BoxComponent, TextComponent, ButtonComponent, ColumnComponent, RowComponent, CheckboxComponent, TextInputComponent, StackComponent } from '@pug/components';
import { useTheme } from '../../hooks/useTheme';
import { navigateBack } from '../../state/navigationState';
import { navigationState } from '../../state/navigationState';
import { signal } from '@pug/reactivity';
import { AppContext } from '@pug/core';

// 示例配置
interface ExampleConfig {
  title: string;
  pageTitle: string;
  content: any[];
}

const examples: Record<string, ExampleConfig> = {
  text: {
    title: 'Text 组件示例',
    pageTitle: '文本组件示例页',
    content: [
      TextComponent({
        text: '普通文本',
        fontSize: 16,
        marginBottom: 5,
      }),
      TextComponent({
        text: '粗体文本',
        fontSize: 16,
        fontWeight: 600,
        marginBottom: 5,
      }),
      TextComponent({
        text: '大字体文本',
        fontSize: 20,
      }),
    ],
  },
  button: {
    title: 'Button 组件示例',
    pageTitle: '按钮组件示例页',
    content: [
      RowComponent({
        spacing: 10,
        children: [
          ButtonComponent({
            text: '主要按钮',
            variant: 'primary',
            onClick: () => {
              alert('主要按钮被点击了！');
            },
          }),
          ButtonComponent({
            text: '次要按钮',
            variant: 'secondary',
            onClick: () => {
              alert('次要按钮被点击了！');
            },
          }),
        ],
      }),
      RowComponent({
        spacing: 10,
        children: [
          ButtonComponent({
            text: '轮廓按钮',
            variant: 'outline',
            onClick: () => {
              alert('轮廓按钮被点击了！');
            },
          }),
          ButtonComponent({
            text: '文本按钮',
            variant: 'text',
            onClick: () => {
              alert('文本按钮被点击了！');
            },
          }),
        ],
      }),
    ],
  },
  layout: {
    title: '布局组件示例',
    pageTitle: '布局组件示例页',
    content: [
      TextComponent({
        text: 'Row 布局',
        fontSize: 16,
        fontWeight: 500,
        marginBottom: 5,
      }),
      RowComponent({
        spacing: 10,
        children: [
          BoxComponent({
            width: 50,
            height: 50,
            borderRadius: 4,
          }),
          BoxComponent({
            width: 50,
            height: 50,
            borderRadius: 4,
          }),
        ],
      }),
      TextComponent({
        text: 'Column 布局',
        fontSize: 16,
        fontWeight: 500,
        marginBottom: 5,
        marginTop: 10,
      }),
      ColumnComponent({
        spacing: 10,
        children: [
          BoxComponent({
            width: 150,
            height: 30,
            borderRadius: 4,
          }),
          BoxComponent({
            width: 150,
            height: 30,
            borderRadius: 4,
          }),
        ],
      }),
      TextComponent({
        text: 'Stack 布局',
        fontSize: 16,
        fontWeight: 500,
        marginBottom: 5,
        marginTop: 10,
      }),
      BoxComponent({
        width: 150,
        height: 150,
        marginBottom: 15,
        children: StackComponent({
          children: [
            BoxComponent({
              width: 150,
              height: 150,
              borderRadius: 4,
            }),
            BoxComponent({
              width: 100,
              height: 100,
              borderRadius: 4,
            }),
            BoxComponent({
              width: 50,
              height: 50,
              borderRadius: 4,
            }),
          ],
        }),
      }),
    ],
  },
};

// 通用示例容器
function ExampleContainer({ appContext, title, children }: { appContext: AppContext; title: string; children: any }) {
  const theme = useTheme();
  return BoxComponent({
    appContext,
    width: '100%',
    padding: 15,
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    children: ColumnComponent({
      appContext,
      children: [
        TextComponent({
          appContext,
          text: title,
          fontSize: 18,
          fontWeight: 500,
          color: theme.colors.text,
          marginBottom: 10,
        }),
        ...children,
      ],
    }),
  });
}

// 处理组件的 appContext 传递
function withAppContext(appContext: AppContext, theme: any, component: any): any {
  if (Array.isArray(component)) {
    return component.map(child => withAppContext(appContext, theme, child));
  }
  if (typeof component === 'object' && component !== null) {
    return {
      ...component,
      appContext,
      color: component.color || theme.colors.text,
      backgroundColor: component.backgroundColor || theme.colors.primary,
    };
  }
  return component;
}

export function DetailsPage(appContext: AppContext) {
  const theme = useTheme();
  const params = navigationState.value.params;
  const pageType = params.page || 'text';
  
  // 状态管理
  const checkboxChecked = signal(false);
  const textInputValue = signal('');

  // 渲染组件示例
  function renderComponentExample() {
    // 对于需要状态的组件，单独处理
    if (pageType === 'checkbox') {
      return ExampleContainer({
        appContext,
        title: 'Checkbox 组件示例',
        children: [
          RowComponent({
            appContext,
            alignItems: 'center',
            spacing: 10,
            children: [
              CheckboxComponent({
                appContext,
                checked: checkboxChecked.value,
                onCheckedChange: (checked) => {
                  checkboxChecked.value = checked;
                },
              }),
              TextComponent({
                appContext,
                text: `复选框: ${checkboxChecked.value ? '选中' : '未选中'}`,
                fontSize: 16,
                color: theme.colors.text,
              }),
            ],
          }),
        ],
      });
    }

    if (pageType === 'textinput') {
      return ExampleContainer({
        appContext,
        title: 'TextInput 组件示例',
        children: [
          TextInputComponent({
            appContext,
            value: textInputValue.value,
            onValueChange: (value: string) => {
              textInputValue.value = value;
            },
            placeholder: '请输入文本...',
            width: 300,
          }),
          TextComponent({
            appContext,
            text: `输入内容: ${textInputValue.value}`,
            fontSize: 16,
            color: theme.colors.text,
            marginTop: 10,
          }),
        ],
      });
    }

    // 对于配置化的组件，使用通用容器
    const example = examples[pageType] || examples.text;
    const children = withAppContext(appContext, theme, example.content);
    
    return ExampleContainer({
      appContext,
      title: example.title,
      children,
    });
  }

  // 获取页面标题
  function getPageTitle() {
    return examples[pageType]?.pageTitle || '组件示例页';
  }

  return BoxComponent({
    appContext,
    width: '100%',
    height: '100%',
    backgroundColor: theme.colors.background,
    padding: 20,
    children: ColumnComponent({
      appContext,
      alignItems: 'flex-start',
      spacing: 20,
      children: [
        TextComponent({
          appContext,
          text: getPageTitle(),
          fontSize: 24,
          fontWeight: 600,
          color: theme.colors.text,
        }),
        
        // 渲染组件示例
        renderComponentExample(),
        
        // 返回按钮
        ButtonComponent({
          appContext,
          text: '返回首页',
          onClick: () => {
            navigateBack();
          },
          padding: 15,
          backgroundColor: theme.colors.primary,
          color: theme.colors.onPrimary,
        }),
      ],
    }),
  });
}
