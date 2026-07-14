const prisma = require('../../../config/prisma');
const { googleOAuthService } = require('../GoogleOAuthService');

const GMAIL_API_BASE_URL = 'https://gmail.googleapis.com/gmail/v1/users/me';
const GMAIL_WATCH_URL = `${GMAIL_API_BASE_URL}/watch`;
const GMAIL_STOP_URL = `${GMAIL_API_BASE_URL}/stop`;

function base64UrlEncode(value) {
  return Buffer.from(value)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function base64UrlDecode(value) {
  if (!value) return '';
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
  return Buffer.from(padded, 'base64').toString('utf8');
}

function getHeader(headers = [], name) {
  const header = headers.find((item) => item.name?.toLowerCase() === name.toLowerCase());
  return header?.value || null;
}

function collectBodyParts(part, bodies) {
  if (!part) return;

  if (part.mimeType === 'text/plain' && part.body?.data) {
    bodies.text.push(base64UrlDecode(part.body.data));
  }
  if (part.mimeType === 'text/html' && part.body?.data) {
    bodies.html.push(base64UrlDecode(part.body.data));
  }

  if (Array.isArray(part.parts)) {
    part.parts.forEach((childPart) => collectBodyParts(childPart, bodies));
  }
}

class GoogleWorkspaceEmailAdapter {
  constructor(integration, hotel) {
    this.integration = integration;
    this.hotel = hotel;
  }

  async validateConnection() {
    const { tokenPayload, rotated } = await googleOAuthService.getValidTokenPayload(this.integration.secretRef);
    const profile = await googleOAuthService.fetchGmailProfile(tokenPayload.access_token);

    if (rotated && prisma.emailIntegration) {
      await prisma.emailIntegration.update({
        where: { hotelId: Number(this.integration.hotelId) },
        data: { secretRef: googleOAuthService.encryptTokenPayload(tokenPayload) }
      });
    }

    return {
      success: true,
      provider: 'GOOGLE_WORKSPACE',
      mailboxEmail: profile.emailAddress,
      historyId: profile.historyId
    };
  }

  async sendEmail({ to, subject, html, text = null, references = null, inReplyTo = null }) {
    const accessToken = await this.getAccessToken();
    const messageId = `<hotelogx-${Date.now()}-${Math.random().toString(16).slice(2)}@hotelogx-connect.local>`;
    const body = html || `<p>${String(text || '').replace(/\n/g, '<br>')}</p>`;
    const headers = [
      `From: ${this.integration.mailboxEmail}`,
      `To: ${to}`,
      `Subject: ${subject || 'Hotel inquiry'}`,
      `Message-ID: ${messageId}`,
      'MIME-Version: 1.0',
      'Content-Type: text/html; charset=UTF-8'
    ];

    if (inReplyTo) headers.push(`In-Reply-To: ${inReplyTo}`);
    if (references) headers.push(`References: ${references}`);

    const response = await fetch(`${GMAIL_API_BASE_URL}/messages/send`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        raw: base64UrlEncode(`${headers.join('\r\n')}\r\n\r\n${body}`)
      })
    });

    const payload = await response.json();
    if (!response.ok) {
      throw new Error(`Gmail send failed: ${payload.error?.message || response.statusText}`);
    }

    return {
      provider: 'GOOGLE_WORKSPACE',
      providerMessageId: payload.id,
      messageId,
      internetMessageId: messageId,
      threadId: payload.threadId,
      fromEmail: this.integration.mailboxEmail
    };
  }

  async fetchInboundChanges({ maxResults = 10 } = {}) {
    const accessToken = await this.getAccessToken();
    const { refs: messageRefs, historyId } = await this.listInboundMessageRefs(accessToken, Number(maxResults) || 10);
    const messages = [];

    for (const ref of messageRefs) {
      const message = await this.fetchMessage(accessToken, ref.id);
      if (message) messages.push(message);
    }

    return {
      provider: 'GOOGLE_WORKSPACE',
      mailboxEmail: this.integration.mailboxEmail,
      messages,
      newHistoryId: this.pickLatestHistoryId(messages) || historyId || this.integration.lastHistoryId || null
    };
  }

  async renewSubscription({ topicName }) {
    if (!topicName) {
      throw new Error('Google Pub/Sub topic name is required for Gmail watch registration.');
    }

    const accessToken = await this.getAccessToken();
    const response = await fetch(GMAIL_WATCH_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        topicName,
        labelIds: ['INBOX'],
        labelFilterBehavior: 'INCLUDE'
      })
    });

    const payload = await response.json();
    if (!response.ok) {
      throw new Error(`Gmail watch registration failed: ${payload.error?.message || response.statusText}`);
    }

    const expirationMs = Number(payload.expiration || 0);
    const watchExpiresAt = expirationMs ? new Date(expirationMs) : null;

    if (prisma.emailIntegration) {
      await prisma.emailIntegration.update({
        where: { hotelId: Number(this.integration.hotelId) },
        data: {
          lastHistoryId: payload.historyId ? String(payload.historyId) : this.integration.lastHistoryId,
          watchExpiresAt,
          lastSyncedAt: new Date()
        }
      });
    }

    return {
      provider: 'GOOGLE_WORKSPACE',
      mailboxEmail: this.integration.mailboxEmail,
      topicName,
      historyId: payload.historyId ? String(payload.historyId) : null,
      watchExpiresAt
    };
  }

  async stopSubscription() {
    const accessToken = await this.getAccessToken();
    const response = await fetch(GMAIL_STOP_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (!response.ok) {
      let message = response.statusText;
      try {
        const payload = await response.json();
        message = payload.error?.message || message;
      } catch (error) {
        // Gmail stop may return an empty body. Keep status text when JSON parsing fails.
      }
      throw new Error(`Gmail watch stop failed: ${message}`);
    }

    if (prisma.emailIntegration) {
      await prisma.emailIntegration.update({
        where: { hotelId: Number(this.integration.hotelId) },
        data: { watchExpiresAt: null }
      });
    }

    return {
      provider: 'GOOGLE_WORKSPACE',
      mailboxEmail: this.integration.mailboxEmail,
      stopped: true
    };
  }

  async getAccessToken() {
    const { tokenPayload, rotated } = await googleOAuthService.getValidTokenPayload(this.integration.secretRef);

    if (rotated && prisma.emailIntegration) {
      await prisma.emailIntegration.update({
        where: { hotelId: Number(this.integration.hotelId) },
        data: { secretRef: googleOAuthService.encryptTokenPayload(tokenPayload) }
      });
    }

    return tokenPayload.access_token;
  }

  async listInboundMessageRefs(accessToken, maxResults) {
    if (this.integration.lastHistoryId) {
      const url = new URL(`${GMAIL_API_BASE_URL}/history`);
      url.searchParams.set('startHistoryId', this.integration.lastHistoryId);
      url.searchParams.set('historyTypes', 'messageAdded');

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const payload = await response.json();

      if (!response.ok) {
        if (response.status !== 404) {
          throw new Error(`Gmail history fetch failed: ${payload.error?.message || response.statusText}`);
        }
        return { refs: await this.listRecentInboxRefs(accessToken, maxResults), historyId: null };
      }

      const refs = [];
      const seen = new Set();
      for (const historyItem of payload.history || []) {
        for (const added of historyItem.messagesAdded || []) {
          const id = added.message?.id;
          if (id && !seen.has(id)) {
            refs.push({ id });
            seen.add(id);
          }
        }
      }
      return { refs: refs.slice(0, maxResults), historyId: payload.historyId || null };
    }

    return { refs: await this.listRecentInboxRefs(accessToken, maxResults), historyId: null };
  }

  async listRecentInboxRefs(accessToken, maxResults) {
    const query = `in:inbox newer_than:7d -from:${this.integration.mailboxEmail}`;
    const url = new URL(`${GMAIL_API_BASE_URL}/messages`);
    url.searchParams.set('maxResults', String(maxResults));
    url.searchParams.set('q', query);

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const payload = await response.json();

    if (!response.ok) {
      throw new Error(`Gmail message list failed: ${payload.error?.message || response.statusText}`);
    }

    return payload.messages || [];
  }

  async fetchMessage(accessToken, messageId) {
    const url = new URL(`${GMAIL_API_BASE_URL}/messages/${messageId}`);
    url.searchParams.set('format', 'full');

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const payload = await response.json();

    if (!response.ok) {
      throw new Error(`Gmail message fetch failed: ${payload.error?.message || response.statusText}`);
    }

    const labelIds = payload.labelIds || [];
    if (!labelIds.includes('INBOX') || labelIds.includes('SENT') || labelIds.includes('DRAFT')) {
      return null;
    }

    const headers = payload.payload?.headers || [];
    const bodies = { text: [], html: [] };
    collectBodyParts(payload.payload, bodies);

    return {
      providerMessageId: payload.id,
      id: payload.id,
      messageId: getHeader(headers, 'Message-ID') || payload.id,
      threadId: payload.threadId,
      fromEmail: getHeader(headers, 'From'),
      toEmail: getHeader(headers, 'To') || this.integration.mailboxEmail,
      subject: getHeader(headers, 'Subject') || '',
      text: bodies.text.join('\n').trim(),
      html: bodies.html.join('\n').trim() || null,
      references: getHeader(headers, 'References'),
      inReplyTo: getHeader(headers, 'In-Reply-To'),
      receivedAt: payload.internalDate ? new Date(Number(payload.internalDate)).toISOString() : new Date().toISOString(),
      historyId: payload.historyId
    };
  }

  pickLatestHistoryId(messages) {
    return messages
      .map((message) => BigInt(message.historyId || 0))
      .filter((historyId) => historyId > 0n)
      .sort((a, b) => (a > b ? -1 : 1))[0]
      ?.toString();
  }
}

module.exports = GoogleWorkspaceEmailAdapter;
