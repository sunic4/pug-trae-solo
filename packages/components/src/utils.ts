import { DrawAPI } from '@pug/renderer';
import { AppContext } from '@pug/core';
import { useTheme } from '@pug/theme';

/**
 * 绘制圆角矩形
 * @param drawApi 绘制 API
 * @param x 起始 x 坐标
 * @param y 起始 y 坐标
 * @param width 宽度
 * @param height 高度
 * @param borderRadius 圆角半径
 */
export function drawRoundedRect(
  drawApi: DrawAPI,
  x: number,
  y: number,
  width: number,
  height: number,
  borderRadius: number
): void {
  drawApi.beginPath();
  // 左上角
  drawApi.arc(x + borderRadius, y + borderRadius, borderRadius, Math.PI, Math.PI * 1.5);
  // 右上角
  drawApi.arc(x + width - borderRadius, y + borderRadius, borderRadius, Math.PI * 1.5, Math.PI * 2);
  // 右下角
  drawApi.arc(x + width - borderRadius, y + height - borderRadius, borderRadius, 0, Math.PI * 0.5);
  // 左下角
  drawApi.arc(x + borderRadius, y + height - borderRadius, borderRadius, Math.PI * 0.5, Math.PI);
  drawApi.closePath();
}

/**
 * 从 AppContext 中获取主题
 * @param appContext AppContext 实例
 * @returns 主题对象
 */
export function getThemeFromContext(appContext: AppContext | null) {
  return useTheme(appContext);
}

/**
 * 计算文本宽度
 * @param text 文本内容
 * @param fontSize 字体大小
 * @param fontWeight 字重
 * @param fontFamily 字体家族
 * @returns 文本宽度
 */
export function calculateTextWidth(
  text: string,
  fontSize: number,
  fontWeight: number | string,
  fontFamily: string
): number {
  if (typeof window !== 'undefined' && window.document) {
    // 浏览器环境
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return 0;
    ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
    const metrics = ctx.measureText(text);
    return metrics.width;
  } else {
    // 非浏览器环境，使用估算值
    const averageCharWidth = fontSize * 0.6;
    return text.length * averageCharWidth;
  }
}

/**
 * 计算文本高度
 * @param fontSize 字体大小
 * @param lineHeight 行高
 * @returns 文本高度
 */
export function calculateTextHeight(fontSize: number, lineHeight?: number): number {
  return lineHeight || fontSize * 1.5;
}

/**
 * 调整颜色亮度
 * @param color 颜色值（十六进制）
 * @param amount 调整量（正值变亮，负值变暗）
 * @returns 调整后的颜色值
 */
export function adjustColorBrightness(color: string, amount: number): string {
  // 移除 # 号
  color = color.replace('#', '');
  
  // 解析 RGB 值
  let r = parseInt(color.substring(0, 2), 16);
  let g = parseInt(color.substring(2, 4), 16);
  let b = parseInt(color.substring(4, 6), 16);
  
  // 调整亮度
  r = Math.min(255, Math.max(0, r + amount));
  g = Math.min(255, Math.max(0, g + amount));
  b = Math.min(255, Math.max(0, b + amount));
  
  // 转换回十六进制
  const toHex = (c: number) => {
    const hex = c.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * 计算文本换行后的高度
 * @param text 文本内容
 * @param width 容器宽度
 * @param fontSize 字体大小
 * @param fontWeight 字重
 * @param fontFamily 字体家族
 * @param lineHeight 行高
 * @returns 文本高度
 */
export function calculateWrappedTextHeight(
  text: string,
  width: number,
  fontSize: number,
  fontWeight: number | string,
  fontFamily: string,
  lineHeight?: number
): number {
  const lineHeightValue = lineHeight || fontSize * 1.5;
  
  if (typeof window !== 'undefined' && window.document) {
    // 浏览器环境
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return lineHeightValue;
    ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;

    const words = text.split(' ');
    let lines = 1;
    let currentWidth = 0;

    for (const word of words) {
      const wordWidth = ctx.measureText(word).width;
      if (currentWidth + wordWidth > width) {
        lines++;
        currentWidth = wordWidth + ctx.measureText(' ').width;
      } else {
        currentWidth += wordWidth + ctx.measureText(' ').width;
      }
    }

    return lines * lineHeightValue;
  } else {
    // 非浏览器环境，使用估算值
    const averageCharWidth = fontSize * 0.6;
    const words = text.split(' ');
    let lines = 1;
    let currentWidth = 0;

    for (const word of words) {
      const wordWidth = word.length * averageCharWidth;
      if (currentWidth + wordWidth > width) {
        lines++;
        currentWidth = wordWidth + averageCharWidth; // 空格宽度
      } else {
        currentWidth += wordWidth + averageCharWidth; // 空格宽度
      }
    }

    return lines * lineHeightValue;
  }
}
