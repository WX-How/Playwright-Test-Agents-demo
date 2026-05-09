$content = Get-Content 'D:\QClaw\Qclaw_projects\Playwright-Test-Agents-demo\tests\YLH\ordering\ordering.spec.ts' -Raw
$content = $content -replace 'await searchProduct\(iframe,', 'await searchProduct(page, iframe,'
$content = $content -replace 'await clickProductCard\(iframe\)', 'await clickProductCard(page, iframe)'
Set-Content 'D:\QClaw\Qclaw_projects\Playwright-Test-Agents-demo\tests\YLH\ordering\ordering.spec.ts' -Value $content -NoNewline -Encoding UTF8
$m1 = ([regex]'await searchProduct\(page,').Matches($content).Count
$m2 = ([regex]'await clickProductCard\(page,').Matches($content).Count
Write-Host "Done. searchProduct(page, calls: $m1, clickProductCard(page, calls: $m2"
