import { Hono } from 'hono';
import { getAgentInstructions } from '../docs/agentInstructions.js';
import { getRegisterInstructions } from '../docs/registerInstructions.js';
import { getAgentSetupInstructions } from '../docs/agentSetupInstructions.js';

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

// GET /.well-known/agent.md - combined setup: keygen → register → publish → save to memory
wellKnown.get('/agent.md', (c) => {
  c.header('Content-Type', 'text/markdown; charset=utf-8');
  return c.body(getAgentSetupInstructions());
});

export { wellKnown };
