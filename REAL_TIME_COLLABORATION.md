# Real-Time Parallel Collaboration Implementation

## Summary

Implemented real-time parallel collaboration between agents in the Agent Task Dispatcher project. Agents now communicate and work together on tasks using OpenClaw Gateway.

## What Was Added

### 1. OpenClaw Gateway Integration

**New API Routes:**
- `src/app/api/agents/spawn/route.ts` - Spawn agents via OpenClaw Gateway
- `src/app/api/agents/status/route.ts` - Poll agent status and session history
- `src/app/api/agents/message/route.ts` - Send messages between agents

**Configuration:**
- Added `.env.example` with OpenClaw Gateway URL and token
- Environment variables for gateway connection

### 2. Real Agent Execution

**New File: `src/lib/agentDispatcher-real.ts`**
- Replaces simulated agent execution with real OpenClaw agent spawning
- Parallel agent execution using `executeAgentsInParallel()`
- Real-time status polling every 2 seconds
- Session key tracking for each agent
- Progress updates based on actual agent activity
- 60-second timeout with completion detection

**Key Features:**
- Agents spawn with specific prompts based on task type
- Each agent gets a unique session key
- Progress tracked via OpenClaw sessions API
- Automatic completion detection

### 3. Agent Collaboration System

**New File: `src/hooks/useAgentCollaboration.ts`**
- Custom React hook for agent-to-agent messaging
- Real-time message polling (every 3 seconds)
- Message types: info, data, request, response
- Message history tracking

**New File: `src/components/AgentCollaboration.tsx`**
- UI component displaying agent collaboration
- Color-coded message types
- Timestamp display
- Data payload visualization
- Real-time updates with loading indicators

### 4. Shared Context Updates

**Updated Files:**
- `src/types/agent.ts` - Added `sessionKey`, `prompt`, and `spawning` status
- `src/contexts/TaskContext.tsx` - Updated to use real dispatcher with parallel execution
- `src/components/AgentItem.tsx` - Added support for `spawning` status

### 5. Documentation Updates

**Updated:**
- `README.md` - Added sections on:
  - Real-Time Agent Collaboration features
  - Installation prerequisites
  - Environment variable setup
  - How collaboration works
  - API routes documentation

## How It Works

### Task Flow

1. **User Submits Task**
   - Input: "Create a website for my portfolio"
   - App detects task type (website)

2. **Agent Spawning**
   - Spawns 4 specialized agents:
     * Frontend Developer
     * Backend Developer
     * UI/UX Designer
     * Researcher
   - Each agent gets a unique session key
   - All agents start in parallel

3. **Parallel Execution**
   - Each agent executes via OpenClaw Gateway
   - Status polled every 2 seconds
   - Progress updated based on time elapsed
   - Agents work independently

4. **Real-Time Collaboration** (Optional)
   - Agents can send messages to each other
   - Shared context updated by agents
   - Messages displayed in collaboration panel
   - Color-coded by message type

5. **Completion**
   - After 60 seconds or when completed
   - Final status fetched
   - Results displayed
   - Task saved to history

### Agent Communication

**Message Types:**
- **Info**: General information sharing
- **Data**: Structured data exchange (JSON payloads)
- **Request**: Asking for information from another agent
- **Response**: Responding to requests

**Example Flow:**
```
[Frontend Developer] → [Backend Developer]
Type: Request
Message: "What API endpoints do I need to implement?"

[Backend Developer] → [Frontend Developer]
Type: Response
Message: "Here are the endpoints:"
Data: {
  "endpoints": [
    "/api/users",
    "/api/posts",
    "/api/comments"
  ]
}
```

## Environment Setup

1. Copy `.env.example` to `.env.local`
2. Add your OpenClaw Gateway URL and token:
   ```env
   OPENCLAW_GATEWAY_URL=http://localhost:18789
   OPENCLAW_GATEWAY_TOKEN=your-gateway-token-here
   ```
3. Start OpenClaw Gateway:
   ```bash
   openclaw gateway start
   ```
4. Run the app:
   ```bash
   npm run dev
   ```

## Technical Details

### Parallel Execution

Agents execute in parallel using `Promise.allSettled()`:
```typescript
const agentPromises = agents.map(agent =>
  executeAgentTask(agent, taskCommand, updateProgress, completeAgent)
);

await Promise.allSettled(agentPromises);
```

This allows all agents to work simultaneously without blocking each other.

### Status Polling

Real-time updates via polling:
- Interval: 2 seconds
- Endpoint: `/api/agents/status?sessionKey=${agent.sessionKey}`
- Progress calculation: Time-based (0-60 seconds = 25-90%)
- Completion detection: Session history analysis

### Shared Context

Type-specific shared data structures:
- **Website**: components, API endpoints, design colors, features
- **Research**: sources, findings, citations, data points
- **Data Analysis**: sources, metrics, charts, insights
- **General**: milestones, deliverables, notes

Update tracking:
```typescript
sharedContext.updates = {
  [`${key}-${Date.now()}`]: {
    agentId,
    timestamp: new Date(),
  },
};
```

## Files Changed

### New Files Created
- `src/app/api/agents/spawn/route.ts`
- `src/app/api/agents/status/route.ts`
- `src/app/api/agents/message/route.ts`
- `src/lib/agentDispatcher-real.ts`
- `src/hooks/useAgentCollaboration.ts`
- `src/components/AgentCollaboration.tsx`
- `.env.example`
- `REAL_TIME_COLLABORATION.md` (this file)

### Files Modified
- `src/types/agent.ts` - Added sessionKey, prompt, spawning status
- `src/contexts/TaskContext.tsx` - Updated to use real dispatcher
- `src/components/AgentItem.tsx` - Added spawning status support
- `src/app/page.tsx` - Added AgentCollaboration component
- `README.md` - Updated with collaboration documentation

## Testing

1. **Start OpenClaw Gateway**
   ```bash
   openclaw gateway start
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your gateway token
   ```

3. **Run Development Server**
   ```bash
   npm run dev
   ```

4. **Submit a Task**
   - Open http://localhost:3000
   - Enter a task (e.g., "Create a website for my portfolio")
   - Click "Dispatch Agents"

5. **Observe Real-Time Updates**
   - Watch agents spawn in parallel
   - See progress bars update
   - Monitor agent collaboration panel
   - View results as agents complete

## Future Enhancements

1. **WebSocket Integration**: Replace polling with real-time WebSocket
2. **Agent Coordination**: Add intelligent task delegation between agents
3. **Error Recovery**: Automatic retry and failover for failed agents
4. **Collaboration AI**: AI-powered agent message routing
5. **Visualization**: Graph visualization of agent interactions

## Notes

- Current implementation uses polling (2-3 second intervals)
- WebSocket integration would provide true real-time updates
- Agent messages are optional - collaboration feature can be disabled
- Shared context is type-specific and initialized on task start
- Each agent works in isolated OpenClaw session
- Sessions are automatically cleaned up after completion
