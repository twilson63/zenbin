import { Hono } from 'hono';
import { getAgentInstructions } from '../docs/agentInstructions.js';

const wellKnown = new Hono();

// GET /.well-known/skill.md - canonical agent-facing ZenBin instructions
wellKnown.get('/skill.md', (c) => {
  c.header('Content-Type', 'text/markdown; charset=utf-8');
  return c.body(getAgentInstructions());
});

export { wellKnown };
