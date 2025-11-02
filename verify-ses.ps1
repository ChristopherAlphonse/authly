# Quick SES verification script for Windows
param(
    [string]$Email = "noreply@yourdomain.com"
)

Write-Host "🔍 Checking SES setup for: $Email" -ForegroundColor Cyan
Write-Host ""

Write-Host "📧 Step 1: Verifying email identity..." -ForegroundColor Yellow
aws ses verify-email-identity --email-address $Email

Write-Host ""
Write-Host "⏳ Step 2: Checking verification status..." -ForegroundColor Yellow
aws ses get-identity-verification-attributes --identities $Email

Write-Host ""
Write-Host "📊 Step 3: Checking send quota..." -ForegroundColor Yellow
aws ses get-send-quota

Write-Host ""
Write-Host "✅ Step 4: Testing send capability..." -ForegroundColor Yellow
aws ses send-email `
  --from $Email `
  --to $Email `
  --subject "SES Test" `
  --text "If you receive this, SES is working!"

Write-Host ""
Write-Host "✅ Setup complete! Check your email for:" -ForegroundColor Green
Write-Host "  1. Verification email (click the link)"
Write-Host "  2. Test email (confirms sending works)"




