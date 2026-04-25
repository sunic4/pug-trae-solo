import { signal } from '@pug/reactivity';

// 定义页面类型
export type Page = 'home' | 'details' | 'settings';

// 导航历史记录项
interface NavigationHistoryItem {
  page: Page;
  params: Record<string, any>;
}

// 导航状态接口
interface NavigationState {
  currentPage: Page;
  previousPage: Page | null;
  params: Record<string, any>;
  isAnimating: boolean;
  animationProgress: number;
  history: NavigationHistoryItem[];
  historyIndex: number;
}

// 导航配置
const NAVIGATION_CONFIG = {
  maxHistoryLength: 50,
  animationDuration: 300,
};

// 创建导航状态
export const navigationState = signal<NavigationState>({
  currentPage: 'home',
  previousPage: null,
  params: {},
  isAnimating: false,
  animationProgress: 0,
  history: [{ page: 'home', params: {} }],
  historyIndex: 0,
});

// 导航到指定页面
export function navigateTo(page: Page, params: Record<string, any> = {}) {
  const currentState = navigationState.value;
  
  // 防止重复导航到同一页面
  if (currentState.currentPage === page && JSON.stringify(currentState.params) === JSON.stringify(params)) {
    return;
  }
  
  // 开始动画
  navigationState.value = {
    ...currentState,
    isAnimating: true,
    animationProgress: 0,
  };
  
  // 执行动画
  animateNavigation(() => {
    // 更新历史记录
    const newHistory = currentState.history.slice(0, currentState.historyIndex + 1);
    newHistory.push({ page, params });
    
    // 限制历史记录长度
    if (newHistory.length > NAVIGATION_CONFIG.maxHistoryLength) {
      newHistory.shift();
    }
    
    navigationState.value = {
      currentPage: page,
      previousPage: currentState.currentPage,
      params,
      isAnimating: false,
      animationProgress: 0,
      history: newHistory,
      historyIndex: newHistory.length - 1,
    };
  });
}

// 导航回上一页
export function navigateBack() {
  const currentState = navigationState.value;
  
  if (currentState.historyIndex > 0) {
    // 开始动画
    navigationState.value = {
      ...currentState,
      isAnimating: true,
      animationProgress: 0,
    };
    
    // 执行动画
    animateNavigation(() => {
      const newIndex = currentState.historyIndex - 1;
      const previousItem = currentState.history[newIndex];
      
      navigationState.value = {
        currentPage: previousItem.page,
        previousPage: currentState.currentPage,
        params: previousItem.params,
        isAnimating: false,
        animationProgress: 0,
        history: currentState.history,
        historyIndex: newIndex,
      };
    });
  }
}

// 导航到下一页
export function navigateForward() {
  const currentState = navigationState.value;
  
  if (currentState.historyIndex < currentState.history.length - 1) {
    // 开始动画
    navigationState.value = {
      ...currentState,
      isAnimating: true,
      animationProgress: 0,
    };
    
    // 执行动画
    animateNavigation(() => {
      const newIndex = currentState.historyIndex + 1;
      const nextItem = currentState.history[newIndex];
      
      navigationState.value = {
        currentPage: nextItem.page,
        previousPage: currentState.currentPage,
        params: nextItem.params,
        isAnimating: false,
        animationProgress: 0,
        history: currentState.history,
        historyIndex: newIndex,
      };
    });
  }
}

// 获取导航历史
export function getNavigationHistory(): NavigationHistoryItem[] {
  return [...navigationState.value.history];
}

// 检查是否可以返回
export function canNavigateBack(): boolean {
  return navigationState.value.historyIndex > 0;
}

// 检查是否可以前进
export function canNavigateForward(): boolean {
  return navigationState.value.historyIndex < navigationState.value.history.length - 1;
}

// 动画函数
let animationFrameId: number | null = null;

function animateNavigation(callback: () => void) {
  // 取消之前的动画，防止动画叠加
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
  
  let startTime = performance.now();
  const duration = NAVIGATION_CONFIG.animationDuration;
  
  function animate(currentTime: number) {
    try {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // 更新动画进度
      navigationState.value = {
        ...navigationState.value,
        animationProgress: progress,
      };
      
      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        animationFrameId = null;
        callback();
      }
    } catch (error) {
      console.error('Error during navigation animation:', error);
      animationFrameId = null;
      callback();
    }
  }
  
  animationFrameId = requestAnimationFrame(animate);
}

// 清理动画
export function cleanupNavigation() {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
}

// 重置导航状态
export function resetNavigation() {
  cleanupNavigation();
  navigationState.value = {
    currentPage: 'home',
    previousPage: null,
    params: {},
    isAnimating: false,
    animationProgress: 0,
    history: [{ page: 'home', params: {} }],
    historyIndex: 0,
  };
}
