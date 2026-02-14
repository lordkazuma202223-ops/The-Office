import { storage } from '../storage';
import { TaskCommand, Agent } from '@/types/agent';

describe('storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Commands', () => {
    it('returns empty array when no commands stored', () => {
      const commands = storage.getCommands();
      expect(commands).toEqual([]);
    });

    it('stores and retrieves commands', () => {
      const commands: TaskCommand[] = [
        {
          id: 'cmd-1',
          command: 'test command',
          timestamp: '2024-01-01T00:00:00.000Z',
          status: 'pending',
        },
      ];

      storage.setCommands(commands);
      const retrieved = storage.getCommands();

      expect(retrieved).toEqual(commands);
    });

    it('adds command to storage', () => {
      const command: TaskCommand = {
        id: 'cmd-1',
        command: 'test command',
        timestamp: '2024-01-01T00:00:00.000Z',
        status: 'pending',
      };

      storage.addCommand(command);
      const commands = storage.getCommands();

      expect(commands).toHaveLength(1);
      expect(commands[0]).toEqual(command);
    });

    it('adds command to beginning of list', () => {
      const command1: TaskCommand = {
        id: 'cmd-1',
        command: 'first command',
        timestamp: '2024-01-01T00:00:00.000Z',
        status: 'pending',
      };

      const command2: TaskCommand = {
        id: 'cmd-2',
        command: 'second command',
        timestamp: '2024-01-01T01:00:00.000Z',
        status: 'pending',
      };

      storage.addCommand(command1);
      storage.addCommand(command2);

      const commands = storage.getCommands();

      expect(commands[0].id).toBe('cmd-2');
      expect(commands[1].id).toBe('cmd-1');
    });

    it('updates existing command', () => {
      const command: TaskCommand = {
        id: 'cmd-1',
        command: 'test command',
        timestamp: '2024-01-01T00:00:00.000Z',
        status: 'pending',
      };

      storage.addCommand(command);
      storage.updateCommand('cmd-1', { status: 'completed', result: 'Success' });

      const commands = storage.getCommands();
      expect(commands[0]).toEqual({
        ...command,
        status: 'completed',
        result: 'Success',
      });
    });

    it('does not update non-existent command', () => {
      const command: TaskCommand = {
        id: 'cmd-1',
        command: 'test command',
        timestamp: '2024-01-01T00:00:00.000Z',
        status: 'pending',
      };

      storage.addCommand(command);
      storage.updateCommand('cmd-999', { status: 'completed' });

      const commands = storage.getCommands();
      expect(commands[0].status).toBe('pending');
    });

    it('clears all commands', () => {
      const command: TaskCommand = {
        id: 'cmd-1',
        command: 'test command',
        timestamp: '2024-01-01T00:00:00.000Z',
        status: 'pending',
      };

      storage.addCommand(command);
      storage.clearCommands();

      const commands = storage.getCommands();
      expect(commands).toEqual([]);
    });
  });

  describe('Agents', () => {
    it('returns empty array when no agents stored', () => {
      const agents = storage.getAgents();
      expect(agents).toEqual([]);
    });

    it('stores and retrieves agents', () => {
      const agents: Agent[] = [
        {
          id: 'agent-1',
          name: 'Test Agent',
          status: 'idle',
          progress: 0,
        },
      ];

      storage.setAgents(agents);
      const retrieved = storage.getAgents();

      expect(retrieved).toEqual(agents);
    });

    it('updates existing agent', () => {
      const agent: Agent = {
        id: 'agent-1',
        name: 'Test Agent',
        status: 'idle',
        progress: 0,
      };

      storage.setAgents([agent]);
      storage.updateAgent('agent-1', { status: 'running', progress: 50 });

      const agents = storage.getAgents();
      expect(agents[0]).toEqual({
        ...agent,
        status: 'running',
        progress: 50,
      });
    });

    it('does not update non-existent agent', () => {
      const agent: Agent = {
        id: 'agent-1',
        name: 'Test Agent',
        status: 'idle',
        progress: 0,
      };

      storage.setAgents([agent]);
      storage.updateAgent('agent-999', { status: 'running' });

      const agents = storage.getAgents();
      expect(agents[0].status).toBe('idle');
    });
  });
});
