import { Hono } from 'hono';
import { config } from '../config.js';
import {
  createUser,
  getUserByEmail,
  updateUser,
  createEmailToken,
  getEmailToken,
  useEmailToken,
  createApiKey,
} from '../storage/admin.js';
import { validateEmail } from '../utils/validation.js';

const auth = new Hono();

const EMAIL_TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000;

function generateApiKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let key = 'zb_live_';
  for (let i = 0; i < 32; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return key;
}

function wantsJson(c: any): boolean {
  const accept = c.req.header('accept') || '';
  return accept.includes('application/json');
}

interface RegisterBody {
  email: string;
}

auth.post('/register', async (c) => {
  let body: RegisterBody;
  try {
    body = await c.req.json<RegisterBody>();
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

  const existingUser = getUserByEmail(email);
  if (existingUser) {
    if (existingUser.email_verified) {
      return c.json({ error: 'Email already registered' }, 409);
    }
    const existingToken = getEmailToken(existingUser.verification_token || '');
    if (existingToken && existingToken.expires_at > Date.now() && !existingToken.used_at) {
      return c.json({ error: 'Verification email already sent. Please check your inbox.' }, 409);
    }
    // Resend verification for unverified user
    const newToken = crypto.randomUUID();
    const expiresAt = Date.now() + EMAIL_TOKEN_EXPIRY_MS;
    createEmailToken({
      token: newToken,
      user_id: existingUser.id,
      email,
      type: 'registration',
      expires_at: expiresAt,
    });
    updateUser(existingUser.id, {
      verification_token: newToken,
      verification_expires: expiresAt,
    });
    console.log(`[VERIFICATION] ${email} -> ${config.baseUrl}/v1/verify/${newToken}`);
    return c.json({ message: 'Verification email sent', email });
  }

  // New user
  const userId = crypto.randomUUID();
  const verificationToken = crypto.randomUUID();
  const expiresAt = Date.now() + EMAIL_TOKEN_EXPIRY_MS;

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
    type: 'registration',
    expires_at: expiresAt,
  });

  console.log(`[VERIFICATION] ${email} -> ${config.baseUrl}/v1/verify/${verificationToken}`);

  return c.json({ message: 'Verification email sent', email }, 201);
});

auth.get('/verify/:token', async (c) => {
  const token = c.req.param('token');
  const isJson = wantsJson(c);

  // Validate token format (must be UUID - 36 chars)
  if (!token || token.length !== 36) {
    if (isJson) {
      return c.json({ error: 'Invalid token format' }, 400);
    }
    return c.html(`
      <!DOCTYPE html>
      <html>
        <head><title>Invalid Token - ZenBin</title></head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 500px; margin: 50px auto; padding: 20px; text-align: center;">
          <h1 style="color: #dc2626;">Invalid Token</h1>
          <p>The verification token format is invalid.</p>
        </body>
      </html>
    `, 400);
  }

  const emailToken = getEmailToken(token);
  if (!emailToken) {
    if (isJson) {
      return c.json({ error: 'Invalid token' }, 404);
    }
    return c.html(`
      <!DOCTYPE html>
      <html>
        <head><title>Token Not Found - ZenBin</title></head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 500px; margin: 50px auto; padding: 20px; text-align: center;">
          <h1 style="color: #dc2626;">Token Not Found</h1>
          <p>This verification token does not exist.</p>
        </body>
      </html>
    `, 404);
  }

  if (emailToken.used_at) {
    if (isJson) {
      return c.json({ error: 'Verification token already used' }, 410);
    }
    return c.html(`
      <!DOCTYPE html>
      <html>
        <head><title>Token Used - ZenBin</title></head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 500px; margin: 50px auto; padding: 20px; text-align: center;">
          <h1 style="color: #dc2626;">Token Already Used</h1>
          <p>This verification token has already been used.</p>
        </body>
      </html>
    `, 410);
  }

  if (emailToken.expires_at < Date.now()) {
    if (isJson) {
      return c.json({ error: 'Verification token expired' }, 410);
    }
    return c.html(`
      <!DOCTYPE html>
      <html>
        <head><title>Token Expired - ZenBin</title></head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 500px; margin: 50px auto; padding: 20px; text-align: center;">
          <h1 style="color: #dc2626;">Token Expired</h1>
          <p>This verification token has expired. Please register again.</p>
        </body>
      </html>
    `, 410);
  }

  const result = useEmailToken(token);
  if (!result) {
    if (isJson) {
      return c.json({ error: 'Verification failed' }, 500);
    }
    return c.html(`
      <!DOCTYPE html>
      <html>
        <head><title>Verification Failed - ZenBin</title></head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 500px; margin: 50px auto; padding: 20px; text-align: center;">
          <h1 style="color: #dc2626;">Verification Failed</h1>
          <p>Could not verify your email. Please try again.</p>
        </body>
      </html>
    `, 500);
  }

  // Mark user as verified
  updateUser(result.user_id, {
    email_verified: 1,
  });

  // Generate API key
  const apiKey = generateApiKey();
  createApiKey({
    id: apiKey,
    user_id: result.user_id,
    type: 'live',
    plan: 'free',
    name: 'Default API Key',
    monthly_limit: config.freeTier.monthlyLimit,
    created_at: Date.now(),
  });

  if (isJson) {
    return c.json({
      verified: true,
      api_key: apiKey,
      plan: 'free',
      limit: config.freeTier.monthlyLimit,
    });
  }

  return c.html(`
    <!DOCTYPE html>
    <html>
      <head><title>Email Verified - ZenBin</title></head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 500px; margin: 50px auto; padding: 20px; text-align: center;">
        <h1 style="color: #16a34a;">Email Verified!</h1>
        <p>Your email has been verified. Here is your API key:</p>
        <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; font-family: monospace; word-break: break-all; margin: 16px 0;">${apiKey}</div>
        <button onclick="navigator.clipboard.writeText('${apiKey}').then(() => this.textContent='Copied!')" style="background: #2563eb; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer;">Copy API Key</button>
        <p style="margin-top: 24px; font-size: 14px; color: #6b7280;">Keep this key safe. You will need it to authenticate API requests.</p>
      </body>
    </html>
  `);
});

export { auth };