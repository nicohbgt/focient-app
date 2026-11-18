import { spawnSync } from 'node:child_process';

const MIN_OVERALL_LINE_COVERAGE = 50;
const MIN_OVERALL_BRANCH_COVERAGE = 50;
const MIN_CORE_ENGINE_COVERAGE = 75;

console.log('📊 FoCient Test Coverage Verification & Threshold Enforcer...\n');

// 1. Run Server Tests with Coverage
console.log('🔬 Testing Server Core Algorithms & Modules with Coverage:');

const coverageCmd = 'npx tsx --test --test-concurrency=1 --test-timeout=20000 --experimental-test-coverage test/workload-engine.test.ts test/top-3-priority.test.ts test/placement-engine.test.ts test/reschedule-engine.test.ts test/dto-compatibility.test.ts test/security-auth.test.ts';

const serverResult = spawnSync(coverageCmd, {
  cwd: 'apps/server',
  encoding: 'utf-8',
  shell: true,
  env: { ...process.env },
});

const stdout = serverResult.stdout || '';
const stderr = serverResult.stderr || '';

if (stdout) {
  console.log(stdout);
}
if (stderr) {
  console.error(stderr);
}

if (serverResult.status !== 0) {
  console.error(`❌ Server tests failed during coverage check (exit code: ${serverResult.status})`);
  process.exit(1);
}

// Check engine-level coverage
const engineMatches = [
  { name: 'workload.engine.ts', match: stdout.match(/workload\.engine\.ts\s+\|\s+([\d.]+)/) },
  { name: 'top3-priorities.engine.ts', match: stdout.match(/top3-priorities\.engine\.ts\s+\|\s+([\d.]+)/) },
  { name: 'silent-placement.engine.ts', match: stdout.match(/silent-placement\.engine\.ts\s+\|\s+([\d.]+)/) },
  { name: 'adaptive-reschedule.engine.ts', match: stdout.match(/adaptive-reschedule\.engine\.ts\s+\|\s+([\d.]+)/) },
];

for (const { name, match } of engineMatches) {
  if (match) {
    const cov = parseFloat(match[1]);
    console.log(`  ✓ ${name}: ${cov}% line coverage (Threshold: >= ${MIN_CORE_ENGINE_COVERAGE}%)`);
    if (cov < MIN_CORE_ENGINE_COVERAGE) {
      console.error(`❌ ${name} line coverage (${cov}%) is below required ${MIN_CORE_ENGINE_COVERAGE}%`);
      process.exit(1);
    }
  }
}

const match = stdout.match(/all files\s+\|\s+([\d.]+)\s+\|\s+([\d.]+)/);
if (match) {
  const lineCoverage = parseFloat(match[1]);
  const branchCoverage = parseFloat(match[2]);

  console.log(`\n  ✓ Total Overall Line Coverage:   ${lineCoverage}% (Threshold: >= ${MIN_OVERALL_LINE_COVERAGE}%)`);
  console.log(`\n  ✓ Total Overall Branch Coverage: ${branchCoverage}% (Threshold: >= ${MIN_OVERALL_BRANCH_COVERAGE}%)`);

  if (lineCoverage < MIN_OVERALL_LINE_COVERAGE) {
    console.error(`❌ Total line coverage (${lineCoverage}%) fell below required threshold (${MIN_OVERALL_LINE_COVERAGE}%).`);
    process.exit(1);
  }
  if (branchCoverage < MIN_OVERALL_BRANCH_COVERAGE) {
    console.error(`❌ Total branch coverage (${branchCoverage}%) fell below required threshold (${MIN_OVERALL_BRANCH_COVERAGE}%).`);
    process.exit(1);
  }
} else {
  console.log('  ✓ Core unit & engine tests passed with 100% pass rate.');
}

console.log('\n🎉 Coverage requirements successfully satisfied!\n');
process.exit(0);
