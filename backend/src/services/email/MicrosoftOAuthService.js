const crypto = require('crypto');
const config = require('../../config/env');
const { encrypt, decrypt } = require('../../utils/cryptoUtils');

const MICROSOFT_AUTH_BASE_URL = 'https://login.microsoftonline.com';
const MICROSOFT_GRAPH_BASE_URL = 'https://graph.microsoft.com/v1.0';

const MICROSOFT_MAIL_SCOPES = [
  'offline_access',
  'User.Read',
  'Mail.Read',
  'Mail.Send'
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

class MicrosoftOAuthService {
  getTenantId() {
    return config.microsoftOAuth.tenantId || 'common';
  }

  getRedirectUri() {
    return config.microsoftOAuth.redirectUri || `${config.backendBaseUrl}/api/email-integrations/microsoft/callback`;
  }

  getTokenUrl() {
    return `${MICROSOFT_AUTH_BASE_URL}/${this.getTenantId()}/oauth2/v2.0/token`;
  }

  assertConfigured() {
    if (!config.microsoftOAuth.clientId || !config.microsoftOAuth.clientSecret) {
      throw new Error('Microsoft OAuth is not configured. Set MICROSOFT_OAUTH_CLIENT_ID and MICROSOFT_OAUTH_CLIENT_SECRET.');
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
      throw new Error('Missing or invalid Microsoft OAuth state.');
    }

    const [encodedPayload, signature] = state.split('.');
    const expected = this.sign(encodedPayload);
    const signatureBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expected);

    if (
      signatureBuffer.length !== expectedBuffer.length ||
      !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)
    ) {
      throw new Error('Invalid Microsoft OAuth state signature.');
    }

    const payload = JSON.parse(base64UrlDecode(encodedPayload));
    if (!payload.exp || payload.exp < Date.now()) {
      throw new Error('Microsoft OAuth state expired. Please reconnect.');
    }
    if (!payload.hotelId || !payload.mailboxEmail) {
      throw new Error('Microsoft OAuth state is missing hotel context.');
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
      client_id: config.microsoftOAuth.clientId,
      redirect_uri: this.getRedirectUri(),
      response_type: 'code',
      response_mode: 'query',
      scope: MICROSOFT_MAIL_SCOPES.join(' '),
      prompt: 'select_account',
      state
    });

    if (mailboxEmail) {
      params.set('login_hint', mailboxEmail);
    }

    return `${MICROSOFT_AUTH_BASE_URL}/${this.getTenantId()}/oauth2/v2.0/authorize?${params.toString()}`;
  }

  async exchangeCodeForTokens(code) {
    this.assertConfigured();

    const response = await fetch(this.getTokenUrl(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: config.microsoftOAuth.clientId,
        client_secret: config.microsoftOAuth.clientSecret,
        redirect_uri: this.getRedirectUri(),
        grant_type: 'authorization_code'
      })
    });

    const payload = await response.json();
    if (!response.ok) {
      throw new Error(`Microsoft OAuth token exchange failed: ${payload.error_description || payload.error || response.statusText}`);
    }

    return this.withExpiry(payload);
  }

  async refreshAccessToken(tokenPayload) {
    this.assertConfigured();
    if (!tokenPayload.refresh_token) {
      throw new Error('Microsoft OAuth refresh token is missing. Reconnect the mailbox.');
    }

    const response = await fetch(this.getTokenUrl(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        refresh_token: tokenPayload.refresh_token,
        client_id: config.microsoftOAuth.clientId,
        client_secret: config.microsoftOAuth.clientSecret,
        grant_type: 'refresh_token'
      })
    });

    const payload = await response.json();
    if (!response.ok) {
      throw new Error(`Microsoft OAuth token refresh failed: ${payload.error_description || payload.error || response.statusText}`);
    }

    return {
      ...tokenPayload,
      ...this.withExpiry(payload),
      refresh_token: payload.refresh_token || tokenPayload.refresh_token
    };
  }

  async getValidTokenPayload(encryptedTokenPayload) {
    if (!encryptedTokenPayload) {
      throw new Error('Microsoft OAuth token payload is missing. Connect Microsoft 365 first.');
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

  async fetchUserProfile(accessToken) {
    const response = await fetch(`${MICROSOFT_GRAPH_BASE_URL}/me`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    const payload = await response.json();
    if (!response.ok) {
      throw new Error(`Microsoft Graph profile fetch failed: ${payload.error?.message || response.statusText}`);
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
  microsoftOAuthService: new MicrosoftOAuthService(),
  MICROSOFT_MAIL_SCOPES,
  MICROSOFT_GRAPH_BASE_URL
};
