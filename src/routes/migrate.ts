import { Hono } from 'hono';
import {
  createUser,
  getUserByEmail,
  updateUser,
  createEmailToken,
  getEmailToken,
  useEmailToken,
  createApiKey,
  getSubdomainsByUserId,
  getSubdomainByName,
  updateSubdomain,
} from '../storage/admin.js';
import { validateEmail } from '../utils/validation.js';

const migrate = new Hono();

const EMAIL_TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000;
const BONUS_QUOTA = 50; // Extra requests for early adopters

// POST /v1/migrate - Migrate anonymous user to registered account
migrate.post('/', async (c) => {
  let body: { email: string; fingerprint?: string };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  if (!body.email || typeof body.email !== 'string') {
    return c.json({ error: 'Email is required' }, 400);
  }

  const emailValidation = validateEmail(body.email);
  if (emailValidation) {
    return c.json({ error: emailValidation.message }, 400);
  }

  const email = body.email.toLowerCase().trim();

  // Check if email already registered
  const existingUser = getUserByEmail(email);
  if (existingUser) {
    if (existingUser.email_verified) {
      return c.json({
        error: 'Email already registered',
        message: 'Try logging in instead. Use POST /v1/keys/me to retrieve your key.',
      }, 409);
    }
    // Resend verification for pending user
    const existingToken = getEmailToken(existingUser.verification_token || '');
    if (existingToken && existingToken.expires_at > Date.now() && !existingToken.used_at) {
      return c.json({
        message: 'Verification email already sent. Please check your inbox.',
        email,
      }, 200);
    }
  }

  // Create pending user
  const userId = crypto.randomUUID();
  const verificationToken = crypto.randomUUID();
  const expiresAt = Date.now() + EMAIL_TOKEN_EXPIRY_MS;

  if (existingUser) {
    // Update existing pending user
    updateUser(existingUser.id, {
      verification_token: verificationToken,
      verification_expires: expiresAt,
    });
    createEmailToken({
      token: verificationToken,
      user_id: existingUser.id,
      email,
      type: 'migration',
      expires_at: expiresAt,
    });
  } else {
    // Create new user
    createUser({
      id: userId,
      email,
      email_verified: 0,
      verification_token: verificationToken,
      verification_expires: expiresAt,
      created_at: Date.now(),
    });
    createEmailToken({
      token: verificationToken,
      user_id: userId,
      email,
      type: 'migration',
      expires_at: expiresAt,
    });
  }

  console.log(`[MIGRATION] ${email} -> ${process.env.BASE_URL || 'http://localhost:3000'}/v1/verify/${verificationToken}`);

  return c.json({
    message: 'Verification email sent',
    email,
    note: 'After verification, your existing pages will be linked to your account.',
  }, existingUser ? 200 : 201);
});

// GET /v1/migrate/subdomains - List claimable subdomains for current user
migrate.get('/subdomains', async (c) => {
  const user = c.get('user');
  if (!user) {
    return c.json({ error: 'Authentication required' }, 401);
  }

  const subdomains = getSubdomainsByUserId(user.id);
  return c.json({
    subdomains: subdomains.map(s => ({
      name: s.name,
      page_count: s.page_count,
      created_at: new Date(s.created_at).toISOString(),
    })),
  });
});

// POST /v1/migrate/claim - Claim an anonymous subdomain
migrate.post('/claim', async (c) => {
  const user = c.get('user');
  if (!user) {
    return c.json({ error: 'Authentication required' }, 401);
  }

  let body: { subdomain: string };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  if (!body.subdomain || typeof body.subdomain !== 'string') {
    return c.json({ error: 'Subdomain is required' }, 400);
  }

  const subdomain = body.subdomain.toLowerCase().trim();

  // Check if subdomain exists and is unclaimed
  const existing = getSubdomainByName(subdomain);
  
  if (!existing) {
    return c.json({ error: 'Subdomain not found' }, 404);
  }

  if (existing.user_id && existing.user_id !== user.id) {
    return c.json({ error: 'Subdomain already claimed by another user' }, 409);
  }

  if (existing.user_id === user.id) {
    return c.json({ message: 'Subdomain already claimed', subdomain }, 200);
  }

  // Claim the subdomain
  updateSubdomain(subdomain, {
    user_id: user.id,
  });

  return c.json({
    message: 'Subdomain claimed successfully',
    subdomain,
    page_count: existing.page_count,
  });
});

export { migrate };