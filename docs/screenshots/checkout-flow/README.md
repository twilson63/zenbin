# Checkout flow screenshots

Captured locally against ZenBin on `http://localhost:4318` with Stripe test mode and Stripe CLI webhook forwarding.

## Files

- `00-local-pricing-page.png` — local ZenBin landing/pricing page.
- `01b-stripe-checkout-pro-fresh.png` — Stripe Checkout for the Pro test plan.
- `02-stripe-checkout-filled-email-link-off.png` — Pro checkout with email entered and Link save unchecked.
- `03-stripe-checkout-agent-disclosure-checked.png` — Stripe AI-agent disclosure checked.
- `04-stripe-checkout-link-cli-confirmed.png` — Link CLI instructions acknowledged.
- `05-stripe-checkout-enterprise.png` — Stripe Checkout for the Enterprise test plan.

Additional intermediate captures are kept in this folder for reference.

## Local test notes

The local app was running on port `4318` because port `3000` was occupied. Stripe webhooks were forwarded with:

```bash
stripe listen --forward-to localhost:4318/v1/billing/webhook
```
