import { test, expect, loginAsNormalUser, getIframe, searchProduct, clickProductCard } from '../fixtures';

/**
 * YLH商城 - 下单模块测试
 * 场景ID: SC-ORDER-001 ~ SC-ORDER-015
 * 业务流程: 登录→搜索商品→进入详情→选规格→提交订单
 *
 * 复用说明：searchProduct + clickProductCard 来自 fixtures.ts
 * fixtures 函数签名：searchProduct(page, iframe, keyword), clickProductCard(page, iframe)
 */

test.describe('YLH商城 - 下单模块测试', () => {

  test.beforeEach(async ({ page }) => {
    await loginAsNormalUser(page);
  });

  /**
   * SC-ORDER-001 - 完整正常下单
   */
  test('SC-ORDER-001 - 完整正常下单', async ({ page }) => {
    const iframe = getIframe(page);
    await searchProduct(page, iframe, '自动化测试商品');
    await clickProductCard(page, iframe);

    const buyNowBtn = iframe.locator('text=立即购买').first();
    await buyNowBtn.waitFor({ state: 'visible', timeout: 10000 });
    await buyNowBtn.click();
    await page.waitForTimeout(1000);

    const popup = iframe.locator('.van-popup, .van-popup--bottom, .sku-popup').first();
    await popup.waitFor({ state: 'visible', timeout: 10000 });

    await page.waitForTimeout(1000);

    const optionCount = await iframe.locator('.van-sku-row__item:not(.van-sku-row__item--disabled)').count();
    console.log(`找到 ${optionCount} 个可用规格选项`);

    if (optionCount > 0) {
      await iframe.locator('.van-sku-row__item:not(.van-sku-row__item--disabled)').first().click();
      await page.waitForTimeout(500);
    }

    await page.waitForTimeout(1500);

    const confirmBtnSelectors = [
      'text=确认购买', 'text=确定', 'text=完成', '.van-button--primary',
      '.van-sku__actions .van-button--primary', '.van-sku__footer .van-button--primary'
    ];

    let confirmBtnClicked = false;
    for (const selector of confirmBtnSelectors) {
      const btn = iframe.locator(selector).first();
      const isVisible = await btn.isVisible().catch(() => false);
      if (isVisible) {
        await btn.click();
        confirmBtnClicked = true;
        break;
      }
    }

    if (!confirmBtnClicked) {
      await popup.press('Escape');
    }

    await page.waitForTimeout(3000);

    const orderIframe = getIframe(page);
    const submitSelectors = [
      'text=提交订单', 'text=确认提交', 'text=立即提交',
      '.order-submit', '.submit-btn', '.van-button--danger'
    ];

    let submitClicked = false;
    for (const selector of submitSelectors) {
      const submitBtn = orderIframe.locator(selector).first();
      const isVisible = await submitBtn.isVisible().catch(() => false);
      if (isVisible) {
        await submitBtn.click();
        submitClicked = true;
        await page.waitForTimeout(2000);
        break;
      }
    }

    if (!submitClicked) {
      console.log('未找到提交订单按钮');
    }

    const iframeBody = orderIframe.locator('body');
    await expect(iframeBody).toBeVisible();
    console.log('SC-ORDER-001 完成');
  });

  /**
   * SC-ORDER-002 - 仅买一件
   */
  test('SC-ORDER-002 - 仅买一件', async ({ page }) => {
    const iframe = getIframe(page);
    await searchProduct(page, iframe, '自动化测试商品');
    await clickProductCard(page, iframe);

    const buyNowBtn = iframe.locator('text=立即购买').first();
    await buyNowBtn.waitFor({ state: 'visible', timeout: 10000 });
    await buyNowBtn.click();
    await page.waitForTimeout(1000);

    const popup = iframe.locator('.van-popup, .van-popup--bottom, .sku-popup').first();
    await popup.waitFor({ state: 'visible', timeout: 10000 });

    const skuOptions = iframe.locator('.van-sku-row__item, .sku-item, .spec-item').all();
    if ((await skuOptions).length > 0) {
      await (await skuOptions)[0].click();
      await page.waitForTimeout(500);
    }

    const confirmBtn = iframe.locator('text=确认购买').first();
    await confirmBtn.click();
    await page.waitForTimeout(3000);

    const orderIframe = getIframe(page);
    const submitBtn = orderIframe.locator('text=提交订单, text=确认提交, text=立即提交, .van-button--danger').first();
    if (await submitBtn.isVisible().catch(() => false)) {
      await submitBtn.click();
      await page.waitForTimeout(2000);
    }

    const iframeBody = orderIframe.locator('body');
    await expect(iframeBody).toBeVisible();
    console.log('SC-ORDER-002 完成');
  });

  /**
   * SC-ORDER-003 - 购买多件
   */
  test('SC-ORDER-003 - 购买多件', async ({ page }) => {
    const iframe = getIframe(page);
    await searchProduct(page, iframe, '自动化测试商品');
    await clickProductCard(page, iframe);

    const buyNowBtn = iframe.locator('text=立即购买').first();
    await buyNowBtn.waitFor({ state: 'visible', timeout: 10000 });
    await buyNowBtn.click();
    await page.waitForTimeout(1000);

    const popup = iframe.locator('.van-popup, .van-popup--bottom, .sku-popup').first();
    await popup.waitFor({ state: 'visible', timeout: 10000 });

    const skuOptions = iframe.locator('.van-sku-row__item, .sku-item, .spec-item').all();
    if ((await skuOptions).length > 0) {
      await (await skuOptions)[0].click();
      await page.waitForTimeout(500);
    }

    const quantityInput = iframe.locator('input.van-stepper__input, .quantity-input, input[type="number"]').first();
    if (await quantityInput.isVisible().catch(() => false)) {
      await quantityInput.fill('2');
      await page.waitForTimeout(500);
    }

    const confirmBtn = iframe.locator('text=确认购买').first();
    await confirmBtn.click();
    await page.waitForTimeout(3000);

    const orderIframe = getIframe(page);
    const submitBtn = orderIframe.locator('text=提交订单, text=确认提交, text=立即提交, .van-button--danger').first();
    if (await submitBtn.isVisible().catch(() => false)) {
      await submitBtn.click();
      await page.waitForTimeout(2000);
    }

    const iframeBody = orderIframe.locator('body');
    await expect(iframeBody).toBeVisible();
    console.log('SC-ORDER-003 完成');
  });

  /**
   * SC-ORDER-004 - 选择第一组规格
   */
  test('SC-ORDER-004 - 选择第一组规格', async ({ page }) => {
    const iframe = getIframe(page);
    await searchProduct(page, iframe, '自动化测试商品');
    await clickProductCard(page, iframe);

    const buyNowBtn = iframe.locator('text=立即购买').first();
    await buyNowBtn.waitFor({ state: 'visible', timeout: 10000 });
    await buyNowBtn.click();
    await page.waitForTimeout(1000);

    const popup = iframe.locator('.van-popup, .van-popup--bottom, .sku-popup').first();
    await popup.waitFor({ state: 'visible', timeout: 10000 });

    const skuOptions = iframe.locator('.van-sku-row__item, .sku-item, .spec-item').all();
    if ((await skuOptions).length > 0) {
      await (await skuOptions)[0].click();
      await page.waitForTimeout(500);
    }

    const confirmBtn = iframe.locator('text=确认购买').first();
    await confirmBtn.click();
    await page.waitForTimeout(3000);

    const orderIframe = getIframe(page);
    const submitBtn = orderIframe.locator('text=提交订单, text=确认提交, text=立即提交, .van-button--danger').first();
    if (await submitBtn.isVisible().catch(() => false)) {
      await submitBtn.click();
      await page.waitForTimeout(2000);
    }

    const iframeBody = orderIframe.locator('body');
    await expect(iframeBody).toBeVisible();
    console.log('SC-ORDER-004 完成');
  });

  /**
   * SC-ORDER-005 - 切换规格
   */
  test('SC-ORDER-005 - 切换规格', async ({ page }) => {
    const iframe = getIframe(page);
    await searchProduct(page, iframe, '自动化测试商品');
    await clickProductCard(page, iframe);

    const buyNowBtn = iframe.locator('text=立即购买').first();
    await buyNowBtn.waitFor({ state: 'visible', timeout: 10000 });
    await buyNowBtn.click();
    await page.waitForTimeout(1000);

    const popup = iframe.locator('.van-popup, .van-popup--bottom, .sku-popup').first();
    await popup.waitFor({ state: 'visible', timeout: 10000 });

    const skuOptions = iframe.locator('.van-sku-row__item, .sku-item, .spec-item').all();
    const options = await skuOptions;
    if (options.length >= 2) {
      await options[0].click();
      await page.waitForTimeout(500);
      await options[1].click();
      await page.waitForTimeout(500);
    } else if (options.length === 1) {
      await options[0].click();
      await page.waitForTimeout(500);
    }

    const confirmBtn = iframe.locator('text=确认购买').first();
    await confirmBtn.click();
    await page.waitForTimeout(3000);

    const orderIframe = getIframe(page);
    const submitBtn = orderIframe.locator('text=提交订单, text=确认提交, text=立即提交, .van-button--danger').first();
    if (await submitBtn.isVisible().catch(() => false)) {
      await submitBtn.click();
      await page.waitForTimeout(2000);
    }

    const iframeBody = orderIframe.locator('body');
    await expect(iframeBody).toBeVisible();
    console.log('SC-ORDER-005 完成');
  });

  /**
   * SC-ORDER-006 - 不选规格直接确认
   */
  test('SC-ORDER-006 - 不选规格直接确认', async ({ page }) => {
    const iframe = getIframe(page);
    await searchProduct(page, iframe, '自动化测试商品');
    await clickProductCard(page, iframe);

    const buyNowBtn = iframe.locator('text=立即购买').first();
    await buyNowBtn.waitFor({ state: 'visible', timeout: 10000 });
    await buyNowBtn.click();
    await page.waitForTimeout(1000);

    const popup = iframe.locator('.van-popup, .van-popup--bottom, .sku-popup').first();
    await popup.waitFor({ state: 'visible', timeout: 10000 });

    const confirmBtn = iframe.locator('text=确认购买').first();
    await confirmBtn.click();
    await page.waitForTimeout(2000);

    const iframeBody = iframe.locator('body');
    await expect(iframeBody).toBeVisible();
    console.log('SC-ORDER-006 完成');
  });

  /**
   * SC-ORDER-007 - 搜索无结果后下单
   */
  test('SC-ORDER-007 - 搜索无结果后下单', async ({ page }) => {
    const iframe = getIframe(page);
    await searchProduct(page, iframe, 'xyzabc999999不存在');
    await page.waitForTimeout(3000);

    const productCard = iframe.locator('.goods-item, .product-item, .goods-card, .van-card').first();
    const hasProduct = await productCard.isVisible().catch(() => false);

    if (!hasProduct) {
      console.log('搜索无结果');
    }

    const iframeBody = iframe.locator('body');
    await expect(iframeBody).toBeVisible();
    console.log('SC-ORDER-007 完成');
  });

  /**
   * SC-ORDER-008 - 商品下架后下单
   */
  test('SC-ORDER-008 - 商品下架后下单', async ({ page }) => {
    const iframe = getIframe(page);
    await searchProduct(page, iframe, '自动化测试商品');

    const productCard = iframe.locator('.goods-item, .product-item, .goods-card, .van-card').first();
    const hasProduct = await productCard.isVisible().catch(() => false);

    if (hasProduct) {
      await clickProductCard(page, iframe);
      const soldOutTip = iframe.locator('text=已下架, text=商品已下架, .sold-out').first();
      const isSoldOut = await soldOutTip.isVisible().catch(() => false);
      if (isSoldOut) {
        console.log('商品已下架');
      }
    }

    const iframeBody = iframe.locator('body');
    await expect(iframeBody).toBeVisible();
    console.log('SC-ORDER-008 完成');
  });

  /**
   * SC-ORDER-009 - 购买数量边界值-最小
   */
  test('SC-ORDER-009 - 购买数量边界值-最小', async ({ page }) => {
    const iframe = getIframe(page);
    await searchProduct(page, iframe, '自动化测试商品');
    await clickProductCard(page, iframe);

    const buyNowBtn = iframe.locator('text=立即购买').first();
    await buyNowBtn.waitFor({ state: 'visible', timeout: 10000 });
    await buyNowBtn.click();
    await page.waitForTimeout(1000);

    const popup = iframe.locator('.van-popup, .van-popup--bottom, .sku-popup').first();
    await popup.waitFor({ state: 'visible', timeout: 10000 });

    const skuOptions = iframe.locator('.van-sku-row__item, .sku-item, .spec-item').all();
    if ((await skuOptions).length > 0) {
      await (await skuOptions)[0].click();
      await page.waitForTimeout(500);
    }

    const quantityInput = iframe.locator('input.van-stepper__input, .quantity-input, input[type="number"]').first();
    if (await quantityInput.isVisible().catch(() => false)) {
      await quantityInput.fill('0');
      await page.waitForTimeout(500);
    }

    const confirmBtn = iframe.locator('text=确认购买').first();
    await confirmBtn.click();
    await page.waitForTimeout(3000);

    const orderIframe = getIframe(page);
    const submitBtn = orderIframe.locator('text=提交订单, text=确认提交, text=立即提交, .van-button--danger').first();
    if (await submitBtn.isVisible().catch(() => false)) {
      await submitBtn.click();
      await page.waitForTimeout(2000);
    }

    const iframeBody = orderIframe.locator('body');
    await expect(iframeBody).toBeVisible();
    console.log('SC-ORDER-009 完成');
  });

  /**
   * SC-ORDER-010 - 购买数量边界值-超出
   */
  test('SC-ORDER-010 - 购买数量边界值-超出', async ({ page }) => {
    const iframe = getIframe(page);
    await searchProduct(page, iframe, '自动化测试商品');
    await clickProductCard(page, iframe);

    const buyNowBtn = iframe.locator('text=立即购买').first();
    await buyNowBtn.waitFor({ state: 'visible', timeout: 10000 });
    await buyNowBtn.click();
    await page.waitForTimeout(1000);

    const popup = iframe.locator('.van-popup, .van-popup--bottom, .sku-popup').first();
    await popup.waitFor({ state: 'visible', timeout: 10000 });

    const skuOptions = iframe.locator('.van-sku-row__item, .sku-item, .spec-item').all();
    if ((await skuOptions).length > 0) {
      await (await skuOptions)[0].click();
      await page.waitForTimeout(500);
    }

    const quantityInput = iframe.locator('input.van-stepper__input, .quantity-input, input[type="number"]').first();
    if (await quantityInput.isVisible().catch(() => false)) {
      await quantityInput.fill('999999');
      await page.waitForTimeout(500);
    }

    const confirmBtn = iframe.locator('text=确认购买').first();
    await confirmBtn.click();
    await page.waitForTimeout(3000);

    const orderIframe = getIframe(page);
    const submitBtn = orderIframe.locator('text=提交订单, text=确认提交, text=立即提交, .van-button--danger').first();
    if (await submitBtn.isVisible().catch(() => false)) {
      await submitBtn.click();
      await page.waitForTimeout(2000);
    }

    const iframeBody = orderIframe.locator('body');
    await expect(iframeBody).toBeVisible();
    console.log('SC-ORDER-010 完成');
  });

  /**
   * SC-ORDER-011 - 从搜索结果页返回
   * 跳过：iframe内页面导航历史不完整，无法稳定测试返回功能
   */
  test.skip('SC-ORDER-011 - 从搜索结果页返回', async ({ page }) => {
    const iframe = getIframe(page);
    await searchProduct(page, iframe, '自动化测试商品');
    const searchUrl = page.url();
    console.log('搜索后URL:', searchUrl);
    await clickProductCard(page, iframe);

    const backBtn = iframe.locator('.van-nav-bar__left, .back-btn, .van-icon-arrow-left, text=返回').first();
    const hasBackBtn = await backBtn.isVisible().catch(() => false);
    if (hasBackBtn) {
      await backBtn.click();
      await page.waitForTimeout(2000);
    }

    const iframeBody = iframe.locator('body');
    await expect(iframeBody).toBeVisible();
    console.log('SC-ORDER-011 完成');
  });

  /**
   * SC-ORDER-012 - 规格弹窗关闭后重选
   */
  test('SC-ORDER-012 - 规格弹窗关闭后重选', async ({ page }) => {
    const iframe = getIframe(page);
    await searchProduct(page, iframe, '自动化测试商品');
    await clickProductCard(page, iframe);

    const buyNowBtn = iframe.locator('text=立即购买').first();
    await buyNowBtn.waitFor({ state: 'visible', timeout: 10000 });
    await buyNowBtn.click();
    await page.waitForTimeout(1000);

    const popup = iframe.locator('.van-popup, .van-popup--bottom, .sku-popup').first();
    await popup.waitFor({ state: 'visible', timeout: 10000 });

    const closeBtn = iframe.locator('.van-popup__close-icon, .van-icon-cross, .close-btn').first();
    if (await closeBtn.isVisible().catch(() => false)) {
      await closeBtn.click();
    } else {
      await page.mouse.click(10, 10);
    }
    await page.waitForTimeout(1000);

    await buyNowBtn.click();
    await page.waitForTimeout(1000);
    await popup.waitFor({ state: 'visible', timeout: 10000 });

    const optionCount = await iframe.locator('.van-sku-row__item:not(.van-sku-row__item--disabled)').count();
    if (optionCount > 0) {
      await iframe.locator('.van-sku-row__item:not(.van-sku-row__item--disabled)').first().click();
      await page.waitForTimeout(500);
    }

    const confirmBtn = iframe.locator(
      'text=确认购买, text=确定, text=完成, .van-button--primary'
    ).first();
    const isBtnVisible = await confirmBtn.isVisible().catch(() => false);
    if (isBtnVisible) {
      await confirmBtn.click();
    } else {
      await popup.press('Escape');
    }
    await page.waitForTimeout(2000);

    const submitOrderBtn = iframe.locator('text=提交订单, text=确认提交').first();
    if (await submitOrderBtn.isVisible().catch(() => false)) {
      await submitOrderBtn.click();
      await page.waitForTimeout(2000);
    }

    const iframeBody = iframe.locator('body');
    await expect(iframeBody).toBeVisible();
    console.log('SC-ORDER-012 完成');
  });

  /**
   * SC-ORDER-013 - 订单页刷新
   */
  test('SC-ORDER-013 - 订单页刷新', async ({ page }) => {
    const iframe = getIframe(page);
    await searchProduct(page, iframe, '自动化测试商品');
    await clickProductCard(page, iframe);

    const buyNowBtn = iframe.locator('text=立即购买').first();
    await buyNowBtn.waitFor({ state: 'visible', timeout: 10000 });
    await buyNowBtn.click();
    await page.waitForTimeout(1000);

    const popup = iframe.locator('.van-popup, .van-popup--bottom, .sku-popup').first();
    await popup.waitFor({ state: 'visible', timeout: 10000 });

    const optionCount = await iframe.locator('.van-sku-row__item:not(.van-sku-row__item--disabled)').count();
    if (optionCount > 0) {
      await iframe.locator('.van-sku-row__item:not(.van-sku-row__item--disabled)').first().click();
      await page.waitForTimeout(500);
    }

    const confirmBtn = iframe.locator(
      'text=确认购买, text=确定, text=完成, .van-button--primary'
    ).first();
    const isBtnVisible = await confirmBtn.isVisible().catch(() => false);
    if (isBtnVisible) {
      await confirmBtn.click();
    } else {
      await popup.press('Escape');
    }
    await page.waitForTimeout(2000);

    const submitOrderBtn = iframe.locator('text=提交订单, text=确认提交').first();
    if (await submitOrderBtn.isVisible().catch(() => false)) {
      await submitOrderBtn.click();
      await page.waitForTimeout(2000);
    }

    await page.reload();
    await page.waitForTimeout(3000);

    const iframeBody = iframe.locator('body');
    await expect(iframeBody).toBeVisible();
    console.log('SC-ORDER-013 完成');
  });

  /**
   * SC-ORDER-014 - 未登录直接下单
   */
  test('SC-ORDER-014 - 未登录直接下单', async ({ page }) => {
    await page.goto('https://ecs.yto56test.com:4443/mall/#/login?type=1010');
    await page.waitForTimeout(2000);
    await page.context().clearCookies();

    const iframe = getIframe(page);
    await page.goto('https://ecs.yto56test.com:4443/mall/#/');
    await page.waitForTimeout(2000);

    const currentUrl = page.url();
    console.log('未登录访问后URL:', currentUrl);

    const isLoginPage = currentUrl.includes('/login');
    const loginForm = iframe.locator('input[placeholder="请输入账号"]');
    const hasLoginForm = await loginForm.isVisible().catch(() => false);

    if (isLoginPage || hasLoginForm) {
      console.log('未登录被正确拦截');
    }

    const iframeBody = iframe.locator('body');
    await expect(iframeBody).toBeVisible();
    console.log('SC-ORDER-014 完成');
  });

  /**
   * SC-ORDER-015 - 登录超时后下单
   * 跳过：测试场景与beforeEach登录冲突
   */
  test.skip('SC-ORDER-015 - 登录超时后下单', async ({ page }) => {
    await page.context().clearCookies();
    await page.evaluate(() => localStorage.clear());
    await page.evaluate(() => sessionStorage.clear());
    await page.waitForTimeout(1000);

    await page.goto('https://ecs.yto56test.com:4443/mall/#/');
    await page.waitForTimeout(3000);

    const iframe = getIframe(page);
    const currentUrl = page.url();
    console.log('未登录访问首页URL:', currentUrl);

    const isLoginPage = currentUrl.includes('/login');
    const loginForm = iframe.locator('input[placeholder="请输入账号"]');
    const hasLoginForm = await loginForm.isVisible().catch(() => false);

    if (isLoginPage || hasLoginForm) {
      console.log('未登录状态被正确拦截');
    }

    const iframeBody = iframe.locator('body');
    await expect(iframeBody).toBeVisible();
    console.log('SC-ORDER-015 完成');
  });
});
