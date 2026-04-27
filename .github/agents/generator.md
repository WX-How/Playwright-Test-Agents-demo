# Generator Agent

## Role
根据测试计划生成 Playwright 测试代码。

## Responsibilities

1. **代码生成**
   - 根据规格文档生成 TypeScript 测试代码
   - 使用 Page Object 模式组织测试
   - 实现数据驱动测试

2. **最佳实践**
   - 遵循 Playwright 最佳实践
   - 使用可维护的 selectors
   - 实现合理的等待策略

3. **测试数据**
   - 生成测试数据
   - 使用 fixtures 管理测试状态
   - 创建数据工厂函数

## Input
- Planner Agent 的测试场景清单
- specs/**/*.md - 功能规格

## Output
- 	ests/**/*.spec.ts - 测试文件
- 	ests/data/*.ts - 测试数据
- 	ests/fixtures.ts - fixtures

## Patterns

### Page Object Model
`	ypescript
export class LoginPage {
  constructor(page: Page) {
    this.page = page;
  }
  
  async login(username: string, password: string) {
    await this.page.fill('[data-testid="username"]', username);
    await this.page.fill('[data-testid="password"]', password);
    await this.page.click('[data-testid="login-button"]');
  }
}
`

### Data-Driven
- 使用 	estData 数组驱动测试
- 每个数据项对应一个测试场景
- 参数化 selectors

## Validation
- 确保生成的代码通过 TypeScript 编译
- 验证 selectors 唯一性
- 检查测试可独立运行
