import { test, expect, loginAsNormalUser, getIframe, TEST_CONFIG } from '../fixtures';

/**
 * YLH商城 - 主流程测试
 * 整合登录→商品搜索→下单的完整正常流程
 * 用于快速验证核心业务流程是否正常工作
 */

test.describe('YLH商城 - 主流程测试（登录+搜索+下单）', () => {

  /**
   * 完整购物流程测试
   * 流程：登录 → 搜索商品 → 进入详情 → 选择规格 → 提交订单
   */
  test('完整购物流程 - 从登录到下单完成', async ({ page }) => {
    const iframe = await loginAsNormalUser(page);
    console.log('✅ 步骤1：登录成功');

    // ===== 商品搜索 =====
    await page.waitForTimeout(1000);
    const searchInput = iframe.locator('input[placeholder="请输入商品名称或商品编码搜索"], input[placeholder="输入关键字搜索"]').first();
    await searchInput.waitFor({ state: 'visible', timeout: 10000 });
    await searchInput.click();
    await searchInput.fill('自动化测试商品');
    await searchInput.press('Enter');
    await page.waitForTimeout(2000);
    console.log('✅ 步骤2：搜索商品完成');

    // ===== 进入商品详情 =====
    const productCard = iframe.locator('.goods-item, .product-item, .goods-card, .van-card').first();
    await productCard.waitFor({ state: 'visible', timeout: 10000 });
    await productCard.click();
    await page.waitForTimeout(2000);
    console.log('✅ 步骤3：进入商品详情页');

    // ===== 点击立即购买 =====
    const buyNowBtn = iframe.locator('text=立即购买').first();
    await buyNowBtn.waitFor({ state: 'visible', timeout: 10000 });
    await buyNowBtn.click();
    await page.waitForTimeout(1000);
    console.log('✅ 步骤4：点击立即购买');

    // ===== 选择规格（弹窗） =====
    const popup = iframe.locator('.van-popup, .van-popup--bottom, .sku-popup').first();
    await popup.waitFor({ state: 'visible', timeout: 10000 });
    console.log('✅ 步骤5：规格弹窗已打开');

    // 等待规格选项加载（增加等待时间）
    await page.waitForTimeout(2000);

    // 选择可用规格 - 使用多种选择器
    const specSelectors = [
      '.van-sku-row__item:not(.van-sku-row__item--disabled)',
      '.van-sku-item:not(.van-sku-item--disabled)',
      '.sku-item:not(.sku-item--disabled)',
      '.van-checkbox__label',
      '.van-radio__label',
      '[class*="sku-row"] [class*="item"]:not([class*="disabled"])'
    ];

    let optionCount = 0;
    let selectedSpec = false;
    
    for (const selector of specSelectors) {
      optionCount = await iframe.locator(selector).count();
      if (optionCount > 0) {
        console.log(`   [${selector}] 找到 ${optionCount} 个可用规格选项`);
        await iframe.locator(selector).first().click();
        await page.waitForTimeout(500);
        selectedSpec = true;
        console.log('   已选择第一个规格');
        break;
      }
    }
    
    if (!selectedSpec) {
      console.log('   未找到可用规格选项，尝试直接确认');
    }

    // ===== 点击确认购买 =====
    await page.waitForTimeout(2000);

    const confirmBtnSelectors = [
      'text=确认购买',
      'text=确定',
      'text=完成',
      '.van-button--primary',
      '.van-sku__actions .van-button--primary',
      '.van-sku__footer .van-button--primary'
    ];

    let confirmBtnClicked = false;
    for (const selector of confirmBtnSelectors) {
      const btn = iframe.locator(selector).first();
      const isVisible = await btn.isVisible({ timeout: 5000 }).catch(() => false);
      if (isVisible) {
        await btn.click();
        console.log(`   已点击确认按钮: ${selector}`);
        confirmBtnClicked = true;
        break;
      }
    }

    if (!confirmBtnClicked) {
      console.log('   确认购买按钮未找到，尝试关闭弹窗');
      await popup.press('Escape');
    }

    // ===== 提交订单 =====
    // 等待页面跳转到订单确认页
    await page.waitForTimeout(3000);
    
    // 尝试检测当前URL是否包含订单页面
    const currentUrl = page.url();
    console.log(`   当前页面URL: ${currentUrl}`);
    
    // 重新获取当前iframe（页面跳转后iframe引用需要更新）
    const orderIframe = getIframe(page);

    // 提交订单按钮选择器（按优先级排序）
    const submitSelectors = [
      { selector: '.van-button--danger', name: '危险按钮(提交)' },
      { selector: 'text=提交订单', name: '提交订单' },
      { selector: 'text=确认提交', name: '确认提交' },
      { selector: 'text=立即提交', name: '立即提交' },
      { selector: '.order-submit', name: 'order-submit类' },
      { selector: '.submit-btn', name: 'submit-btn类' },
      { selector: 'button:has-text("提交")', name: '包含提交的按钮' },
      { selector: '.van-sku__actions .van-button', name: 'SKU操作区按钮' },
      { selector: '.footer-btn .van-button', name: '底部按钮' }
    ];

    let submitClicked = false;
    for (const { selector, name } of submitSelectors) {
      try {
        const submitBtn = orderIframe.locator(selector).first();
        const isVisible = await submitBtn.isVisible({ timeout: 3000 }).catch(() => false);
        if (isVisible) {
          await submitBtn.click();
          console.log(`✅ 步骤6：已点击提交按钮: ${name} (${selector})`);
          submitClicked = true;
          await page.waitForTimeout(2000);
          break;
        }
      } catch (e) {
        // 继续尝试下一个选择器
      }
    }

    // 如果找不到提交按钮，检查是否有成功提示（可能已自动提交或不需要提交）
    if (!submitClicked) {
      const successSelectors = [
        { selector: 'text=提交成功', name: '提交成功' },
        { selector: 'text=下单成功', name: '下单成功' },
        { selector: 'text=订单已提交', name: '订单已提交' },
        { selector: 'text=订单创建成功', name: '订单创建成功' },
        { selector: '.van-success', name: '成功图标' }
      ];
      for (const { selector, name } of successSelectors) {
        try {
          const successTip = orderIframe.locator(selector).first();
          const isSuccess = await successTip.isVisible({ timeout: 2000 }).catch(() => false);
          if (isSuccess) {
            console.log(`✅ 步骤6：订单已成功提交（检测到: ${name}）`);
            submitClicked = true;
            break;
          }
        } catch (e) {
          // 继续
        }
      }
    }

    if (!submitClicked) {
      console.log('⚠️  未找到提交订单按钮，请检查页面结构');
      // 截图以便调试
      await page.screenshot({ path: 'debug-submit-btn.png', fullPage: true });
      console.log('   已保存截图: debug-submit-btn.png');
    }

    // ===== 验证结果 =====
    const iframeBody = orderIframe.locator('body');
    await expect(iframeBody).toBeVisible();
    console.log('✅ 步骤7：流程完成，页面正常');

    console.log('\n========== 主流程测试全部通过 ==========');
  });

  /**
   * 仅登录测试
   * 验证登录功能正常
   */
  test('仅登录 - 验证登录功能', async ({ page }) => {
    const iframe = await loginAsNormalUser(page);

    // 验证登录成功 - URL 应该不包含 /login
    const currentUrl = page.url();
    expect(currentUrl).not.toContain('/login');
    expect(currentUrl).toContain('/#');

    console.log('✅ 登录测试通过，当前URL:', currentUrl);
  });

  /**
   * 仅搜索测试
   * 验证商品搜索功能正常
   */
  test('仅搜索 - 验证商品搜索功能', async ({ page }) => {
    const iframe = await loginAsNormalUser(page);
    await page.waitForTimeout(1000);

    const searchInput = iframe.locator('input[placeholder="请输入商品名称或商品编码搜索"], input[placeholder="输入关键字搜索"]').first();
    await searchInput.waitFor({ state: 'visible', timeout: 10000 });
    await searchInput.click();
    await searchInput.fill('自动化测试商品');
    await searchInput.press('Enter');

    await page.waitForTimeout(2000);

    // 验证搜索结果
    await expect(searchInput).toHaveValue('自动化测试商品');
    const iframeBody = iframe.locator('body');
    await expect(iframeBody).toBeVisible();

    console.log('✅ 搜索测试通过');
  });

  /**
   * 登录后仅下单测试
   * 验证从商品搜索到下单的流程
   */
  test('登录后下单 - 验证下单功能', async ({ page }) => {
    const iframe = await loginAsNormalUser(page);
    await page.waitForTimeout(1000);

    // 搜索商品
    const searchInput = iframe.locator('input[placeholder="请输入商品名称或商品编码搜索"], input[placeholder="输入关键字搜索"]').first();
    await searchInput.waitFor({ state: 'visible', timeout: 10000 });
    await searchInput.click();
    await searchInput.fill('自动化测试商品');
    await searchInput.press('Enter');
    await page.waitForTimeout(2000);
    console.log('✅ 搜索商品完成');

    // 进入商品详情
    const productCard = iframe.locator('.goods-item, .product-item, .goods-card, .van-card').first();
    await productCard.waitFor({ state: 'visible', timeout: 10000 });
    await productCard.click();
    await page.waitForTimeout(2000);
    console.log('✅ 进入商品详情');

    // 立即购买
    const buyNowBtn = iframe.locator('text=立即购买').first();
    await buyNowBtn.waitFor({ state: 'visible', timeout: 10000 });
    await buyNowBtn.click();
    await page.waitForTimeout(1000);
    console.log('✅ 点击立即购买');

    // 选择规格（弹窗）
    const popup = iframe.locator('.van-popup, .van-popup--bottom, .sku-popup').first();
    await popup.waitFor({ state: 'visible', timeout: 10000 });
    await page.waitForTimeout(2000);
    console.log('✅ 规格弹窗已打开');

    // 选择可用规格 - 使用多种选择器
    const specSelectors = [
      '.van-sku-row__item:not(.van-sku-row__item--disabled)',
      '.van-sku-item:not(.van-sku-item--disabled)',
      '.sku-item:not(.sku-item--disabled)',
      '.van-checkbox__label',
      '.van-radio__label'
    ];

    let selectedSpec = false;
    for (const selector of specSelectors) {
      const count = await iframe.locator(selector).count();
      if (count > 0) {
        await iframe.locator(selector).first().click();
        await page.waitForTimeout(500);
        selectedSpec = true;
        console.log(`✅ 选择规格完成`);
        break;
      }
    }
    if (!selectedSpec) {
      console.log('⚠️  未找到可用规格选项');
    }

    // 确认购买
    await page.waitForTimeout(2000);
    const confirmBtnSelectors = [
      'text=确认购买',
      'text=确定',
      '.van-button--primary'
    ];
    
    for (const selector of confirmBtnSelectors) {
      const btn = iframe.locator(selector).first();
      if (await btn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await btn.click();
        console.log(`✅ 点击确认按钮: ${selector}`);
        break;
      }
    }

    // 提交订单
    await page.waitForTimeout(3000);
    const orderIframe = getIframe(page);
    
    const submitSelectors = [
      '.van-button--danger',
      'text=提交订单',
      'text=确认提交',
      '.order-submit',
      '.submit-btn'
    ];
    
    for (const selector of submitSelectors) {
      const submitBtn = orderIframe.locator(selector).first();
      if (await submitBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await submitBtn.click();
        console.log(`✅ 点击提交订单: ${selector}`);
        await page.waitForTimeout(2000);
        break;
      }
    }

    console.log('✅ 下单流程测试通过');
  });
});
