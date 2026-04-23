export interface DirtyRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export function rectsOverlap(a: DirtyRect, b: DirtyRect): boolean {
  return !(a.x + a.w < b.x || b.x + b.w < a.x || a.y + a.h < b.y || b.y + b.h < a.y);
}

export function mergeTwoRects(a: DirtyRect, b: DirtyRect): DirtyRect {
  const x = Math.min(a.x, b.x);
  const y = Math.min(a.y, b.y);
  const x2 = Math.max(a.x + a.w, b.x + b.w);
  const y2 = Math.max(a.y + a.h, b.y + b.h);
  return { x, y, w: x2 - x, h: y2 - y };
}

export function mergeDirtyRects(rects: DirtyRect[]): DirtyRect[] {
  if (rects.length === 0) return [];

  // 简单合并算法：贪心合并重叠矩形
  const result: DirtyRect[] = [...rects];
  let changed = true;
  while (changed) {
    changed = false;
    for (let i = 0; i < result.length; i++) {
      for (let j = i + 1; j < result.length; j++) {
        if (rectsOverlap(result[i], result[j])) {
          result[i] = mergeTwoRects(result[i], result[j]);
          result.splice(j, 1);
          changed = true;
          break;
        }
      }
      if (changed) break;
    }
  }
  return result;
}
