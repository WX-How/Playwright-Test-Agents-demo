# UItest Demo

Playwright Test Agents 框架 - AI 驱动的端到端测试项目。

## 架构

基于 Planner/Generator/Healer/Executor   Agent 协作模式：

- **Planner Agent** - 分析需求规格，制定测试计划
- **Generator Agent** - 根据规格生成测试代码
- **Healer Agent** - 诊断并修复测试失败
- **Executor Agent** - 执行测试脚本

## 目录结构

```
├── .github/agents/           # 智能体定义文档
│   ├── planner.md            # Planner Agent（规格分析→测试计划）
│   ├── generator.md          # Generator Agent（计划→Playwright代码）`
│   ├── healer.md             # Healer Agent（失败诊断→修复）
│   └── executor.md             # Executor Agent（测试执行→测试报告）
│
├── specs/缘来荟/             # 测试规格（需求来源）
│   ├── user-auth/login-yuanlai.md
│   ├── goods_search/goods-search.md
│   ├── shopping/
│   └── admin/
│
├── tests/                    # 测试代码
│   ├── fixtures.ts           # 根级 fixtures（通用辅助）
│   ├── seed.spec.ts          # 数据种子
│   ├── utils/page-utils.ts
│   ├── 缘来荟/               # 按产品隔离
│   │   ├── fixtures.ts       # 缘来荟专用 fixtures（与根级大量重复）
│   │   ├── goods_search/goods-search.spec.ts
│   │   ├── user-auth/login-yuanlaihui.spec.ts
│   │   ├── shopping/
│   │   ├── admin/
│   │   └── main_process/ 
│   └── 项目二/...            # 另一个产品（未开始）
│
├── playwright-report/       # 测试报告
│   ├── index.html
│   ├── report.json
│   └── data/*.webm
│
├── playwright.config.ts   # Playwright 配置
└── package.json

```



## 快速开始

```
bash
```

## 安装依赖
```
npm install
```

## 安装浏览器
```
npx playwright install
```

## 运行测试
```
npm test
```

## UI 模式运行
```
npm run test:ui
```

## 查看报告
```
npm run report
```

## 测试模块

| 模块 | 功能 |
|------|------|
| user-auth | 用户注册、登录 |
| shopping | 购物车、结算 |
| admin | 管理后台仪表盘 |

## 配置

修改 playwright.config.ts 中的 baseURL 为你的测试地址。

默认配置：
- 浏览器：Chromium、Firefox、WebKit
- 设备：桌面 + 移动端模拟
- 重试：0 次
- 并行：关闭（单线程）
