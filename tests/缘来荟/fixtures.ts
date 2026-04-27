import { test as base, Page, FrameLocator, Locator } from '@playwright/test';

// ============ 缘来荟商城测试配置 ============
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
