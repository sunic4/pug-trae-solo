#!/usr/bin/env node

// 这个文件用于测试 signal 和 effect 系统是否正常工作
// 使用 Node.js 来运行，不需要浏览器

console.log('[TEST] Starting Node.js test...');

// 先构建项目，确保我们可以导入 JavaScript 文件
// 不过，为了简单，我们直接在这个文件中复制我们的 signal 和 effect 代码

// --- 复制我们的 signal 和 effect 代码 ---

// 依赖栈
let dependencyStack = [];

// signal 函数
function signal(initialValue) {
  const subscribers = new Set();
  const addedCallbacks = new WeakSet();
  let value = initialValue;

  const sig = {
    get value() {
      console.log('[SIGNAL] Getting value:', value);
      if (dependencyStack.length > 0) {
        const currentTrackers = dependencyStack[dependencyStack.length - 1];
        console.log('[SIGNAL] Adding trackers:', currentTrackers.size, 'trackers');
        currentTrackers.forEach(callback => {
          if (!addedCallbacks.has(callback)) {
            subscribers.add(callback);
            addedCallbacks.add(callback);
            console.log('[SIGNAL] Added new callback to subscribers');
          }
        });
      }
      return value;
    },
    set value(newValue) {
      console.log('[SIGNAL] Setting value from', value, 'to', newValue);
      value = newValue;
      console.log('[SIGNAL] Notifying', subscribers.size, 'subscribers');
      subscribers.forEach(callback => callback());
    }
  };

  return sig;
}

// trackDependencies 函数
function trackDependencies(fn, onDependencyChange) {
  const trackers = new Set();
  trackers.add(onDependencyChange);
  dependencyStack.push(trackers);

  try {
    console.log('[TRACK] Starting dependency tracking');
    fn();
  } finally {
    dependencyStack.pop();
    console.log('[TRACK] Ended dependency tracking');
  }
}

// effect 函数
function effect(fn) {
  let cleanup = null;
  
  const runEffect = () => {
    if (cleanup) {
      cleanup();
    }
    console.log('[EFFECT] Running effect');
    trackDependencies(fn, runEffect);
  };
  
  runEffect();
  
  return {
    dispose: () => {
      if (cleanup) {
        cleanup();
        cleanup = null;
      }
    }
  };
}

// --- 测试代码 ---

console.log('\n[TEST] Creating signal...');
const testSignal = signal({ currentPage: 'home' });
console.log('[TEST] Initial signal value:', testSignal.value);

console.log('\n[TEST] Creating effect...');
effect(() => {
  console.log('[EFFECT] Effect is executing');
  const { currentPage } = testSignal.value;
  console.log('[EFFECT] Current page:', currentPage);
});

console.log('\n[TEST] Changing signal value...');
setTimeout(() => {
  testSignal.value = { currentPage: 'details' };
  console.log('[TEST] Signal value after change:', testSignal.value);
  
  setTimeout(() => {
    console.log('\n[TEST] Changing signal value again...');
    testSignal.value = { currentPage: 'settings' };
    console.log('[TEST] Signal value after second change:', testSignal.value);
  }, 1000);
}, 1000);
