import { render, screen } from '@testing-library/react';
import AgentCard from '../AgentCard';
import { Agent } from '@/types/agent';

describe('AgentCard', () => {
  const mockAgent: Agent = {
    id: 'agent-1',
    name: 'Test Agent',
    status: 'idle',
    progress: 0,
  };

  it('renders agent information', () => {
    render(<AgentCard agent={mockAgent} />);

    expect(screen.getByText('Test Agent')).toBeInTheDocument();
    expect(screen.getByText('Progress')).toBeInTheDocument();
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('displays correct status color for running agent', () => {
    const runningAgent: Agent = { ...mockAgent, status: 'running', progress: 50 };
    render(<AgentCard agent={runningAgent} />);

    const statusIndicator = screen.getByRole('button')?.querySelector('.bg-yellow-400');
    expect(statusIndicator).toBeInTheDocument();
  });

  it('displays correct status color for completed agent', () => {
    const completedAgent: Agent = { ...mockAgent, status: 'completed', progress: 100 };
    render(<AgentCard agent={completedAgent} />);

    const statusIndicator = screen.getByRole('button')?.querySelector('.bg-green-500');
    expect(statusIndicator).toBeInTheDocument();
  });

  it('displays correct status color for error agent', () => {
    const errorAgent: Agent = { ...mockAgent, status: 'error', progress: 75 };
    render(<AgentCard agent={errorAgent} />);

    const statusIndicator = screen.getByRole('button')?.querySelector('.bg-red-500');
    expect(statusIndicator).toBeInTheDocument();
  });

  it('displays task when provided', () => {
    const agentWithTask: Agent = {
      ...mockAgent,
      status: 'running',
      task: 'Processing request',
    };
    render(<AgentCard agent={agentWithTask} />);

    expect(screen.getByText('Processing request')).toBeInTheDocument();
  });

  it('shows loading animation for running agent', () => {
    const runningAgent: Agent = { ...mockAgent, status: 'running', progress: 50 };
    render(<AgentCard agent={runningAgent} />);

    expect(screen.getByText('Processing...')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<AgentCard agent={mockAgent} onClick={handleClick} />);

    const card = screen.getByRole('button');
    fireEvent.click(card);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
