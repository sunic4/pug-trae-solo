import { signal } from '@pug/reactivity';

// 定义页面类型
export type Page = 'home' | 'details' | 'settings';

// 导航状态接口
interface NavigationState {
  currentPage: Page;
  previousPage: Page | null;
  params: Record<string, any>;
  isAnimating: boolean;
  animationProgress: number;
}

// 创建导航状态
export const navigationState = signal<NavigationState>({
  currentPage: 'home',
  previousPage: null,
  params: {},
  isAnimating: false,
  animationProgress: 0,
});

// 导航到指定页面
export function navigateTo(page: Page, params: Record<string, any> = {}) {
  const currentState = navigationState.value;
  
  // 开始动画
  navigationState.value = {
    ...currentState,
    isAnimating: true,
    animationProgress: 0,
  };
  
  // 执行动画
  animateNavigation(() => {
    navigationState.value = {
      currentPage: page,
      previousPage: currentState.currentPage,
      params,
      isAnimating: false,
      animationProgress: 0,
    };
  });
}

// 导航回上一页
export function navigateBack() {
  const currentState = navigationState.value;
  if (currentState.previousPage) {
    // 开始动画
    navigationState.value = {
      ...currentState,
      isAnimating: true,
      animationProgress: 0,
    };
    
    // 执行动画
    animateNavigation(() => {
      // 导航回上一页时，保持上一个页面的历史记录
      navigationState.value = {
        currentPage: currentState.previousPage!,
        previousPage: null, // 简化处理，只返回一级
        params: {},
        isAnimating: false,
        animationProgress: 0,
      };
    });
  }
}

// 动画函数
function animateNavigation(callback: () => void) {
  let startTime = performance.now();
  const duration = 300; // 动画持续时间（毫秒）
  
  function animate(currentTime: number) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // 更新动画进度
    navigationState.value = {
      ...navigationState.value,
      animationProgress: progress,
    };
    
    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      callback();
    }
  }
  
  requestAnimationFrame(animate);
}
