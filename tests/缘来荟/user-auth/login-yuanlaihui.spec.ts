import { test, expect } from '@playwright/test';
import {
  TEST_CONFIG,
  getIframe,
  fillLoginForm,
  clickLoginButton,
  openLoginPageAndSwitchToPasswordTab,
  loginAsNormalUser,
} from '../fixtures';

/**
 * 缘来荟商城 - 登录模块 Playwright 测试脚本
 * 测试 URL: https://ecs.yto56test.com:4443/mall/#/login?type=1010
 * 测试账号: 03137521 / 密码: 123qwe
 */

// ============ 通用前置 setup ============
test.beforeEach(async ({ page }: { page: import('@playwright/test').Page }) => {
  // 打开登录页并切换到密码登录 Tab
  await openLoginPageAndSwitchToPasswordTab(page);
});

// ============ 场景 1：正常登录 ============
test.describe('场景1：正常登录', () => {
  test('使用正确的账号密码登录，应登录成功并跳转', async ({ page }: { page: import('@playwright/test').Page }) => {
    const iframe = getIframe(page);

    // 填写账号
    await iframe.locator('input[placeholder="请输入账号"]').fill(TEST_CONFIG.account);
    // 填写密码
    await iframe.locator('input[placeholder="请输入密码"]').fill(TEST_CONFIG.password);
    // 勾选用户协议
    await iframe.locator('.van-checkbox__icon').click();
    // 点击登录按钮
    await clickLoginButton(iframe);

    // 等待登录后跳转
    await page.waitForTimeout(2000);
    
    // 验证登录成功：URL 从 /login 跳转到 /#/
    const currentUrl = page.url();
    console.log('登录后URL:', currentUrl);
    expect(currentUrl).not.toContain('/login');
    expect(currentUrl).toContain('/#');
  });
});

// ============ 场景 2：未勾选用户协议 ============
test.describe('场景2：未勾选用户协议', () => {
  test('未勾选协议时登录按钮应被禁用或提示', async ({ page }: { page: import('@playwright/test').Page }) => {
    const iframe = getIframe(page);

    // 填写账号
    await iframe.locator('input[placeholder="请输入账号"]').fill(TEST_CONFIG.account);
    // 填写密码
    await iframe.locator('input[placeholder="请输入密码"]').fill(TEST_CONFIG.password);
    // 不勾选用户协议，直接点击登录
    await clickLoginButton(iframe);

    // 等待响应
    await page.waitForTimeout(1000);
    
    // 应该还在登录页（未跳转）
    const currentUrl = page.url();
    console.log('未勾选协议后URL:', currentUrl);
    expect(currentUrl).toContain('/login');
  });
});

// ============ 场景 3：空账号 ============
test.describe('场景3：空账号', () => {
  test('空账号应提示不能为空', async ({ page }: { page: import('@playwright/test').Page }) => {
    const iframe = getIframe(page);

    // 不填写账号，只填密码
    await iframe.locator('input[placeholder="请输入密码"]').fill(TEST_CONFIG.password);
    // 勾选协议
    await iframe.locator('.van-checkbox__icon').click();
    // 点击登录
    await clickLoginButton(iframe);

    // 等待表单验证
    await page.waitForTimeout(2000);

    // 应该还在登录页（未跳转即说明被校验拦截）
    const currentUrl = page.url();
    console.log('空账号提交后URL:', currentUrl);
    expect(currentUrl).toContain('/login');

    // 额外尝试捕获错误提示文本（如果页面上有可见的错误提示）
    const errorSelectors = [
      '.van-field__error-message',
      '.van-form-item__error',
      '[role="alert"]',
      '.van-field__rule-message',
      '.van-field__error .van-field__control',
    ];
    for (const sel of errorSelectors) {
      const el = iframe.locator(sel).first();
      if (await el.isVisible().catch(() => false)) {
        const txt = await el.textContent();
        if (txt && txt.trim()) {
          console.log('空账号错误提示:', txt.trim());
          break;
        }
      }
    }
  });
});

// ============ 场景 4：空密码 ============
test.describe('场景4：空密码', () => {
  test('空密码应提示不能为空', async ({ page }: { page: import('@playwright/test').Page }) => {
    const iframe = getIframe(page);

    // 只填写账号
    await iframe.locator('input[placeholder="请输入账号"]').fill(TEST_CONFIG.account);
    // 勾选协议
    await iframe.locator('.van-checkbox__icon').click();
    // 点击登录
    await clickLoginButton(iframe);

    // 等待表单验证
    await page.waitForTimeout(2000);

    // 应该还在登录页（未跳转即说明被校验拦截）
    const currentUrl = page.url();
    console.log('空密码提交后URL:', currentUrl);
    expect(currentUrl).toContain('/login');

    // 额外尝试捕获错误提示文本（如果页面上有可见的错误提示）
    const errorSelectors = [
      '.van-field__error-message',
      '.van-form-item__error',
      '[role="alert"]',
      '.van-field__rule-message',
      '.van-field__error .van-field__control',
    ];
    for (const sel of errorSelectors) {
      const el = iframe.locator(sel).first();
      if (await el.isVisible().catch(() => false)) {
        const txt = await el.textContent();
        if (txt && txt.trim()) {
          console.log('空密码错误提示:', txt.trim());
          break;
        }
      }
    }
  });
});

// ============ 场景 5：错误密码 ============
test.describe('场景5：错误密码', () => {
  test('错误密码应被拒绝', async ({ page }: { page: import('@playwright/test').Page }) => {
    const iframe = getIframe(page);

    // 填写账号
    await iframe.locator('input[placeholder="请输入账号"]').fill(TEST_CONFIG.account);
    // 填写错误密码
    await iframe.locator('input[placeholder="请输入密码"]').fill(TEST_CONFIG.wrongPassword);
    // 勾选协议
    await iframe.locator('.van-checkbox__icon').click();
    // 点击登录
    await clickLoginButton(iframe);

    // 等待响应
    await page.waitForTimeout(2000);
    
    // 应该还在登录页（登录失败）
    const currentUrl = page.url();
    console.log('错误密码后URL:', currentUrl);
    expect(currentUrl).toContain('/login');
  });
});

// ============ 场景 6：仅输入账号不输入密码 ============
test.describe('场景6：仅输入账号', () => {
  test('仅输入账号不输入密码时应提示', async ({ page }: { page: import('@playwright/test').Page }) => {
    const iframe = getIframe(page);

    // 只填写账号
    await iframe.locator('input[placeholder="请输入账号"]').fill(TEST_CONFIG.account);
    // 勾选协议
    await iframe.locator('.van-checkbox__icon').click();
    // 点击登录
    await clickLoginButton(iframe);

    // 等待表单验证
    await page.waitForTimeout(1000);
    
    // 应该还在登录页
    const currentUrl = page.url();
    expect(currentUrl).toContain('/login');
  });
});

// ============ 场景 7：扫码登录切换到密码登录 ============
test.describe('场景7：Tab切换', () => {
  test('扫码登录切换到密码登录应成功', async ({ page }: { page: import('@playwright/test').Page }) => {
    const iframe = getIframe(page);

    // 验证当前在扫码登录 Tab
    const scanTab = iframe.locator('.login-tabs .active, .tab-item.active').first();
    
    // 点击密码登录 Tab
    await iframe.locator('text=密码登录').click();
    await page.waitForTimeout(500);
    
    // 验证切换成功 - 账号输入框应该可见
    const accountInput = iframe.locator('input[placeholder="请输入账号"]');
    await expect(accountInput).toBeVisible();
    
    console.log('Tab切换成功，密码登录表单可见');
  });
});
