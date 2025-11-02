# Fix Cognito Domain for Finance App Compliance
# This script deletes the existing domain so CDK can recreate it properly

$USER_POOL_ID = "us-east-1_Np2fxi1Ol"
$DOMAIN_PREFIX = "authly-default"

Write-Host "🔍 Checking domain status..." -ForegroundColor Cyan

# Check if domain exists
$domainCheck = aws cognito-idp describe-user-pool-domain --domain "$DOMAIN_PREFIX.auth.us-east-1.amazoncognito.com" 2>&1

if ($domainCheck -match "DomainDescription") {
    Write-Host "⚠️  Domain exists: $DOMAIN_PREFIX" -ForegroundColor Yellow
    Write-Host "🗑️  Deleting domain for CDK recreation..." -ForegroundColor Yellow
    
    # Delete the domain
    aws cognito-idp delete-user-pool-domain --domain $DOMAIN_PREFIX --region us-east-1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Domain deleted successfully!" -ForegroundColor Green
        Write-Host "📦 Now run: yarn cdk:deploy" -ForegroundColor Cyan
    } else {
        Write-Host "❌ Failed to delete domain. Error code: $LASTEXITCODE" -ForegroundColor Red
        Write-Host "You may need to delete it manually in AWS Console" -ForegroundColor Yellow
    }
} else {
    Write-Host "✅ Domain does not exist. Safe to deploy with CDK." -ForegroundColor Green
}

