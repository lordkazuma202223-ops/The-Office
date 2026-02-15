import { Agent, Task } from '@/types/agent';

// Agent templates based on task type
const AGENT_TEMPLATES = {
  website: [
    { name: 'Researcher', role: 'Research Lead', prompt: 'Research best practices, libraries, and solutions for the project', isLead: true },
    { name: 'Frontend Developer', role: 'Frontend Implementation', prompt: 'Implement frontend features with React, ensure responsive design and accessibility', isLead: false },
    { name: 'UI/UX Designer', role: 'Design & UX', prompt: 'Refine UI/UX design, improve user experience and visual consistency', isLead: false },
  ],
  'data-analysis': [
    { name: 'Data Analyst', role: 'Data Specialist', prompt: 'Analyze datasets, identify patterns and generate insights', isLead: true },
    { name: 'Statistical Expert', role: 'Statistics', prompt: 'Perform statistical analysis, create models and validate findings', isLead: false },
    { name: 'Visualizer', role: 'Data Visualization', prompt: 'Create visualizations (charts, graphs) to present data clearly', isLead: false },
  ],
  research: [
    { name: 'Primary Researcher', role: 'Research Lead', prompt: 'Conduct comprehensive research on the topic', isLead: true },
    { name: 'Analyst', role: 'Data Analysis', prompt: 'Analyze research findings, synthesize information', isLead: false },
    { name: 'Fact Checker', role: 'Verification', prompt: 'Verify claims, cross-reference sources, ensure accuracy', isLead: false },
  ],
  general: [
    { name: 'Executor', role: 'Task Executor', prompt: 'Execute task efficiently, provide clear steps and deliverables', isLead: true },
    { name: 'Reviewer', role: 'Quality Review', prompt: 'Review work, identify issues and suggest improvements', isLead: false },
  ],
};

// Detect task type from command
export function detectTaskType(command: string): Task['type'] {
  const lowerCommand = command.toLowerCase();

  if (
    lowerCommand.includes('website') ||
    lowerCommand.includes('web app') ||
    lowerCommand.includes('create a site') ||
    lowerCommand.includes('build a site')
  ) {
    return 'website';
  }

  if (
    lowerCommand.includes('data') ||
    lowerCommand.includes('analysis') ||
    lowerCommand.includes('statistics') ||
    lowerCommand.includes('dataset')
  ) {
    return 'data-analysis';
  }

  if (
    lowerCommand.includes('research') ||
    lowerCommand.includes('find information') ||
    lowerCommand.includes('investigate')
  ) {
    return 'research';
  }

  return 'general';
}

// Spawn agents based on task type with lead/specialist roles
export function spawnAgents(command: string): Agent[] {
  const taskType = detectTaskType(command);
  const templates = AGENT_TEMPLATES[taskType];

  return templates.map((template, index) => ({
    id: `agent-${Date.now()}-${index}`,
    name: template.name,
    role: template.role,
    status: 'idle' as const,
    progress: 0,
    startedAt: undefined,
    completedAt: undefined,
    sessionKey: undefined,
    prompt: template.prompt,
    isLead: template.isLead || false, // Mark lead agent
  }));
}

// Execute agent task with sequential collaboration
export async function executeAgentTask(
  agent: Agent,
  taskCommand: string,
  updateProgress: (agentId: string, progress: number, output?: string) => void,
  completeAgent: (agentId: string, status: 'completed' | 'error', output?: string) => void,
  leadAgentOutput?: string // Output from lead agent to pass to specialists
): Promise<string> {
  try {
    // Update agent status to spawning
    agent.status = 'spawning';
    agent.startedAt = new Date();
    updateProgress(agent.id, 10, 'Spawning agent...');

    // Build prompt with collaboration context
    let fullPrompt = `${agent.prompt}\n\nTask: ${taskCommand}`;

    // If this is a specialist and we have lead output, add context
    if (!agent.isLead && leadAgentOutput) {
      fullPrompt += `\n\n=== LEAD AGENT OUTPUT ===\n${leadAgentOutput}\n=== END LEAD OUTPUT ===\n\nIMPORTANT: Build upon this work. Do NOT start from scratch. Collaborate with this output.`;
    }

    // If this is the lead agent, mark as coordinator
    if (agent.isLead) {
      fullPrompt += `\n\n=== COLLABORATION INSTRUCTIONS ===\nYou are the LEAD agent. Your job is to:\n1. Provide the initial foundation and structure\n2. Other specialists will build upon your work\n3. Keep your output clear and well-structured\n4. Provide files, code snippets, or specific deliverables\n\nDO NOT complete everything yourself - let specialists handle their parts.`;
    }

    // Spawn agent via OpenClaw Gateway API
    const spawnResponse = await fetch('/api/agents/spawn', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        task: fullPrompt,
        agentId: agent.id,
        agentName: agent.name,
      }),
    });

    if (!spawnResponse.ok) {
      const error = await spawnResponse.text();
      throw new Error(`Failed to spawn agent: ${error}`);
    }

    const spawnData = await spawnResponse.json();
    if (!spawnData.ok) {
      throw new Error(spawnData.error || 'Unknown error spawning agent');
    }

    // Update agent with session key
    agent.sessionKey = spawnData.sessionKey;
    agent.status = 'running';
    updateProgress(agent.id, 25, 'Agent started, working on task...');

    // Poll for agent status updates
    const pollInterval = setInterval(async () => {
      try {
        const statusResponse = await fetch(`/api/agents/status?sessionKey=${agent.sessionKey}`);
        if (!statusResponse.ok) {
          clearInterval(pollInterval);
          return;
        }

        const statusData = await statusResponse.json();

        // Update progress based on status
        if (statusData.sessions && statusData.sessions.length > 0) {
          const session = statusData.sessions[0];
          const timeElapsed = Date.now() - new Date(session.updatedAt).getTime();

          // Simulate progress based on time elapsed (0-60 seconds = 25-90%)
          let progress = 25 + Math.min((timeElapsed / 60000) * 65, 65);

          if (progress > agent.progress) {
            agent.progress = progress;
            updateProgress(agent.id, progress, 'Processing...');
          }
        }
      } catch (error) {
        console.error('Error polling agent status:', error);
      }
    }, 2000); // Poll every 2 seconds

    // Wait for agent completion
    return new Promise<string>((resolve, reject) => {
      const timeout = setTimeout(async () => {
        clearInterval(pollInterval);

        try {
          const historyResponse = await fetch(`/api/agents/status?sessionKey=${agent.sessionKey}`);
          if (historyResponse.ok) {
            const historyData = await historyResponse.json();

            // Parse session history to determine completion
            const isCompleted = historyData.lastMessage?.includes('✅') ||
                            historyData.lastMessage?.includes('completed') ||
                            agent.progress >= 90;

            const isError = historyData.lastMessage?.includes('error') ||
                         historyData.lastMessage?.includes('failed');

            if (isError) {
              agent.status = 'error';
              agent.progress = 100;
              agent.completedAt = new Date();
              completeAgent(agent.id, 'error', 'Agent encountered an error. Check logs for details.');
              reject(new Error('Agent failed'));
            } else if (isCompleted || agent.progress >= 90) {
              agent.status = 'completed';
              agent.progress = 100;
              agent.completedAt = new Date();

              // Extract output from history
              const output = historyData.lastMessage || 'Task completed successfully!';
              completeAgent(agent.id, 'completed', output);
              resolve(output);
            }
          }
        } catch (error) {
          console.error('Error fetching final status:', error);
          reject(error);
        }
      }, 90000); // Timeout after 90 seconds

      // Add initial progress step
      setTimeout(() => {
        updateProgress(agent.id, 15, 'Initializing...');
      }, 1000);
    });

  } catch (error) {
    console.error('Error executing agent task:', error);
    agent.status = 'error';
    agent.progress = 100;
    agent.completedAt = new Date();
    completeAgent(agent.id, 'error', error instanceof Error ? error.message : 'Failed to execute task');
    throw error;
  }
}

// Execute agents with sequential collaboration (lead first, then specialists)
export async function executeAgentsSequentially(
  agents: Agent[],
  taskCommand: string,
  updateProgress: (agentId: string, progress: number, output?: string) => void,
  completeAgent: (agentId: string, status: 'completed' | 'error', output?: string) => void
): Promise<void> {
  // Find the lead agent
  const leadAgent = agents.find(a => a.isLead);
  const specialists = agents.filter(a => !a.isLead);

  if (!leadAgent) {
    // No lead agent, execute all in parallel (fallback)
    await executeAgentsInParallel(agents, taskCommand, updateProgress, completeAgent);
    return;
  }

  // Execute lead agent first
  updateProgress(leadAgent.id, 0, 'Starting lead agent...');
  const leadOutput = await executeAgentTask(
    leadAgent,
    taskCommand,
    updateProgress,
    completeAgent
  );

  // Execute specialists sequentially with lead output
  for (const specialist of specialists) {
    updateProgress(specialist.id, 0, `Starting ${specialist.name}...`);

    try {
      await executeAgentTask(
        specialist,
        taskCommand,
        updateProgress,
        completeAgent,
        leadOutput // Pass lead output to specialist
      );
    } catch (error) {
      console.error(`Specialist ${specialist.name} failed:`, error);
      // Continue with other specialists even if one fails
    }
  }
}

// Execute multiple agents in parallel (fallback)
export async function executeAgentsInParallel(
  agents: Agent[],
  taskCommand: string,
  updateProgress: (agentId: string, progress: number, output?: string) => void,
  completeAgent: (agentId: string, status: 'completed' | 'error', output?: string) => void
): Promise<void> {
  const agentPromises = agents.map(agent =>
    executeAgentTask(agent, taskCommand, updateProgress, completeAgent)
  );

  await Promise.allSettled(agentPromises);
}

// Store task in localStorage
export function saveTaskToHistory(task: Task): void {
  if (typeof window === 'undefined') return;

  try {
    const history = getTaskHistory();
    history.tasks.push(task);
    localStorage.setItem('agent-task-history', JSON.stringify(history));
  } catch (error) {
    console.error('Failed to save task to history:', error);
  }
}

// Get task history from localStorage
export function getTaskHistory(): { tasks: Task[] } {
  if (typeof window === 'undefined') return { tasks: [] };

  try {
    const stored = localStorage.getItem('agent-task-history');
    return stored ? JSON.parse(stored) : { tasks: [] };
  } catch (error) {
    console.error('Failed to load task history:', error);
    return { tasks: [] };
  }
}

// Clear task history
export function clearTaskHistory(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem('agent-task-history');
  } catch (error) {
    console.error('Failed to clear task history:', error);
  }
}
