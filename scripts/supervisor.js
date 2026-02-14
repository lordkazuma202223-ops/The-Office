#!/usr/bin/env node

/**
 * Supervisor - Automated Code Quality Checker
 * Runs before deployment to ensure production standards
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

const checks = [
  {
    name: 'Phase 1: ESLint',
    command: 'npm run lint',
    required: true,
    phase: 1,
  },
  {
    name: 'Phase 1: TypeScript Compilation',
    command: 'npx tsc --noEmit',
    required: true,
    phase: 1,
  },
  {
    name: 'Phase 1: Unit Tests',
    command: 'npm run test -- --passWithNoTests',
    required: true,
    phase: 1,
  },
  {
    name: 'Phase 1: Test Coverage',
    command: 'npm run test:coverage -- --passWithNoTests',
    required: true,
    phase: 1,
    checkCoverage: true,
  },
  {
    name: 'Phase 1: Code Formatting',
    command: 'npm run format:check',
    required: true,
    phase: 1,
  },
  {
    name: 'Phase 2: Build Check',
    command: 'npm run build',
    required: true,
    phase: 2,
  },
  {
    name: 'Phase 2: Production Build Size',
    command: 'node -e "const fs=require(\'fs\');const size=fs.statSync(\'.next\').size;console.log(\'Build size:\',size);process.exit(size>50000000?1:0)"',
    required: true,
    phase: 2,
  },
  {
    name: 'Phase 2: Security Check',
    command: 'npm audit --audit-level=moderate',
    required: false,
    phase: 2,
  },
  {
    name: 'Phase 2: Dependency Check',
    command: 'node -e "const pkg=require(\'./package.json\');const deps=Object.keys({...pkg.dependencies,...pkg.devDependencies});console.log(\'Dependencies:\',deps.length);process.exit(deps.length>500?1:0)"',
    required: true,
    phase: 2,
  },
];

function runCommand(command, checkCoverage = false) {
  try {
    const output = execSync(command, { encoding: 'utf8', stdio: 'pipe' });

    if (checkCoverage) {
      // Check if coverage meets 80% threshold
      const coverageMatch = output.match(/All files[^|]*\|[^|]*\|[^|]*\|[^|]*\|[^|]*\|([\d.]+)/);
      if (coverageMatch) {
        const coverage = parseFloat(coverageMatch[1]);
        if (coverage < 80) {
          console.log(`${colors.red}Coverage: ${coverage}% (required: 80%)${colors.reset}`);
          return false;
        }
        console.log(`${colors.green}Coverage: ${coverage}% ✓${colors.reset}`);
      }
    }

    return true;
  } catch (error) {
    return false;
  }
}

function runSupervisor() {
  console.log(`${colors.cyan}╔═══════════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.cyan}║          Supervisor: Code Quality Checker                  ║${colors.reset}`);
  console.log(`${colors.cyan}╚═══════════════════════════════════════════════════════════╝${colors.reset}\n`);

  let passed = 0;
  let failed = 0;
  const results = [];

  for (const check of checks) {
    const phaseLabel = check.phase === 1 ? 'Phase 1' : 'Phase 2';
    const requiredLabel = check.required ? '[REQUIRED]' : '[OPTIONAL]';

    console.log(`${colors.blue}Running: ${check.name} ${requiredLabel}${colors.reset}`);

    const success = runCommand(check.command, check.checkCoverage);

    results.push({
      name: check.name,
      phase: check.phase,
      required: check.required,
      success,
    });

    if (success) {
      console.log(`${colors.green}✓ PASSED${colors.reset}\n`);
      passed++;
    } else if (check.required) {
      console.log(`${colors.red}✗ FAILED${colors.reset}\n`);
      failed++;
    } else {
      console.log(`${colors.yellow}⊘ SKIPPED (optional)${colors.reset}\n`);
    }
  }

  console.log(`${colors.cyan}╔═══════════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.cyan}║                    Summary                                ║${colors.reset}`);
  console.log(`${colors.cyan}╠═══════════════════════════════════════════════════════════╣${colors.reset}`);
  console.log(`${colors.cyan}║  Total Checks:  ${checks.length.toString().padStart(2)}                                    ║${colors.reset}`);
  console.log(`${colors.green}║  Passed:       ${passed.toString().padStart(2)}                                        ║${colors.reset}`);
  console.log(`${colors.red}║  Failed:       ${failed.toString().padStart(2)}                                        ║${colors.reset}`);
  console.log(`${colors.cyan}╚═══════════════════════════════════════════════════════════╝${colors.reset}\n`);

  // Phase 1 Compliance Check
  const phase1Required = checks.filter(c => c.phase === 1 && c.required);
  const phase1Passed = results.filter(
    r => r.phase === 1 && r.required && r.success
  ).length;
  const phase1Compliant = phase1Passed === phase1Required.length;

  console.log(`${colors.magenta}Phase 1 Compliance: ${phase1Compliant ? '✓' : '✗'}${colors.reset}`);
  console.log(`  Required: ${phase1Required.length}, Passed: ${phase1Passed}\n`);

  // Phase 2 Compliance Check
  const phase2Required = checks.filter(c => c.phase === 2 && c.required);
  const phase2Passed = results.filter(
    r => r.phase === 2 && r.required && r.success
  ).length;
  const phase2Compliant = phase2Passed === phase2Required.length;

  console.log(`${colors.magenta}Phase 2 Compliance: ${phase2Compliant ? '✓' : '✗'}${colors.reset}`);
  console.log(`  Required: ${phase2Required.length}, Passed: ${phase2Passed}\n`);

  // Final Decision
  const allRequiredPassed = results.filter(r => r.required).every(r => r.success);

  if (allRequiredPassed) {
    console.log(`${colors.green}✓ All required checks passed! Ready for deployment.${colors.reset}`);
    process.exit(0);
  } else {
    console.log(`${colors.red}✗ Some required checks failed. Please fix before deploying.${colors.reset}`);
    process.exit(1);
  }
}

runSupervisor();
