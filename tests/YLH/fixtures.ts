import { test as base, Page, FrameLocator, Locator } from '@playwright/test';

// ============ YLH商城测试配置 ============
const TEST_CONFIG = {
  loginUrl: 'https://ecs.yto56test.com:4443/mall/#/login?type=1010',
  account: '03137521',
  password: '123qwe',
  wrongPassword: 'wrongpassword',
  timeouts: {
    iframeLoad: 5000,
    iframeContent: 2000,
    tabSwitch: 500,
    navigation: 3000,
  },
};

// ============ 自定义 fixture 类型 ============
interface YuanLaiHuiFixtures {
  seedData: {
    users: Array<{ email: string; password: string; name: string }>;
    products: Array<{ id: string; name: string; price: number }>;
  };
  loggedInPage: Page;
}

export { TEST_CONFIG };

// ============ 导出 test 扩展 ============
export const test = base.extend<YuanLaiHuiFixtures>({
  seedData: [
    {
      users: [
        { email: 'testuser@example.com', password: 'Test1234!', name: 'Test User' },
        { email: 'admin@example.com', password: 'Admin1234!', name: 'Admin User' }
      ],
      products: [
        { id: 'prod-001', name: 'Laptop', price: 999.99 },
        { id: 'prod-002', name: 'Mouse', price: 29.99 },
        { id: 'prod-003', name: 'Keyboard', price: 79.99 }
      ]
    },
    {
      option: 'minimal',
      users: [{ email: 'minimal@example.com', password: 'Pass1234!', name: 'Minimal' }],
      products: [{ id: 'prod-min', name: 'Item', price: 9.99 }]
    }
  ],

  loggedInPage: async ({ page }, use) => {
    await loginAsNormalUser(page);
    await use(page);
  }
});

// ============ 导出 expect ============
export { expect } from '@playwright/test';

// ============ 核心辅助函数 ============

export function getIframe(page: Page): FrameLocator {
  return page.frameLocator('iframe');
}

export async function openLoginPageAndSwitchToPasswordTab(page: Page): Promise<FrameLocator> {
  await page.goto(TEST_CONFIG.loginUrl);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForSelector('iframe', { timeout: TEST_CONFIG.timeouts.iframeLoad });
  await page.waitForTimeout(TEST_CONFIG.timeouts.iframeContent);

  const iframe = getIframe(page);
  await iframe.locator('text=密码登录').click();
  await page.waitForTimeout(TEST_CONFIG.timeouts.tabSwitch);

  return iframe;
}

export async function fillLoginForm(
  iframe: FrameLocator,
  account: string,
  password: string,
  checkAgreement: boolean = true
): Promise<void> {
  if (account) {
    await iframe.locator('input[placeholder="请输入账号"]').fill(account);
  }
  if (password) {
    await iframe.locator('input[placeholder="请输入密码"]').fill(password);
  }
  if (checkAgreement) {
    await iframe.locator('.van-checkbox__icon').click();
  }
}

export async function clickLoginButton(iframe: FrameLocator): Promise<void> {
  await iframe.locator('button.login-btn').first().click();
}

export async function waitForLoginNavigation(page: Page): Promise<void> {
  await page.waitForTimeout(2000);
  await page.waitForFunction(() => !window.location.href.includes('/login'), {
    timeout: TEST_CONFIG.timeouts.navigation,
  });
}

export async function loginAsNormalUser(page: Page): Promise<FrameLocator> {
  const iframe = await openLoginPageAndSwitchToPasswordTab(page);
  await fillLoginForm(iframe, TEST_CONFIG.account, TEST_CONFIG.password, true);
  await clickLoginButton(iframe);
  await waitForLoginNavigation(page);
  return iframe;
}

export async function performLogin(page: Page): Promise<FrameLocator> {
  const iframe = await openLoginPageAndSwitchToPasswordTab(page);
  await fillLoginForm(iframe, TEST_CONFIG.account, TEST_CONFIG.password, true);
  await clickLoginButton(iframe);
  return iframe;
}

export async function logout(page: Page): Promise<void> {
  await page.goto(TEST_CONFIG.loginUrl);
}

// ============ 商品搜索辅助函数 ============

/**
 * 商品搜索 - 复用函数
 * @param page Page
 * @param iframe FrameLocator
 * @param keyword 搜索关键词，默认 "自动化测试商品"
 */
export async function searchProduct(
  page: Page,
  iframe: FrameLocator,
  keyword: string = '自动化测试商品'
): Promise<void> {
  await page.waitForTimeout(1500);
  const searchInput = iframe.locator(
    'input[placeholder="请输入商品名称或商品编码搜索"], input[placeholder="输入关键字搜索"]'
  ).first();
  await searchInput.waitFor({ state: 'visible', timeout: 10000 });
  await searchInput.click();
  await searchInput.clear();
  // Use pressSequentially to trigger input events properly
  await searchInput.pressSequentially(keyword, { delay: 100 });
  await searchInput.press('Enter');
  // Wait for search results to load
  await page.waitForTimeout(3000);
}

/**
 * 点击第一个商品卡片进入详情
 * @param page Page
 * @param iframe FrameLocator
 */
export async function clickProductCard(page: Page, iframe: FrameLocator): Promise<void> {
  const productCard = iframe.locator('.goods-item, .product-item, .goods-card, .van-card').first();
  await productCard.waitFor({ state: 'visible', timeout: 10000 });
  await productCard.click();
  await page.waitForTimeout(2000);
}

/**
 * 点击"立即购买"按钮
 * @param iframe FrameLocator
 */
export async function clickBuyNow(page: Page, iframe: FrameLocator): Promise<void> {
  const buyNowBtn = iframe.locator('text=立即购买').first();
  await buyNowBtn.waitFor({ state: 'visible', timeout: 10000 });
  await buyNowBtn.click();
  await page.waitForTimeout(1000);
}

/**
 * 选择规格弹窗中的第一个可用规格
 * @param iframe FrameLocator
 */
export async function selectFirstSku(page: Page, iframe: FrameLocator): Promise<void> {
  const optionCount = await iframe.locator('.van-sku-row__item:not(.van-sku-row__item--disabled)').count();
  if (optionCount > 0) {
    await iframe.locator('.van-sku-row__item:not(.van-sku-row__item--disabled)').first().click();
    await page.waitForTimeout(500);
  }
}

/**
 * 点击确认购买按钮（弹窗内）
 * @param iframe FrameLocator
 */
export async function clickConfirmBuy(iframe: FrameLocator): Promise<void> {
  const confirmBtnSelectors = [
    'text=确认购买', 'text=确定', 'text=完成', '.van-button--primary'
  ];
  for (const selector of confirmBtnSelectors) {
    const btn = iframe.locator(selector).first();
    const isVisible = await btn.isVisible().catch(() => false);
    if (isVisible) {
      await btn.click();
      break;
    }
  }
}

/**
 * 点击提交订单按钮（订单确认页）
 * @param iframe FrameLocator
 */
export async function clickSubmitOrder(iframe: FrameLocator): Promise<void> {
  const submitSelectors = [
    '.van-button--danger', 'text=提交订单', 'text=确认提交', 'text=立即提交'
  ];
  for (const selector of submitSelectors) {
    const submitBtn = iframe.locator(selector).first();
    const isVisible = await submitBtn.isVisible().catch(() => false);
    if (isVisible) {
      await submitBtn.click();
      await page.waitForTimeout(2000);
      break;
    }
  }
}

