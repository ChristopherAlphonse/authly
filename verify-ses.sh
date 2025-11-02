#!/bin/bash
# Quick SES verification script

EMAIL="${1:-noreply@ychristopheralphonse96@gmail.com}"

echo "🔍 Checking SES setup for: $EMAIL"
echo ""

echo "📧 Step 1: Verifying email identity..."
aws ses verify-email-identity --email-address "$EMAIL" 2>&1

echo ""
echo "⏳ Step 2: Checking verification status..."
aws ses get-identity-verification-attributes --identities "$EMAIL"

echo ""
echo "📊 Step 3: Checking send quota..."
aws ses get-send-quota

echo ""
echo "✅ Step 4: Testing send capability..."
aws ses send-email \
  --from "$EMAIL" \
  --to "$EMAIL" \
  --subject "SES Test" \
  --text "If you receive this, SES is working!" 2>&1 || echo "❌ Send failed - check if email is verified"

echo ""
echo "✅ Setup complete! Check your email for:"
echo "  1. Verification email (click the link)"
echo "  2. Test email (confirms sending works)"




