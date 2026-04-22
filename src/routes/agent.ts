import { Hono } from 'hono';
import { getAgentInstructions } from '../docs/agentInstructions.js';
import { getRegisterInstructions } from '../docs/registerInstructions.js';

const agent = new Hono();

// GET /api/agent - return the same canonical agent instructions exposed via /.well-known/skill.md
agent.get('/', (c) => {
  c.header('Content-Type', 'text/markdown; charset=utf-8');
  return c.body(getAgentInstructions());
});

// GET /api/register - return the canonical registration/signing guide
agent.get('/register', (c) => {
  c.header('Content-Type', 'text/markdown; charset=utf-8');
  return c.body(getRegisterInstructions());
});

export { agent };
