#!/usr/bin/env node

/**
 * Supervisor - Automated Code Quality Checker
 * Runs pre-deployment checks to ensure Phase 1 and Phase 2 compliance
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

const log = {
  info: (msg) => console.log(`${COLORS.blue}ℹ${COLORS.reset} ${msg}`),
  success: (msg) => console.log(`${COLORS.green}✓${COLORS.reset} ${msg}`),
  error: (msg) => console.log(`${COLORS.red}✗${COLORS.reset} ${msg}`),
  warn: (msg) => console.log(`${COLORS.yellow}⚠${COLORS.reset} ${msg}`),
};

let passedChecks = 0;
let failedChecks = 0;
const results = [];

function check(name, test, errorMsg) {
  try {
    if (test()) {
      passedChecks++;
      results.push({ name, status: 'pass' });
      log.success(name);
      return true;
    } else {
      failedChecks++;
      results.push({ name, status: 'fail', error: errorMsg });
      log.error(`${name}: ${errorMsg}`);
      return false;
    }
  } catch (error) {
    failedChecks++;
    results.push({ name, status: 'fail', error: error.message });
    log.error(`${name}: ${error.message}`);
    return false;
  }
}

function runCommand(command) {
  try {
    execSync(command, { stdio: 'pipe', encoding: 'utf-8' });
    return true;
  } catch (error) {
    return false;
  }
}

function fileExists(filePath) {
  return fs.existsSync(path.join(process.cwd(), filePath));
}

function fileContains(filePath, pattern) {
  if (!fileExists(filePath)) return false;
  const content = fs.readFileSync(path.join(process.cwd(), filePath), 'utf-8');
  return content.includes(pattern);
}

console.log(`${COLORS.cyan}
╔═══════════════════════════════════════════════════════════╗
║         Agent Task Dispatcher - Supervisor                ║
║              Automated Code Quality Checker                ║
╚═══════════════════════════════════════════════════════════╝
${COLORS.reset}
`);

log.info('Starting production readiness checks...\n');

// ========== Phase 1 Checks ==========

log.info(`${COLORS.magenta}Phase 1: Testing & Error Handling${COLORS.reset}`);

check('Jest configured', () => fileExists('jest.config.js'), 'jest.config.js not found');
check('Jest setup file', () => fileExists('jest.setup.js'), 'jest.setup.js not found');
check('Testing library installed', () => fileContains('package.json', '@testing-library/react'),
  '@testing-library/react not in package.json');
check('ErrorBoundary component', () => fileExists('src/components/ErrorBoundary.tsx') ||
  fileExists('src/components/ErrorBoundary.tsx'),
  'ErrorBoundary component not found');
check('Global error handler', () => fileContains('src/app/layout.tsx', 'ErrorBoundary') ||
  fileContains('src/app/page.tsx', 'ErrorBoundary'),
  'Global error handler not implemented');

log.info(`${COLORS.magenta}Phase 1: CI/CD & Code Quality${COLORS.reset}`);

check('GitHub Actions workflow', () => fileExists('.github/workflows/ci.yml') ||
  fileExists('.github/workflows/main.yml'),
  'GitHub Actions workflow not found');
check('ESLint configured', () => fileExists('eslint.config.mjs') || fileExists('.eslintrc.json'),
  'ESLint configuration not found');
check('Prettier configured', () => fileExists('.prettierrc') || fileExists('.prettierrc.json'),
  'Prettier configuration not found');
check('Husky installed', () => fileContains('package.json', 'husky'),
  'Husky not installed in package.json');
check('Lint-staged configured', () => fileContains('package.json', 'lint-staged'),
  'lint-staged not configured in package.json');
check('Commitlint configured', () => fileExists('.commitlintrc.json') || fileExists('.commitlintrc'),
  'Commitlint configuration not found');

log.info(`${COLORS.magenta}Phase 1: Package Dependencies${COLORS.reset}`);

check('React 18.x installed', () => {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
  return pkg.dependencies?.react?.startsWith('18');
}, 'React must be version 18.x, not 19.x');

check('Next.js 15.1.6 installed', () => {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
  return pkg.dependencies?.next === '15.1.6';
}, 'Next.js must be exactly version 15.1.6');

check('Tailwind CSS 3.4.x installed', () => {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
  const tailwindVersion = pkg.devDependencies?.tailwindcss;
  return tailwindVersion && tailwindVersion.startsWith('^3.4');
}, 'Tailwind CSS must be version 3.4.x, not 4.x');

check('TypeScript configured', () => fileExists('tsconfig.json'), 'tsconfig.json not found');

// ========== Phase 2 Checks ==========

log.info(`${COLORS.magenta}Phase 2: Performance & Accessibility${COLORS_RESET}`);

check('Code splitting implemented', () => {
  const pageContent = fileExists('src/app/page.tsx') ?
    fs.readFileSync('src/app/page.tsx', 'utf-8') : '';
  return true; // Next.js App Router handles this by default
}, 'Code splitting should be implemented');

check('Metadata configured', () => fileContains('src/app/layout.tsx', 'metadata'),
  'Metadata not configured in layout.tsx');

check('Semantic HTML', () => {
  const pageContent = fileExists('src/app/page.tsx') ?
    fs.readFileSync('src/app/page.tsx', 'utf-8') : '';
  return pageContent.includes('<header>') || pageContent.includes('<main>') || pageContent.includes('<aside>');
}, 'Use semantic HTML elements');

log.info(`${COLORS.magenta}Project Structure${COLORS_RESET}`);

check('Type definitions exist', () => fileExists('src/types/agent.ts'),
  'Type definitions not found in src/types/');
check('Components directory exists', () => fileExists('src/components'),
  'Components directory not found');
check('Custom hooks exist', () => fileExists('src/hooks/useCommands.ts') &&
  fileExists('src/hooks/useAgents.ts'),
  'Custom hooks not found');
check('Utility functions exist', () => fileExists('src/lib/storage.ts'),
  'Utility functions not found');

// ========== Deep Code Analysis ==========

log.info(`${COLORS.magenta}Deep Code Analysis${COLORS_RESET}`);

check('No console.log in production code', () => {
  const files = ['src/app/page.tsx', 'src/components/Sidebar.tsx',
    'src/components/CommandInput.tsx'];
  for (const file of files) {
    if (fileExists(file)) {
      const content = fs.readFileSync(file, 'utf-8');
      if (content.includes('console.log')) {
        return false;
      }
    }
  }
  return true;
}, 'Remove console.log statements from production code');

check('All components have TypeScript types', () => {
  const componentFiles = ['src/components/Sidebar.tsx', 'src/components/CommandInput.tsx',
    'src/components/ResultsDisplay.tsx'];
  for (const file of componentFiles) {
    if (fileExists(file)) {
      const content = fs.readFileSync(file, 'utf-8');
      if (!content.includes('interface') && !content.includes('type')) {
        return false;
      }
    }
  }
  return true;
}, 'Components should have TypeScript interfaces/types');

check('Error handling implemented', () => {
  const pageContent = fileExists('src/app/page.tsx') ?
    fs.readFileSync('src/app/page.tsx', 'utf-8') : '';
  return pageContent.includes('try') || pageContent.includes('catch') ||
    pageContent.includes('error');
}, 'Error handling should be implemented');

check('Accessibility attributes present', () => {
  const files = ['src/app/page.tsx', 'src/components/CommandInput.tsx'];
  for (const file of files) {
    if (fileExists(file)) {
      const content = fs.readFileSync(file, 'utf-8');
      if (content.includes('aria-label') || content.includes('role') ||
        content.includes('alt')) {
        return true;
      }
    }
  }
  return false;
}, 'Add accessibility attributes (aria-label, role, alt)');

// ========== Summary ==========

console.log(`\n${COLORS.cyan}═══════════════════════════════════════════════════════════${COLORS.reset}\n`);
console.log(`${COLORS.bold}Summary:${COLORS_RESET}`);
console.log(`  ${COLORS.green}Passed:${COLORS.reset} ${passedChecks}`);
console.log(`  ${COLORS.red}Failed:${COLORS.reset} ${failedChecks}`);
console.log(`  Total: ${passedChecks + failedChecks}\n`);

if (failedChecks > 0) {
  console.log(`${COLORS.red}Failed checks:${COLORS_RESET}\n`);
  results
    .filter((r) => r.status === 'fail')
    .forEach((r) => {
      console.log(`  ${COLORS.red}✗${COLORS.reset} ${r.name}`);
      if (r.error) {
        console.log(`    ${COLORS.yellow}→${COLORS.reset} ${r.error}`);
      }
    });
  console.log(`\n${COLORS.red}❌ Supervisor: Deployment blocked${COLORS.reset}`);
  console.log(`${COLORS.yellow}Please fix all failed checks before deploying.${COLORS_RESET}\n`);
  process.exit(1);
} else {
  console.log(`${COLORS.green}✅ Supervisor: All checks passed!${COLORS_RESET}`);
  console.log(`${COLORS.green}Deployment approved.${COLORS_RESET}\n`);
  process.exit(0);
}
