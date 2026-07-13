const crypto = require('crypto');
const config = require('../../config/env');
const { encrypt, decrypt } = require('../../utils/cryptoUtils');

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GMAIL_PROFILE_URL = 'https://gmail.googleapis.com/gmail/v1/users/me/profile';

const GOOGLE_GMAIL_SCOPES = [
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.readonly'
];

function base64UrlEncode(input) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function base64UrlDecode(input) {
  const padded = input + '='.repeat((4 - (input.length % 4)) % 4);
  return Buffer.from(padded.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
}

class GoogleOAuthService {
  getRedirectUri() {
    return config.googleOAuth.redirectUri || `${config.backendBaseUrl}/api/email-integrations/google/callback`;
  }

  assertConfigured() {
    if (!config.googleOAuth.clientId || !config.googleOAuth.clientSecret) {
      throw new Error('Google OAuth is not configured. Set GOOGLE_OAUTH_CLIENT_ID and GOOGLE_OAUTH_CLIENT_SECRET in .env.');
    }
  }

  createState({ hotelId, mailboxEmail, returnTo = null }) {
    const payload = {
      hotelId: Number(hotelId),
      mailboxEmail,
      returnTo,
      nonce: crypto.randomBytes(16).toString('hex'),
      exp: Date.now() + (10 * 60 * 1000)
    };

    const encodedPayload = base64UrlEncode(JSON.stringify(payload));
    const signature = this.sign(encodedPayload);
    return `${encodedPayload}.${signature}`;
  }

  verifyState(state) {
    if (!state || !state.includes('.')) {
      throw new Error('Missing or invalid Google OAuth state.');
    }

    const [encodedPayload, signature] = state.split('.');
    const expected = this.sign(encodedPayload);
    const signatureBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expected);

    if (
      signatureBuffer.length !== expectedBuffer.length ||
      !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)
    ) {
      throw new Error('Invalid Google OAuth state signature.');
    }

    const payload = JSON.parse(base64UrlDecode(encodedPayload));
    if (!payload.exp || payload.exp < Date.now()) {
      throw new Error('Google OAuth state expired. Please reconnect.');
    }
    if (!payload.hotelId || !payload.mailboxEmail) {
      throw new Error('Google OAuth state is missing hotel context.');
    }

    return payload;
  }

  sign(value) {
    return crypto
      .createHmac('sha256', config.jwtSecret)
      .update(value)
      .digest('base64url');
  }

  buildAuthorizationUrl({ hotelId, mailboxEmail, returnTo = null }) {
    this.assertConfigured();

    const state = this.createState({ hotelId, mailboxEmail, returnTo });
    const params = new URLSearchParams({
      client_id: config.googleOAuth.clientId,
      redirect_uri: this.getRedirectUri(),
      response_type: 'code',
      scope: GOOGLE_GMAIL_SCOPES.join(' '),
      access_type: 'offline',
      include_granted_scopes: 'true',
      prompt: 'consent',
      state
    });

    if (mailboxEmail) {
      params.set('login_hint', mailboxEmail);
    }

    return `${GOOGLE_AUTH_URL}?${params.toString()}`;
  }

  async exchangeCodeForTokens(code) {
    this.assertConfigured();

    const response = await fetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: config.googleOAuth.clientId,
        client_secret: config.googleOAuth.clientSecret,
        redirect_uri: this.getRedirectUri(),
        grant_type: 'authorization_code'
      })
    });

    const payload = await response.json();
    if (!response.ok) {
      throw new Error(`Google OAuth token exchange failed: ${payload.error_description || payload.error || response.statusText}`);
    }

    return this.withExpiry(payload);
  }

  async refreshAccessToken(tokenPayload) {
    this.assertConfigured();
    if (!tokenPayload.refresh_token) {
      throw new Error('Google OAuth refresh token is missing. Reconnect the mailbox.');
    }

    const response = await fetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        refresh_token: tokenPayload.refresh_token,
        client_id: config.googleOAuth.clientId,
        client_secret: config.googleOAuth.clientSecret,
        grant_type: 'refresh_token'
      })
    });

    const payload = await response.json();
    if (!response.ok) {
      throw new Error(`Google OAuth token refresh failed: ${payload.error_description || payload.error || response.statusText}`);
    }

    return {
      ...tokenPayload,
      ...this.withExpiry(payload),
      refresh_token: payload.refresh_token || tokenPayload.refresh_token
    };
  }

  async getValidTokenPayload(encryptedTokenPayload) {
    if (!encryptedTokenPayload) {
      throw new Error('Google OAuth token payload is missing. Connect Google Workspace first.');
    }

    let tokenPayload = JSON.parse(decrypt(encryptedTokenPayload));
    const expiresAt = Number(tokenPayload.expiry_date || 0);
    const refreshWindowMs = 60 * 1000;

    if (expiresAt && expiresAt > Date.now() + refreshWindowMs) {
      return { tokenPayload, rotated: false };
    }

    tokenPayload = await this.refreshAccessToken(tokenPayload);
    return { tokenPayload, rotated: true };
  }

  encryptTokenPayload(tokenPayload) {
    return encrypt(JSON.stringify(tokenPayload));
  }

  async fetchGmailProfile(accessToken) {
    const response = await fetch(GMAIL_PROFILE_URL, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    const payload = await response.json();
    if (!response.ok) {
      throw new Error(`Gmail profile fetch failed: ${payload.error?.message || response.statusText}`);
    }

    return payload;
  }

  withExpiry(tokenPayload) {
    const expiresIn = Number(tokenPayload.expires_in || 0);
    return {
      ...tokenPayload,
      expiry_date: expiresIn ? Date.now() + (expiresIn * 1000) : tokenPayload.expiry_date
    };
  }
}

module.exports = {
  googleOAuthService: new GoogleOAuthService(),
  GOOGLE_GMAIL_SCOPES
};
