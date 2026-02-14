import {
  detectTaskType,
  spawnAgents,
} from '../agentDispatcher';

describe('agentDispatcher', () => {
  describe('detectTaskType', () => {
    it('should detect website type', () => {
      expect(detectTaskType('create a website')).toBe('website');
      expect(detectTaskType('build a web app')).toBe('website');
      expect(detectTaskType('create a site')).toBe('website');
    });

    it('should detect data-analysis type', () => {
      expect(detectTaskType('analyze this data')).toBe('data-analysis');
      expect(detectTaskType('data analysis task')).toBe('data-analysis');
      expect(detectTaskType('statistics on dataset')).toBe('data-analysis');
    });

    it('should detect research type', () => {
      expect(detectTaskType('research this topic')).toBe('research');
      expect(detectTaskType('find information about')).toBe('research');
      expect(detectTaskType('investigate')).toBe('research');
    });

    it('should default to general type', () => {
      expect(detectTaskType('do something')).toBe('general');
      expect(detectTaskType('random task')).toBe('general');
    });
  });

  describe('spawnAgents', () => {
    it('should spawn correct number of agents for website', () => {
      const agents = spawnAgents('create a website');
      expect(agents).toHaveLength(4);
      expect(agents[0].role).toBe('Frontend Dev');
      expect(agents[1].role).toBe('Backend Dev');
    });

    it('should spawn correct number of agents for data-analysis', () => {
      const agents = spawnAgents('analyze data');
      expect(agents).toHaveLength(4);
      expect(agents[0].role).toBe('Data Specialist');
    });

    it('should spawn correct number of agents for research', () => {
      const agents = spawnAgents('research this');
      expect(agents).toHaveLength(4);
      expect(agents[0].role).toBe('Research Lead');
    });

    it('should spawn correct number of agents for general', () => {
      const agents = spawnAgents('do something');
      expect(agents).toHaveLength(2);
    });

    it('should create agents with correct structure', () => {
      const agents = spawnAgents('create a website');
      agents.forEach(agent => {
        expect(agent).toHaveProperty('id');
        expect(agent).toHaveProperty('name');
        expect(agent).toHaveProperty('role');
        expect(agent).toHaveProperty('status');
        expect(agent).toHaveProperty('progress');
        expect(agent.status).toBe('pending');
        expect(agent.progress).toBe(0);
      });
    });
  });
});
