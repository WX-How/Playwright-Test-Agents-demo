import { defineConfig, devices } from '@playwright/test';

// 通过 REPORT_NAME + REPORT_TIME 环境变量区分不同测试场景的报告
// 输出目录: playwright-report/{REPORT_NAME}_{HHmmss}/
// REPORT_NAME: 由 run-tests.js 或手动传入
// REPORT_TIME: 由 run-tests.js 预生成，确保同一批次内时间戳一致
const reportName = process.env.REPORT_NAME || 'default';
const timeStr = process.env.REPORT_TIME || (() => {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
})();
const reportDir = `playwright-report/${reportName}_${timeStr}`;

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: [
    ['html', { outputDir: reportDir }],
    ['json', { outputFile: `${reportDir}/report.json` }],
    ['list']
  ],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] }
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] }
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] }
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] }
    }
  ]
});
