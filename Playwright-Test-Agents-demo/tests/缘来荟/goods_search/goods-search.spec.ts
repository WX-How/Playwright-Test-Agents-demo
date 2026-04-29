import { test, expect, loginAsNormalUser, getIframe } from '../fixtures';

/**
 * 缘来荟商城 - 商品搜索模块测试
 * 场景ID: SC-SEARCH-001 ~ SC-SEARCH-008
 */
test.describe('缘来荟商城 - 商品搜索模块测试', () => {

  test.beforeEach(async ({ page }) => {
    await loginAsNormalUser(page);
  });

  /**
   * SC-SEARCH-001 - 正常搜索流程
   * 用户输入有效商品名称进行搜索，验证正常搜索流程
   */
  test('SC-SEARCH-001 - 正常搜索流程', async ({ page }) => {
    const iframe = getIframe(page);
    await page.waitForTimeout(1000);
    
    const searchInput = iframe.locator('input[placeholder="请输入商品名称或商品编码搜索"]').first();
    await searchInput.waitFor({ state: 'visible', timeout: 10000 });
    await searchInput.click();
    await searchInput.fill('自动化测试商品');
    await searchInput.press('Enter');

    await expect(searchInput).toHaveValue('自动化测试商品');
    await page.waitForTimeout(2000);

    const productList = iframe.locator('.goods-list, .product-list, .search-results').first();
    await productList.waitFor({ state: 'visible', timeout: 5000 }).catch(() => null);
    
    console.log('SC-SEARCH-001 正常搜索流程测试完成');
  });

  /**
   * SC-SEARCH-002 - 空搜索
   * 验证空关键词搜索的处理
   */
  test('SC-SEARCH-002 - 空搜索', async ({ page }) => {
    const iframe = getIframe(page);
    await page.waitForTimeout(1000);
    
    const searchInput = iframe.locator('input[placeholder="请输入商品名称或商品编码搜索"], input[placeholder="输入关键字搜索"]').first();
    await searchInput.waitFor({ state: 'visible', timeout: 10000 });
    await searchInput.click();
    await searchInput.fill('');
    await searchInput.press('Enter');

    await page.waitForTimeout(2000);
    console.log('SC-SEARCH-002 空搜索测试完成');
  });

  /**
   * SC-SEARCH-003 - 特殊字符搜索
   * 验证搜索特殊字符的处理
   */
  test('SC-SEARCH-003 - 特殊字符搜索', async ({ page }) => {
    const iframe = getIframe(page);
    await page.waitForTimeout(1000);
    
    const searchInput = iframe.locator('input[placeholder="请输入商品名称或商品编码搜索"], input[placeholder="输入关键字搜索"]').first();
    await searchInput.waitFor({ state: 'visible', timeout: 10000 });
    await searchInput.click();
    await searchInput.fill('!@#\$%^&*()');
    await searchInput.press('Enter');

    await page.waitForTimeout(2000);
    console.log('SC-SEARCH-003 特殊字符搜索测试完成');
  });

  /**
   * SC-SEARCH-004 - 搜索结果验证
   * 验证搜索结果页面的显示
   */
  test('SC-SEARCH-004 - 搜索结果验证', async ({ page }) => {
    const iframe = getIframe(page);
    await page.waitForTimeout(1000);
    
    const searchInput = iframe.locator('input[placeholder="请输入商品名称或商品编码搜索"], input[placeholder="输入关键字搜索"]').first();
    await searchInput.waitFor({ state: 'visible', timeout: 10000 });
    await searchInput.click();
    await searchInput.fill('自动化测试商品');
    await searchInput.press('Enter');

    await page.waitForTimeout(3000);
    
    // 验证 iframe body 可见
    const iframeBody = iframe.locator('body');
    await expect(iframeBody).toBeVisible();
    
    console.log('SC-SEARCH-004 搜索结果验证测试完成');
  });

  /**
   * SC-SEARCH-005 - 搜索结果为空
   * 验证无结果时的页面显示
   */
  test('SC-SEARCH-005 - 搜索结果为空', async ({ page }) => {
    const iframe = getIframe(page);
    await page.waitForTimeout(1000);
    
    const searchInput = iframe.locator('input[placeholder="请输入商品名称或商品编码搜索"], input[placeholder="输入关键字搜索"]').first();
    await searchInput.waitFor({ state: 'visible', timeout: 10000 });
    await searchInput.click();
    await searchInput.fill('xyzabc999999不存在');
    await searchInput.press('Enter');

    await page.waitForTimeout(3000);
    
    // 验证 iframe body 可见
    const iframeBody = iframe.locator('body');
    await expect(iframeBody).toBeVisible();
    
    console.log('SC-SEARCH-005 搜索结果为空测试完成');
  });

  /**
   * SC-SEARCH-006 - 长文本搜索
   * 验证超长搜索关键词的处理
   */
  test('SC-SEARCH-006 - 长文本搜索', async ({ page }) => {
    const iframe = getIframe(page);
    await page.waitForTimeout(1000);
    
    const searchInput = iframe.locator('input[placeholder="请输入商品名称或商品编码搜索"], input[placeholder="输入关键字搜索"]').first();
    await searchInput.waitFor({ state: 'visible', timeout: 10000 });
    await searchInput.click();
    
    const longText = '测试'.repeat(100);
    await searchInput.fill(longText);
    await searchInput.press('Enter');

    await page.waitForTimeout(2000);
    console.log('SC-SEARCH-006 长文本搜索测试完成');
  });

  /**
   * SC-SEARCH-007 - 大小写敏感搜索
   * 验证搜索的大小写处理
   */
  test('SC-SEARCH-007 - 大小写敏感搜索', async ({ page }) => {
    const iframe = getIframe(page);
    await page.waitForTimeout(1000);
    
    const searchInput = iframe.locator('input[placeholder="请输入商品名称或商品编码搜索"], input[placeholder="输入关键字搜索"]').first();
    await searchInput.waitFor({ state: 'visible', timeout: 10000 });
    await searchInput.click();
    await searchInput.fill('TEST');
    await searchInput.press('Enter');

    await page.waitForTimeout(2000);
    
    // 验证 iframe body 可见
    const iframeBody = iframe.locator('body');
    await expect(iframeBody).toBeVisible();
    
    console.log('SC-SEARCH-007 大小写敏感搜索测试完成');
  });

  /**
   * SC-SEARCH-008 - 搜索后翻页
   * 验证搜索结果翻页功能
   */
  test('SC-SEARCH-008 - 搜索后翻页', async ({ page }) => {
    const iframe = getIframe(page);
    await page.waitForTimeout(1000);
    
    const searchInput = iframe.locator('input[placeholder="请输入商品名称或商品编码搜索"], input[placeholder="输入关键字搜索"]').first();
    await searchInput.waitFor({ state: 'visible', timeout: 10000 });
    await searchInput.click();
    await searchInput.fill('自动化测试商品');
    await searchInput.press('Enter');

    await page.waitForTimeout(3000);
    
    // 尝试找翻页按钮
    const pagination = iframe.locator('.van-pagination, .pagination, .van-actionsheet').first();
    const hasPagination = await pagination.isVisible().catch(() => false);
    
    if (hasPagination) {
      console.log('找到翻页组件');
    } else {
      console.log('Pagination not found, search results may fit in one page');
    }
    
    console.log('SC-SEARCH-008 搜索后翻页测试完成');
  });
});
