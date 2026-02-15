# Agent Task Dispatcher

A production-level web application that automatically spawns multiple specialized AI agents to work in parallel on user tasks.

## Features

- **Multi-Agent Parallel Execution**: Automatically deploys specialized agents based on task type
- **Real-Time Progress Tracking**: Visual progress indicators and status updates for each agent
- **Agent Collaboration**: Real-time message exchange between agents for coordinated work
- **OpenClaw Integration**: Uses OpenClaw Gateway for actual agent spawning and execution
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

### Prerequisites

1. **OpenClaw Gateway**: Ensure OpenClaw Gateway is running
   ```bash
   openclaw gateway start
   ```

2. **Gateway Token**: Get your gateway token
   ```bash
   openclaw gateway config.get
   ```

3. **Tunnel for Production (Optional)**: For Vercel deployment, expose your gateway:
   ```bash
   # Option 1: Cloudflare Tunnels (Recommended - stable URL)
   node start-cloudflare-tunnel.js

   # Option 2: ngrok (URL changes on restart)
   node start-ngrok-v1.js
   ```
   See `../GATEWAY_TUNNELS.md` for detailed setup guide.

4. **Environment Variables**: Copy `.env.example` and configure
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` with your OpenClaw Gateway URL and token:
   ```env
   # For local development (localhost)
   OPENCLAW_GATEWAY_URL=http://localhost:18789
   OPENCLAW_GATEWAY_TOKEN=your-gateway-token-here

   # For production (Vercel) - use your tunnel URL
   # OPENCLAW_GATEWAY_URL=https://your-cloudflare-url.trycloudflare.com
   # OPENCLAW_GATEWAY_URL=https://unregularized-suboesophageal-ardith.ngrok-free.dev
   ```

### Install Dependencies

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

## Real-Time Agent Collaboration

The app features real-time collaboration between spawned agents:

### Collaboration Features

- **Shared Context**: Agents can read and write to a shared context based on task type
  - Website: components, API endpoints, design colors, features
  - Research: sources, findings, citations, data points
  - Data Analysis: sources, metrics, charts, insights
  - General: milestones, deliverables, notes

- **Agent Messaging**: Agents can send messages to each other
  - Info: General information sharing
  - Data: Structured data exchange
  - Request: Asking for information from another agent
  - Response: Responding to requests

- **Parallel Execution**: All agents spawn and run in parallel
- **Progress Tracking**: Real-time status updates with polling
- **Message History**: All collaboration messages are logged and displayed

### How It Works

1. **Task Submission**: User submits a task (e.g., "Create a website")
2. **Agent Spawning**: App detects task type and spawns appropriate agents
3. **Parallel Execution**: All agents start working simultaneously
4. **Real-Time Updates**:
   - Status polling every 2 seconds
   - Progress updates displayed in real-time
   - Agent messages exchanged and logged
5. **Completion**: Agents complete tasks and report results

### API Routes

- `POST /api/agents/spawn` - Spawn a new agent via OpenClaw Gateway
- `GET /api/agents/status` - Get agent status and session history
- `POST /api/agents/message` - Send messages between agents

---

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
│   └── agentDispatcher-real.ts # Real agent spawning logic
├── hooks/            # React hooks
│   └── useAgentCollaboration.ts # Agent messaging hook
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

### For Local Development:

1. Start OpenClaw Gateway: `openclaw gateway start`
2. Configure `.env.local` with localhost URL
3. Run: `npm run dev`

### For Production (Vercel):

1. **Start Tunnel** (Cloudflare recommended):
   ```bash
   node start-cloudflare-tunnel.js
   ```

2. **Copy the tunnel URL** from terminal output

3. **Add to Vercel**:
   - Go to project: https://vercel.com/dashboard
   - Select project → Settings → Environment Variables
   - Add:
     ```
     Name: OPENCLAW_GATEWAY_URL
     Value: https://your-tunnel-url.com
     Name: OPENCLAW_GATEWAY_TOKEN
     Value: your-gateway-token
     ```
   - Select all environments (Production, Preview, Development)

4. **Redeploy** - Vercel will use new env vars

See `../GATEWAY_TUNNELS.md` for detailed tunnel setup and troubleshooting.

## Environment Variables

- **OPENCLAW_GATEWAY_URL** - OpenClaw Gateway URL (localhost or tunnel URL)
- **OPENCLAW_GATEWAY_TOKEN** - Gateway authentication token

## License

MIT
