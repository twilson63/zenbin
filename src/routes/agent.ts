import { Hono } from 'hono';
import { getAgentInstructions } from '../docs/agentInstructions.js';

const agent = new Hono();

// GET /api/agent - return the same canonical agent instructions exposed via /.well-known/skill.md
agent.get('/', (c) => {
  c.header('Content-Type', 'text/markdown; charset=utf-8');
  return c.body(getAgentInstructions());
});

export { agent };
