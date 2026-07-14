const crypto = require('crypto');

const GOOGLE_CERTS_URL = 'https://www.googleapis.com/oauth2/v1/certs';
const GOOGLE_ISSUERS = new Set(['accounts.google.com', 'https://accounts.google.com']);

function base64UrlDecode(value) {
  const normalized = String(value || '').replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
  return Buffer.from(padded, 'base64');
}

function parseJsonPart(value) {
  return JSON.parse(base64UrlDecode(value).toString('utf8'));
}

class GoogleOidcVerifier {
  constructor() {
    this.cachedCerts = null;
    this.cachedCertsExpiresAt = 0;
  }

  async verifyAuthorizationHeader(authorizationHeader, { audience, serviceAccountEmail }) {
    if (!audience || !serviceAccountEmail) {
      return { verified: false, skipped: true, reason: 'OIDC verification is not configured.' };
    }

    const match = String(authorizationHeader || '').match(/^Bearer\s+(.+)$/i);
    if (!match) {
      throw new Error('Missing Pub/Sub OIDC bearer token.');
    }

    return this.verifyIdToken(match[1], { audience, serviceAccountEmail });
  }

  async verifyIdToken(token, { audience, serviceAccountEmail }) {
    const parts = String(token || '').split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid OIDC token format.');
    }

    const [encodedHeader, encodedPayload, encodedSignature] = parts;
    const header = parseJsonPart(encodedHeader);
    const payload = parseJsonPart(encodedPayload);

    if (!header.kid) {
      throw new Error('OIDC token is missing key id.');
    }
    if (!GOOGLE_ISSUERS.has(payload.iss)) {
      throw new Error('OIDC token issuer is not Google.');
    }
    if (payload.aud !== audience) {
      throw new Error('OIDC token audience does not match this webhook.');
    }
    if (String(payload.email || '').toLowerCase() !== String(serviceAccountEmail).toLowerCase()) {
      throw new Error('OIDC token service account is not authorized.');
    }

    const nowSeconds = Math.floor(Date.now() / 1000);
    if (!payload.exp || Number(payload.exp) <= nowSeconds) {
      throw new Error('OIDC token is expired.');
    }
    if (payload.iat && Number(payload.iat) > nowSeconds + 300) {
      throw new Error('OIDC token issue time is invalid.');
    }

    const certs = await this.getGoogleCerts();
    const cert = certs[header.kid];
    if (!cert) {
      throw new Error('OIDC token key id is unknown.');
    }

    const verifier = crypto.createVerify('RSA-SHA256');
    verifier.update(`${encodedHeader}.${encodedPayload}`);
    verifier.end();

    const signature = base64UrlDecode(encodedSignature);
    if (!verifier.verify(cert, signature)) {
      throw new Error('OIDC token signature is invalid.');
    }

    return {
      verified: true,
      skipped: false,
      email: payload.email,
      audience: payload.aud,
      subject: payload.sub
    };
  }

  async getGoogleCerts() {
    if (this.cachedCerts && this.cachedCertsExpiresAt > Date.now()) {
      return this.cachedCerts;
    }

    const response = await fetch(GOOGLE_CERTS_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch Google OIDC certificates: ${response.statusText}`);
    }

    const cacheControl = response.headers.get('cache-control') || '';
    const maxAgeMatch = cacheControl.match(/max-age=(\d+)/);
    const maxAgeSeconds = maxAgeMatch ? Number(maxAgeMatch[1]) : 3600;

    this.cachedCerts = await response.json();
    this.cachedCertsExpiresAt = Date.now() + (Math.max(maxAgeSeconds - 60, 60) * 1000);
    return this.cachedCerts;
  }
}

module.exports = new GoogleOidcVerifier();
