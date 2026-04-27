import { Page, FrameLocator, Locator } from '@playwright/test';

/**
 * 页面工具函数集合
 */

/**
 * 等待 iframe 加载完成并返回 frameLocator
 */
export async function waitForIframe(page: Page, iframeSelector: string = 'iframe'): Promise<FrameLocator> {
  await page.waitForSelector(iframeSelector, { timeout: 10000 });
  await page.waitForTimeout(2000); // 等待 iframe 内容加载
  return page.frameLocator(iframeSelector);
}

/**
 * 等待元素可见
 */
export async function waitForElementVisible(locator: Locator, timeout: number = 10000): Promise<void> {
  await locator.waitFor({ state: 'visible', timeout });
}

/**
 * 截图保存
 */
export async function takeScreenshot(page: Page, name: string): Promise<void> {
  await page.screenshot({ path: ./test-results/-.png });
}

/**
 * 获取当前页面 URL
 */
export function getCurrentUrl(page: Page): string {
  return page.url();
}

/**
 * 等待页面跳转到指定 URL 模式
 */
export async function waitForUrl(page: Page, pattern: RegExp | string, timeout: number = 30000): Promise<void> {
  await page.waitForURL(pattern, { timeout });
}
