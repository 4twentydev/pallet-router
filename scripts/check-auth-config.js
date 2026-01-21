#!/usr/bin/env node

/**
 * Authentication Configuration Diagnostic Tool
 *
 * This script checks your Azure AD and NextAuth configuration
 * to identify common issues that cause login loops.
 */

const fs = require('fs');
const path = require('path');

// Manually load .env.local
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      const value = valueParts.join('=').replace(/^["']|["']$/g, '');
      if (key && value) {
        process.env[key] = value;
      }
    }
  });
}

console.log('🔍 Checking Authentication Configuration...\n');

const issues = [];
const warnings = [];
const success = [];

// Check required environment variables
console.log('📋 Environment Variables:');
console.log('─'.repeat(50));

const requiredVars = [
  'AZURE_AD_CLIENT_ID',
  'AZURE_AD_CLIENT_SECRET',
  'AZURE_AD_TENANT_ID',
  'NEXTAUTH_URL',
  'NEXTAUTH_SECRET',
];

requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (!value) {
    issues.push(`❌ ${varName} is not set`);
  } else {
    console.log(`✅ ${varName}: ${value.substring(0, 20)}...`);
    success.push(varName);
  }
});

console.log('\n');

// Validate AZURE_AD_CLIENT_ID format (should be a GUID)
const clientId = process.env.AZURE_AD_CLIENT_ID;
if (clientId) {
  const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (guidRegex.test(clientId)) {
    success.push('Client ID format is valid (GUID)');
  } else {
    issues.push('❌ AZURE_AD_CLIENT_ID does not look like a valid GUID');
  }
}

// Validate AZURE_AD_CLIENT_SECRET (should NOT be a GUID)
const clientSecret = process.env.AZURE_AD_CLIENT_SECRET;
if (clientSecret) {
  const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (guidRegex.test(clientSecret)) {
    issues.push('⚠️  AZURE_AD_CLIENT_SECRET looks like a GUID - it should be a random string!');
    issues.push('   This is likely the Secret ID, not the Secret VALUE');
    issues.push('   Go to Azure Portal > App Registration > Certificates & secrets');
    issues.push('   and copy the SECRET VALUE (not the Secret ID)');
  } else if (clientSecret.length < 20) {
    warnings.push('⚠️  AZURE_AD_CLIENT_SECRET seems short - verify it\'s the full secret value');
  } else {
    success.push('Client Secret format looks correct (not a GUID)');
  }
}

// Validate NEXTAUTH_URL
const nextauthUrl = process.env.NEXTAUTH_URL;
if (nextauthUrl) {
  if (nextauthUrl.includes('localhost') || nextauthUrl.includes('127.0.0.1')) {
    if (nextauthUrl.startsWith('https://')) {
      warnings.push('⚠️  NEXTAUTH_URL uses https:// for localhost - should use http://');
    }
    if (!nextauthUrl.startsWith('http://')) {
      issues.push('❌ NEXTAUTH_URL for localhost should start with http://');
    }
  } else {
    if (!nextauthUrl.startsWith('https://')) {
      warnings.push('⚠️  NEXTAUTH_URL for production should use https://');
    }
  }

  if (nextauthUrl.endsWith('/')) {
    warnings.push('⚠️  NEXTAUTH_URL should not end with a trailing slash');
  }
}

// Validate NEXTAUTH_SECRET
const nextauthSecret = process.env.NEXTAUTH_SECRET;
if (nextauthSecret && nextauthSecret.length < 32) {
  warnings.push('⚠️  NEXTAUTH_SECRET is short - should be at least 32 characters');
  warnings.push('   Generate a new one with: openssl rand -base64 32');
}

console.log('\n🔧 Configuration Check Results:');
console.log('─'.repeat(50));

if (issues.length > 0) {
  console.log('\n❌ ISSUES FOUND (must fix):');
  issues.forEach(issue => console.log(`  ${issue}`));
}

if (warnings.length > 0) {
  console.log('\n⚠️  WARNINGS (should review):');
  warnings.forEach(warning => console.log(`  ${warning}`));
}

if (issues.length === 0 && warnings.length === 0) {
  console.log('\n✅ All checks passed!');
}

console.log('\n\n📝 Next Steps:');
console.log('─'.repeat(50));

if (issues.length > 0 || warnings.length > 0) {
  console.log('\n1. Fix the issues above in your .env.local file');
  console.log('2. Verify your Azure AD App Registration settings:');
  console.log('   - Go to https://portal.azure.com');
  console.log('   - Navigate to Azure Active Directory > App registrations');
  console.log('   - Click on your app');
  console.log('   - Under Authentication, verify redirect URI:');
  console.log(`     ${nextauthUrl}/api/auth/callback/azure-ad`);
  console.log('   - Under API permissions, verify you have:');
  console.log('     • User.Read');
  console.log('     • Files.ReadWrite.All');
  console.log('     • offline_access');
  console.log('\n3. Restart your dev server: pnpm dev');
  console.log('4. Clear browser cache and try signing in again');
} else {
  console.log('\n✅ Configuration looks good!');
  console.log('\nIf you\'re still having login issues:');
  console.log('1. Check browser console for errors (F12)');
  console.log('2. Check terminal for [Auth] log messages');
  console.log('3. Verify Azure AD redirect URI matches exactly:');
  console.log(`   ${nextauthUrl}/api/auth/callback/azure-ad`);
}

console.log('\n');

// Exit with error code if issues found
process.exit(issues.length > 0 ? 1 : 0);
