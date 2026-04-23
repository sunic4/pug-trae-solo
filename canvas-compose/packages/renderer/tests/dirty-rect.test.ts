import { describe, it, expect } from 'vitest';
import { mergeDirtyRects, rectsOverlap, mergeTwoRects, DirtyRect } from '../src/dirty-rect.js';

describe('dirty-rect', () => {
  it('should check if rects overlap', () => {
    const rect1: DirtyRect = { x: 0, y: 0, w: 100, h: 100 };
    const rect2: DirtyRect = { x: 50, y: 50, w: 100, h: 100 };
    const rect3: DirtyRect = { x: 200, y: 200, w: 50, h: 50 };

    expect(rectsOverlap(rect1, rect2)).toBe(true);
    expect(rectsOverlap(rect1, rect3)).toBe(false);
  });

  it('should merge two rects', () => {
    const rect1: DirtyRect = { x: 0, y: 0, w: 100, h: 100 };
    const rect2: DirtyRect = { x: 50, y: 50, w: 100, h: 100 };
    const merged = mergeTwoRects(rect1, rect2);
    expect(merged).toEqual({ x: 0, y: 0, w: 150, h: 150 });
  });

  it('should merge multiple overlapping rects', () => {
    const rects: DirtyRect[] = [
      { x: 0, y: 0, w: 100, h: 100 },
      { x: 50, y: 50, w: 100, h: 100 },
      { x: 150, y: 150, w: 50, h: 50 }
    ];
    const merged = mergeDirtyRects(rects);
    expect(merged).toHaveLength(1);
    expect(merged[0]).toEqual({ x: 0, y: 0, w: 200, h: 200 });
  });

  it('should keep non-overlapping rects separate', () => {
    const rects: DirtyRect[] = [
      { x: 0, y: 0, w: 50, h: 50 },
      { x: 200, y: 200, w: 50, h: 50 }
    ];
    const merged = mergeDirtyRects(rects);
    expect(merged).toHaveLength(2);
  });

  it('should return empty array for empty input', () => {
    const merged = mergeDirtyRects([]);
    expect(merged).toEqual([]);
  });
});
