import { Hono } from 'hono';
import { getAgentInstructions } from '../docs/agentInstructions.js';
import { getRegisterInstructions } from '../docs/registerInstructions.js';

const wellKnown = new Hono();

// GET /.well-known/skill.md - canonical agent-facing ZenBin instructions
wellKnown.get('/skill.md', (c) => {
  c.header('Content-Type', 'text/markdown; charset=utf-8');
  return c.body(getAgentInstructions());
});

// GET /.well-known/register.md - key generation, registration, and signing guide
wellKnown.get('/register.md', (c) => {
  c.header('Content-Type', 'text/markdown; charset=utf-8');
  return c.body(getRegisterInstructions());
});

export { wellKnown };
