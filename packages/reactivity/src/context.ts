// 用于跟踪当前 Composable 执行上下文
export let currentContext: any = null;

export function setCurrentContext(context: any): void {
  currentContext = context;
}

export function getCurrentContext(): any {
  return currentContext;
}
