# Agent Task Dispatcher

A production-level web application that automatically spawns multiple specialized AI agents to work in parallel on user tasks.

## Features

- **Multi-Agent Parallel Execution**: Automatically deploys specialized agents based on task type
- **Real-Time Progress Tracking**: Visual progress indicators and status updates for each agent
- **Task History**: LocalStorage-based task history with persistent storage
- **Dark/Light Mode**: Toggle between themes with smooth transitions
- **Clean Minimalist Design**: Black and white theme with yellow accent color

## Tech Stack

- **Framework**: Next.js 15.1.6 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v3.4.1
- **State Management**: React Context API
- **Testing**: Jest + React Testing Library
- **Code Quality**: ESLint + Prettier
- **Git Hooks**: Husky + lint-staged + commitlint

## Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Scripts

```bash
# Development
npm run dev           # Start development server

# Testing
npm run test          # Run tests
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Run tests with coverage report

# Code Quality
npm run lint          # Run ESLint
npm run format        # Format code with Prettier
npm run format:check  # Check code formatting

# CI/CD
npm run supervisor    # Run code quality checks
npm run ci            # Run CI pipeline (supervisor + build)

# Git Hooks
npm run pre-commit    # Run pre-commit checks
npm run pre-push      # Run pre-push checks
```

## Project Structure

```
src/
├── app/              # Next.js App Router pages
│   ├── globals.css   # Global styles
│   ├── layout.tsx    # Root layout
│   ├── page.tsx      # Home page
│   └── app.tsx       # App wrapper
├── components/       # React components
│   ├── AgentItem.tsx # Individual agent card
│   ├── CommandInput.tsx # Task input form
│   ├── ErrorBoundary.tsx # Error handling
│   ├── Sidebar.tsx   # Agent list sidebar
│   ├── TaskHistory.tsx # Task history viewer
│   ├── TaskResults.tsx # Results display
│   └── ThemeToggle.tsx # Theme switcher
├── contexts/         # React Context providers
│   ├── TaskContext.tsx # Task management state
│   └── ThemeContext.tsx # Theme management state
├── lib/              # Utility functions
│   └── agentDispatcher.ts # Agent spawning logic
└── types/            # TypeScript definitions
    └── agent.ts      # Agent and Task types
```

## Agent Types

Based on the task command, the dispatcher automatically spawns appropriate agents:

- **Website Tasks**: Frontend Dev, Backend Dev, UI/UX Designer, Researcher
- **Data Analysis Tasks**: Data Analyst, Statistical Expert, Visualizer, Researcher
- **Research Tasks**: Primary Researcher, Analyst, Fact Checker, Writer
- **General Tasks**: Executor, Reviewer

## Phase 1 Production Standards

✓ Testing: Jest + React Testing Library with 80% coverage
✓ Error Handling: ErrorBoundary + Global ErrorHandler
✓ CI/CD: GitHub Actions pipeline ready
✓ Code Quality: ESLint strict + Prettier
✓ Git Hooks: Husky pre-commit (lint-staged + commitlint)
✓ Documentation: Comprehensive README

## Phase 2 Production Standards

✓ Performance: Code splitting, lazy loading
✓ Accessibility: WCAG 2.1 AA compliance
✓ Documentation: Architecture docs

## Supervisor System

The project includes an automated code quality checker (`scripts/supervisor.js`) that runs:

**Phase 1 Checks**:
- ESLint validation
- TypeScript compilation
- Unit tests execution
- Test coverage (80% threshold)
- Code formatting

**Phase 2 Checks**:
- Production build
- Build size validation
- Security audit
- Dependency count check

Run manually: `npm run supervisor`

## Deployment

This project is configured for Vercel deployment:

1. Connect your GitHub repository to Vercel
2. Vercel will automatically detect the Next.js configuration
3. Deploy with default settings

Or deploy manually:

```bash
npm run build
vercel --prod
```

## Environment Variables

No environment variables required for basic functionality.

## License

MIT
