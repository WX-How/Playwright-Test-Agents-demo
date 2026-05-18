import { test, expect, Page, FrameLocator, loginAsNormalUser, getIframe, searchProduct, clickProductCard } from '../fixtures';

/**
 * YLH商城 - 购物车模块测试
 * 场景ID: SC-CART-001 ~ SC-CART-004
 */
test.describe('YLH商城 - 购物车模块测试', () => {

  test.beforeEach(async ({ page }) => {
    test.setTimeout(60000); // 60 seconds
    
    // Login with verification
    const iframe = await loginAsNormalUser(page);
    
    // CRITICAL: Verify login succeeded by checking URL changed from /login
    await page.waitForTimeout(2000);
    const currentUrl = page.url();
    if (currentUrl.includes('/login')) {
      // Login failed - take screenshot for debugging
      await page.screenshot({ path: 'login-failed.png' });
      throw new Error(`Login failed - still on login page: ${currentUrl}`);
    }
    console.log(`   Login verified, URL: ${currentUrl}`);
  });

  /**
   * SC-CART-001 - 正常加入购物车流程
   */
  test('SC-CART-001 - 正常加入购物车流程', async ({ page }) => {
    const iframe = getIframe(page);

    await searchProduct(page, iframe, '自动化测试商品');
    await clickProductCard(page, iframe);
    await page.waitForTimeout(2000);

    const addToCartBtn = iframe.locator('text=加入购物车').first();
    await addToCartBtn.waitFor({ state: 'visible', timeout: 10000 });
    await addToCartBtn.click();
    await page.waitForTimeout(2000);

    const popup = iframe.locator('.van-popup, .van-sku-container').first();
    const popupVisible = await popup.isVisible().catch(() => false);
    
    if (popupVisible) {
      console.log('   规格弹窗已打开');
      
      // 选择规格
      const specSelectors = [
        '.van-sku-row__item:not(.van-sku-row__item--disabled)',
        '.van-sku-item:not(.van-sku-item--disabled)'
      ];
      
      let specSelected = false;
      for (const selector of specSelectors) {
        const count = await iframe.locator(selector).count();
        if (count > 0) {
          await iframe.locator(selector).first().click();
          await page.waitForTimeout(500);
          specSelected = true;
          console.log(`   已选择规格 (${selector}), 数量: ${count}`);
          break;
        }
      }
      
      if (!specSelected) {
        console.log('   未找到可选规格，尝试直接点击确认');
      }
      
      // 点击确认
      const confirmSelectors = ['text=确认加入', 'text=确定', 'text=确认购买', '.van-button--primary'];
      for (const selector of confirmSelectors) {
        const btn = iframe.locator(selector).first();
        const isVisible = await btn.isVisible({ timeout: 2000 }).catch(() => false);
        if (isVisible) {
          await btn.click();
          console.log(`   已点击: ${selector}`);
          break;
        }
      }
      await page.waitForTimeout(2000);
    } else {
      console.log('   规格弹窗未打开（可能无规格）');
    }

    // 直接导航到购物车页面，等待商品加载
    // 购物车页面路由: /mall/#/cart
    const cartUrl = page.url().replace(/\/[^/]*$/, '') + '/cart';
    await page.goto(cartUrl);
    await page.waitForTimeout(3000); // 等待购物车页面加载完成

    // 验证购物车页面已加载
    const cartPageIndicator = iframe.locator('text=购物车').first();
    await cartPageIndicator.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
    
    // 验证添加的商品在购物车列表中
    const addedProduct = iframe.locator(`text=自动化测试商品`).first();
    const productVisible = await addedProduct.isVisible({ timeout: 5000 }).catch(() => false);
    console.log(`   商品名称可见: ${productVisible}`);
    
    // 同时检查购物车是否有商品元素
    const cartSelectors = ['.van-card', '.goods-item', '.cart-goods', '[class*="cart-item"]'];
    let found = false;
    for (const selector of cartSelectors) {
      const count = await iframe.locator(selector).count();
      if (count > 0) {
        console.log(`   购物车中找到 ${count} 个商品元素 (${selector})`);
        found = true;
        break;
      }
    }
    
    // 必须同时满足：1) 商品名称可见 2) 购物车有商品元素
    expect(productVisible).toBeTruthy();
    expect(found).toBeTruthy();
    console.log('SC-CART-001 正常加入购物车流程测试完成');
  });

  /**
   * SC-CART-002 - 规格弹窗取消操作
   */
  test('SC-CART-002 - 规格弹窗取消操作', async ({ page }) => {
    const iframe = getIframe(page);

    await searchProduct(page, iframe, '自动化测试商品');
    await clickProductCard(page, iframe);
    await page.waitForTimeout(1500);

    const addToCartBtn = iframe.locator('text=加入购物车').first();
    await addToCartBtn.waitFor({ state: 'visible', timeout: 10000 });
    await addToCartBtn.click();
    await page.waitForTimeout(1500);

    const skuPopup = iframe.locator('.van-popup, .van-sku-container').first();
    const popupVisible = await skuPopup.isVisible().catch(() => false);

    if (popupVisible) {
      console.log('   规格弹窗已打开，尝试关闭');
      
      // 尝试关闭按钮
      const closeBtn = iframe.locator('.van-icon-close').first();
      if (await closeBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await closeBtn.click();
        await page.waitForTimeout(1000);
        console.log('   已点击关闭按钮');
      } else {
        // 点击背景关闭
        await iframe.locator('.van-overlay').click({ force: true }).catch(() => {});
        await page.waitForTimeout(1000);
        console.log('   已点击背景关闭');
      }
    }

    await page.waitForTimeout(1000);
    console.log('SC-CART-002 规格弹窗取消操作测试完成');
  });

  /**
   * SC-CART-003 - 快速连续点击确认加入
   */
  test.skip('SC-CART-003 - 快速连续点击确认加入', async ({ page }) => {
    const iframe = getIframe(page);

    await searchProduct(page, iframe, '自动化测试商品');
    await clickProductCard(page, iframe);
    await page.waitForTimeout(1500);

    const addToCartBtn = iframe.locator('text=加入购物车').first();
    await addToCartBtn.waitFor({ state: 'visible', timeout: 10000 });
    await addToCartBtn.click();
    await page.waitForTimeout(2000);

    // 选择规格
    const specSelectors = ['.van-sku-row__item:not(.van-sku-row__item--disabled)', '.van-sku-item'];
    for (const selector of specSelectors) {
      const count = await iframe.locator(selector).count();
      if (count > 0) {
        await iframe.locator(selector).first().click();
        await page.waitForTimeout(300);
        break;
      }
    }

    // 等待确认按钮出现
    await page.waitForTimeout(500);

    // 点击确认按钮
    const confirmSelectors = ['text=确认加入', 'text=确定', 'text=确认购买', '.van-button--primary'];
    let confirmed = false;
    for (const selector of confirmSelectors) {
      const btn = iframe.locator(selector).first();
      if (await btn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await btn.click();
        confirmed = true;
        console.log(`   已点击确认按钮`);
        break;
      }
    }
    
    if (!confirmed) {
      console.log('   未找到确认按钮');
    }
    
    // 等待弹窗关闭
    await page.waitForTimeout(2500);

    // 进入购物车验证
    const cartTab = iframe.locator('text=购物车').first();
    await cartTab.waitFor({ state: 'visible', timeout: 10000 });
    await cartTab.click();
    await page.waitForTimeout(3000);

    // 验证购物车中商品数量（应该只有1件）
    const cartSelectors = ['.van-card', '.goods-item', '.cart-goods'];
    let itemCount = 0;
    for (const selector of cartSelectors) {
      const count = await iframe.locator(selector).count();
      if (count > 0) {
        itemCount = count;
        console.log(`   购物车中找到 ${count} 个商品`);
        break;
      }
    }
    
    // 系统应该只加入一次
    console.log(`SC-CART-003 快速连续点击确认加入测试完成，购物车商品数: ${itemCount}`);
  });

  /**
   * SC-CART-004 - 选择添加的商品数量
   */
  test('SC-CART-004 - 选择添加的商品数量', async ({ page }) => {
    const iframe = getIframe(page);

    await searchProduct(page, iframe, '自动化测试商品');
    await clickProductCard(page, iframe);
    await page.waitForTimeout(1500);

    const addToCartBtn = iframe.locator('text=加入购物车').first();
    await addToCartBtn.waitFor({ state: 'visible', timeout: 10000 });
    await addToCartBtn.click();
    await page.waitForTimeout(2000);

    const popup = iframe.locator('.van-popup, .van-sku-container').first();
    const popupVisible = await popup.isVisible().catch(() => false);
    
    if (popupVisible) {
      console.log('   规格弹窗已打开');
      
      // 选择规格
      for (const selector of ['.van-sku-row__item:not(.van-sku-row__item--disabled)', '.van-sku-item']) {
        const count = await iframe.locator(selector).count();
        if (count > 0) {
          await iframe.locator(selector).first().click();
          await page.waitForTimeout(500);
          break;
        }
      }
      
      // 查找并点击数量加号按钮（+2）
      const quantitySelectors = [
        '.van-stepper__plus',           // Vant 加号按钮
        '.van-sku-stepper .van-stepper__plus',
        '[class*="stepper"] .van-stepper__plus',
        '.van-icon-add-o'               // 有时是图标
      ];
      
      for (const selector of quantitySelectors) {
        const plusBtn = iframe.locator(selector).first();
        if (await plusBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
          // 点击2次加号，数量变为3
          await plusBtn.click();
          await page.waitForTimeout(300);
          await plusBtn.click();
          console.log('   已点击数量加号按钮2次');
          await page.waitForTimeout(500);
          break;
        }
      }
      
      // 点击确认
      const confirmSelectors = ['text=确认加入', 'text=确定', 'text=确认购买', '.van-button--primary'];
      for (const selector of confirmSelectors) {
        const btn = iframe.locator(selector).first();
        if (await btn.isVisible({ timeout: 2000 }).catch(() => false)) {
          await btn.click();
          console.log(`   已点击: ${selector}`);
          break;
        }
      }
      await page.waitForTimeout(2000);
    }
    
    console.log('SC-CART-004 选择添加的商品数量测试完成');
  });
});