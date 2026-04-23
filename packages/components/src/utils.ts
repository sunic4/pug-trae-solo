import { DrawAPI } from '@pug/renderer';

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
