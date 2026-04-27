/**
 * Playwright 测试运行器 - 自动隔离 HTML 报告到场景目录
 * 用法: node run-tests.js <REPORT_NAME> [npx playwright arguments...]
 * 示例: node run-tests.js user-auth --grep "场景"
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const reportName = process.argv[2];
if (!reportName) {
  console.error('用法: node run-tests.js <REPORT_NAME> [npx playwright arguments...]');
  process.exit(1);
}

// 设置环境变量供 playwright.config.ts 读取
const now = new Date();
const timeStr = `${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
process.env.REPORT_NAME = reportName;
process.env.REPORT_TIME = timeStr;

const projectRoot = __dirname;
const playwrightReportDir = path.join(projectRoot, 'playwright-report');
const targetDir = path.join(playwrightReportDir, `${reportName}_${timeStr}`);

// 1. 运行 Playwright 测试（透传剩余参数）
const testArgs = process.argv.slice(3);
console.log(`\n▶ 开始运行测试: REPORT_NAME=${reportName} (${timeStr})`);
console.log(`  命令: npx playwright test ${testArgs.join(' ')}\n`);

try {
  execSync(`npx playwright test ${testArgs.join(' ')}`, {
    stdio: 'inherit',
    cwd: projectRoot,
    env: {
      ...process.env,
      REPORT_NAME: reportName,
      REPORT_TIME: timeStr
    }
  });
} catch (e) {
  // 测试失败也继续处理报告
  console.error('\n⚠ 测试执行失败，继续生成报告...');
}

// 2. 将 HTML 报告复制到场景目录
const rootIndexHtml = path.join(playwrightReportDir, 'index.html');
const rootDataDir = path.join(playwrightReportDir, 'data');

console.log('\n📁 整理报告文件...');

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// 复制 index.html
if (fs.existsSync(rootIndexHtml)) {
  fs.copyFileSync(rootIndexHtml, path.join(targetDir, 'index.html'));
  console.log(`  ✅ 复制 index.html → ${reportName}_${timeStr}/`);
} else {
  console.log(`  ⚠ 未找到 index.html，跳过`);
}

// 复制 data/ 目录
if (fs.existsSync(rootDataDir)) {
  const targetDataDir = path.join(targetDir, 'data');
  copyDirRecursive(rootDataDir, targetDataDir);
  console.log(`  ✅ 复制 data/ → ${reportName}_${timeStr}/data/`);
} else {
  console.log(`  ⚠ 未找到 data/，跳过`);
}

// 复制 report.json（如果还没在目标目录）
const sourceJson = path.join(targetDir, 'report.json');
if (fs.existsSync(sourceJson)) {
  console.log(`  ✅ report.json 已在目标目录`);
}

console.log(`\n📊 报告已保存到: playwright-report/${reportName}_${timeStr}/`);
console.log(`   查看报告: npx playwright show-report playwright-report/${reportName}_${timeStr}\n`);

// 辅助函数：递归复制目录
function copyDirRecursive(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}
