# fix-ordering-calls.ps1
# 修复 ordering.spec.ts 中的 fixtures 函数调用签名
# 适用于 fixtures.ts 已更新 searchProduct(page, iframe, keyword) 和 clickProductCard(page, iframe) 之后
# 路径含中文，用 UTF8 BOM 保存

param(
    [string]$SpecFile = "D:\QClaw\Qclaw_projects\Playwright-Test-Agents-demo\tests\YLH\ordering\ordering.spec.ts"
)

if (-not (Test-Path $SpecFile)) {
    Write-Host "[ERROR] 文件不存在: $SpecFile" -ForegroundColor Red
    exit 1
}

$content = Get-Content $SpecFile -Raw
$original = $content

# 修复 searchProduct(iframe, ...) -> searchProduct(page, iframe, ...)
$content = $content -replace 'await searchProduct\(iframe,', 'await searchProduct(page, iframe,'

# 修复 clickProductCard(iframe) -> clickProductCard(page, iframe)
$content = $content -replace 'await clickProductCard\(iframe\)', 'await clickProductCard(page, iframe)'

if ($content -eq $original) {
    Write-Host "[INFO] 无需修复，函数调用签名已正确" -ForegroundColor Green
} else {
    Set-Content $SpecFile -Value $content -Encoding UTF8 -NoNewline
    $count1 = ([regex]'await searchProduct\(page,').Matches($content).Count
    $count2 = ([regex]'await clickProductCard\(page,').Matches($content).Count
    Write-Host "[OK] 已修复 $SpecFile" -ForegroundColor Green
    Write-Host "  searchProduct(page, calls: $count1"
    Write-Host "  clickProductCard(page, calls: $count2"
}
