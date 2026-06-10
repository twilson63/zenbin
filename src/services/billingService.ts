/**
 * ZenBin Billing Service
 *
 * Handles Stripe checkout, portal, webhooks, and meter events.
 * Gracefully degrades when Stripe is not configured.
 */

import Stripe from 'stripe';
import { config } from '../config.js';
import { getAgentKey, listAgentKeys, updateAgentKeyPlan, resetAgentKeyUsage } from '../storage/db.js';
import { isBillingCycleExpired, PLAN_LIMITS } from '../rules.js';
import type { Plan } from '../types.js';
import type { IBillingService } from '../services/interfaces.js';

function getStripeClient(): Stripe | null {
  if (!config.stripe.secretKey) return null;
  return new Stripe(config.stripe.secretKey);
}

function getPriceId(plan: Plan): string {
  switch (plan) {
    case 'pro':
      return config.stripe.proPriceId;
    case 'enterprise':
      return config.stripe.enterprisePriceId;
    case 'free':
      return '';
  }
}

export class BillingService implements IBillingService {
  async createCheckoutSession(keyId: string, plan: Plan): Promise<{ url: string; sessionId: string }> {
    const stripe = getStripeClient();
    if (!stripe) {
      throw new Error('Stripe is not configured. Set STRIPE_SECRET_KEY.');
    }

    const agentKey = getAgentKey(keyId);
    if (!agentKey) {
      throw new Error(`Agent key '${keyId}' not found.`);
    }

    // Prevent duplicate subscriptions / double billing. Plan changes must go
    // through the billing portal, not a fresh checkout.
    if (agentKey.subscriptionId) {
      throw new Error('Key already has an active subscription. Use the billing portal to change plans.');
    }

    const priceId = getPriceId(plan);
    if (!priceId) {
      throw new Error(`Invalid plan '${plan}' or price ID not configured.`);
    }

    // Create or reuse Stripe customer
    let customerId = agentKey.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        metadata: { zenbinKeyId: keyId },
      });
      customerId = customer.id;
      await updateAgentKeyPlan(keyId, agentKey.plan || 'free', customerId, agentKey.subscriptionId);
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: config.stripe.checkoutSuccessUrl,
      cancel_url: config.stripe.portalReturnUrl,
      metadata: { zenbinKeyId: keyId, zenbinPlan: plan },
    });

    return {
      url: session.url || '',
      sessionId: session.id,
    };
  }

  async createPortalSession(stripeCustomerId: string): Promise<{ url: string }> {
    const stripe = getStripeClient();
    if (!stripe) {
      throw new Error('Stripe is not configured.');
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: config.stripe.portalReturnUrl,
    });

    return { url: session.url };
  }

  async getUsage(keyId: string) {
    let agentKey = getAgentKey(keyId);
    if (!agentKey) {
      throw new Error(`Agent key '${keyId}' not found.`);
    }

    if (isBillingCycleExpired(agentKey.billingCycleStart, config.freeTier.monthlyWindowMs)) {
      await resetAgentKeyUsage(keyId);
      agentKey = getAgentKey(keyId);
      if (!agentKey) {
        throw new Error(`Agent key '${keyId}' not found.`);
      }
    }

    const plan = agentKey.plan || 'free';
    const limits = PLAN_LIMITS[plan];

    return {
      plan,
      pagesUsed: agentKey.monthlyPageCount || 0,
      subdomainsUsed: agentKey.monthlySubdomainCount || 0,
      limits: {
        pagesPerMonth: limits.pagesPerMonth,
        subdomains: limits.subdomains,
      },
    };
  }

  async handleWebhook(event: { type: string; data: { object: any } }): Promise<void> {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const keyId = session.metadata?.zenbinKeyId;
        const plan = session.metadata?.zenbinPlan as Plan;
        const customerId = session.customer;
        const subscriptionId = session.subscription;

        if (keyId && plan) {
          const existing = getAgentKey(keyId);
          // Idempotent: only apply + reset usage on a real transition, so a
          // redelivered webhook cannot re-zero accrued mid-cycle usage.
          if (!existing || existing.subscriptionId !== subscriptionId || existing.plan !== plan) {
            await updateAgentKeyPlan(keyId, plan, customerId, subscriptionId);
            await resetAgentKeyUsage(keyId);
          }
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const subscriptionId = subscription.id;

        // Match strictly on the recorded subscription id — cancelling an old
        // subscription must not downgrade a key that has an active replacement.
        const agentKey = subscriptionId
          ? listAgentKeys().find((key) => key.subscriptionId === subscriptionId)
          : undefined;

        if (agentKey) {
          await updateAgentKeyPlan(agentKey.keyId, 'free', agentKey.stripeCustomerId, '');
          await resetAgentKeyUsage(agentKey.keyId);
        }
        break;
      }

      case 'invoice.payment_failed': {
        // Mark for grace period — could send notification
        // For now, just log
        break;
      }

      default:
        // Ignore other events
        break;
    }
  }

  async recordMeterEvent(keyId: string, eventName: string, value: number): Promise<void> {
    const stripe = getStripeClient();
    if (!stripe) return; // Silently skip if not configured

    const agentKey = getAgentKey(keyId);
    if (!agentKey?.stripeCustomerId) return;

    await stripe.billing.meterEvents.create({
      event_name: eventName,
      payload: {
        stripe_customer_id: agentKey.stripeCustomerId,
        value: String(value),
      },
    });
  }
}

export const billingService: IBillingService = new BillingService();
