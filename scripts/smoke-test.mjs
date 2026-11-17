import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

console.log('🧪 Starting FoCient End-to-End Smoke Test Verification...\n');

// 1. Artifact Verification
const requiredArtifacts = [
  'packages/ui-tokens/src/color-token.css',
  'packages/ui-tokens/src/colors.json',
  'packages/ui-tokens/lib/focient_ui_tokens.dart',
  'apps/server/dist/main.js',
  'apps/web/.next/BUILD_ID',
];

console.log('📦 Step 1: Checking build artifacts...');
for (const relPath of requiredArtifacts) {
  const fullPath = resolve(process.cwd(), relPath);
  if (!existsSync(fullPath)) {
    console.error(`❌ Missing critical build artifact: ${relPath}`);
    process.exit(1);
  }
  console.log(`  ✓ Found: ${relPath}`);
}

// 2. Vocabulary Guardrail Smoke Check
console.log('\n🕊️ Step 2: Verifying guilt-free vocabulary in generated token artifacts...');
const tokensCss = readFileSync(resolve(process.cwd(), 'packages/ui-tokens/src/color-token.css'), 'utf-8');
const forbiddenTerms = ['terlambat', 'overdue', 'punish', 'hukuman'];
for (const term of forbiddenTerms) {
  if (tokensCss.toLowerCase().includes(term)) {
    console.error(`❌ Forbidden punitive term "${term}" found in tokens.css`);
    process.exit(1);
  }
}
console.log('  ✓ Zero punitive or accusatory terms detected in token build.');

// 3. API Health & Boot Verification
console.log('\n🚀 Step 3: Verifying Server Boot & /health endpoint...');
process.env.PORT = '4099';
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_jwt_secret_for_smoke_testing_only_1234567890';

try {
  const { createApp } = await import('../apps/server/dist/app.js');
  const app = createApp();
  const server = await new Promise((resolve) => {
    const s = app.listen(4099, () => resolve(s));
  });

  const res = await fetch('http://127.0.0.1:4099/health');
  const data = await res.json();
  if (data.status === 'UP') {
    console.log(`  ✓ Server booted successfully on port 4099 (/health returned status: UP).`);
  } else {
    throw new Error(`Unexpected health status: ${JSON.stringify(data)}`);
  }

  await new Promise((resolve) => server.close(resolve));
  try {
    const { cache } = await import('../apps/server/dist/common/redis.js');
    await cache.disconnect();
    const { jobQueue } = await import('../apps/server/dist/common/queue.js');
    await jobQueue.close();
  } catch {
    // Ignore
  }
  console.log('\n🎉 All FoCient smoke tests passed successfully with 0 errors!\n');
} catch (err) {
  console.error(`❌ Smoke test failed: ${err.message}`);
  process.exit(1);
}
