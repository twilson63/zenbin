/**
 * ZenBin Billing Routes
 *
 * POST /v1/billing/usage     — get current usage and limits (requires signed agent)
 * POST /v1/billing/checkout   — create Stripe Checkout session (requires signed agent)
 * POST /v1/billing/portal     — create Stripe Customer Portal session (requires signed agent)
 * POST /v1/billing/webhook    — Stripe webhook handler (raw body, signature verify)
 */

import { Hono } from 'hono';
import { config } from '../config.js';
import { getAgentKey } from '../storage/db.js';
import { requireSignedAgent } from '../middleware/signedAgent.js';
import { billingService } from '../services/billingService.js';
import { PLAN_LIMITS } from '../rules.js';
import type { Plan } from '../types.js';

const billing = new Hono();

// Auth middleware for all billing routes EXCEPT webhook
billing.use('/usage', requireSignedAgent);
billing.use('/checkout', requireSignedAgent);
billing.use('/portal', requireSignedAgent);

// ─── POST /v1/billing/usage — get current plan usage ─────────
billing.post('/usage', async (c) => {
  const signedAgent = c.get('signedAgent');
  if (!signedAgent) {
    return c.json({ error: 'Signed request required' }, 401);
  }

  const keyId = signedAgent.key.keyId;

  try {
    const usage = await billingService.getUsage(keyId);
    return c.json(usage);
  } catch (err: any) {
    return c.json({ error: err.message }, 404);
  }
});

// ─── POST /v1/billing/checkout — create Stripe Checkout ─────
billing.post('/checkout', async (c) => {
  const signedAgent = c.get('signedAgent');
  if (!signedAgent) {
    return c.json({ error: 'Signed request required' }, 401);
  }

  let body: { plan?: string };
  try {
    body = await c.req.json();
  } catch {
    body = {};
  }

  const plan = (body.plan || 'pro') as Plan;
  if (!PLAN_LIMITS[plan] || plan === 'free') {
    return c.json({ error: 'Invalid plan. Choose "pro" or "enterprise".' }, 400);
  }

  if (!config.stripe.secretKey) {
    return c.json({ error: 'Billing is not configured on this server.' }, 503);
  }

  const keyId = signedAgent.key.keyId;

  try {
    const session = await billingService.createCheckoutSession(keyId, plan);
    return c.json({ url: session.url, sessionId: session.sessionId });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// ─── POST /v1/billing/portal — create Stripe Portal ──────────
billing.post('/portal', async (c) => {
  const signedAgent = c.get('signedAgent');
  if (!signedAgent) {
    return c.json({ error: 'Signed request required' }, 401);
  }

  const agentKey = getAgentKey(signedAgent.key.keyId);
  if (!agentKey?.stripeCustomerId) {
    return c.json({ error: 'No billing account found. Subscribe first.' }, 404);
  }

  if (!config.stripe.secretKey) {
    return c.json({ error: 'Billing is not configured on this server.' }, 503);
  }

  try {
    const session = await billingService.createPortalSession(agentKey.stripeCustomerId);
    return c.json({ url: session.url });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// ─── POST /v1/billing/webhook — Stripe webhook ───────────────
// No auth middleware — Stripe signs webhooks with its own signature

billing.post('/webhook', async (c) => {
  if (!config.stripe.webhookSecret) {
    return c.json({ error: 'Webhook not configured' }, 503);
  }

  const body = await c.req.text();
  const signature = c.req.header('Stripe-Signature');

  if (!signature) {
    return c.json({ error: 'Missing Stripe-Signature header' }, 400);
  }

  // Verify webhook signature
  let event: any;
  try {
    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(config.stripe.secretKey);
    event = stripe.webhooks.constructEvent(body, signature, config.stripe.webhookSecret);
  } catch (err: any) {
    return c.json({ error: `Webhook signature verification failed: ${err.message}` }, 400);
  }

  try {
    await billingService.handleWebhook(event);
    return c.json({ received: true });
  } catch (err: any) {
    console.error('Webhook handling error:', err);
    return c.json({ error: err.message }, 500);
  }
});

export { billing };