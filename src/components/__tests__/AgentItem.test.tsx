import React from 'react';
import { render, screen } from '@testing-library/react';
import { AgentItem } from '../AgentItem';
import { ThemeProvider } from '@/contexts/ThemeContext';

const mockAgent = {
  id: 'agent-1',
  name: 'Frontend Developer',
  role: 'Frontend Dev',
  status: 'running' as const,
  progress: 50,
  output: 'Processing...',
  startedAt: new Date(),
};

const renderWithTheme = (component: React.ReactNode) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('AgentItem', () => {
  it('renders agent name and role', () => {
    renderWithTheme(<AgentItem agent={mockAgent} />);
    expect(screen.getByText('Frontend Developer')).toBeInTheDocument();
    expect(screen.getByText('Frontend Dev')).toBeInTheDocument();
  });

  it('displays correct status', () => {
    renderWithTheme(<AgentItem agent={mockAgent} />);
    expect(screen.getByText('running')).toBeInTheDocument();
  });

  it('displays progress percentage', () => {
    renderWithTheme(<AgentItem agent={mockAgent} />);
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('shows loading animation when running', () => {
    renderWithTheme(<AgentItem agent={mockAgent} />);
    const dots = document.querySelectorAll('.animate-bounce');
    expect(dots.length).toBe(3);
  });

  it('does not show loading animation when completed', () => {
    const completedAgent = { ...mockAgent, status: 'completed' as const };
    renderWithTheme(<AgentItem agent={completedAgent} />);
    const dots = document.querySelectorAll('.animate-bounce');
    expect(dots.length).toBe(0);
  });
});
