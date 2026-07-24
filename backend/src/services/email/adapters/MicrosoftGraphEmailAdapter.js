const prisma = require('../../../config/prisma');
const { microsoftOAuthService, MICROSOFT_GRAPH_BASE_URL } = require('../MicrosoftOAuthService');

function stripHtml(html) {
  return String(html || '')
    .replace(/<style([\s\S]*?)<\/style>/gi, '')
    .replace(/<script([\s\S]*?)<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function getHeader(headers = [], name) {
  const header = headers.find((item) => item.name?.toLowerCase() === name.toLowerCase());
  return header?.value || null;
}

class MicrosoftGraphEmailAdapter {
  constructor(integration, hotel) {
    this.integration = integration;
    this.hotel = hotel;
  }

  async validateConnection() {
    const accessToken = await this.getAccessToken();
    const profile = await microsoftOAuthService.fetchUserProfile(accessToken);

    return {
      success: true,
      provider: 'MICROSOFT_365',
      mailboxEmail: profile.mail || profile.userPrincipalName,
      userId: profile.id
    };
  }

  async sendEmail({ to, subject, html, text = null }) {
    const accessToken = await this.getAccessToken();
    const bodyContent = html || `<p>${String(text || '').replace(/\n/g, '<br>')}</p>`;

    const response = await fetch(`${MICROSOFT_GRAPH_BASE_URL}/me/sendMail`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: {
          subject: subject || 'Hotel inquiry',
          body: {
            contentType: 'HTML',
            content: bodyContent
          },
          toRecipients: [
            {
              emailAddress: {
                address: to
              }
            }
          ]
        },
        saveToSentItems: true
      })
    });

    if (!response.ok) {
      let message = response.statusText;
      try {
        const payload = await response.json();
        message = payload.error?.message || message;
      } catch (error) {
        // Microsoft sendMail can return an empty body. Keep status text when JSON parsing fails.
      }
      throw new Error(`Microsoft Graph send failed: ${message}`);
    }

    return {
      provider: 'MICROSOFT_365',
      providerMessageId: null,
      internetMessageId: null,
      messageId: null,
      fromEmail: this.integration.mailboxEmail
    };
  }

  async fetchInboundChanges({ maxResults = 10 } = {}) {
    const accessToken = await this.getAccessToken();
    const messages = [];
    let nextUrl = this.integration.lastDeltaLink || this.buildInitialDeltaUrl(maxResults);
    let newDeltaLink = null;

    while (nextUrl && messages.length < Number(maxResults || 10)) {
      const response = await fetch(nextUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Prefer: 'outlook.body-content-type="text"'
        }
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(`Microsoft Graph delta fetch failed: ${payload.error?.message || response.statusText}`);
      }

      for (const item of payload.value || []) {
        if (item['@removed']) continue;
        messages.push(this.normalizeMessage(item));
        if (messages.length >= Number(maxResults || 10)) break;
      }

      nextUrl = payload['@odata.nextLink'] || null;
      newDeltaLink = payload['@odata.deltaLink'] || newDeltaLink;
    }

    return {
      provider: 'MICROSOFT_365',
      mailboxEmail: this.integration.mailboxEmail,
      messages,
      newDeltaLink: newDeltaLink || this.integration.lastDeltaLink || null
    };
  }

  async getAccessToken() {
    const { tokenPayload, rotated } = await microsoftOAuthService.getValidTokenPayload(this.integration.secretRef);

    if (rotated && prisma.emailIntegration) {
      await prisma.emailIntegration.update({
        where: { hotelId: Number(this.integration.hotelId) },
        data: { secretRef: microsoftOAuthService.encryptTokenPayload(tokenPayload) }
      });
    }

    return tokenPayload.access_token;
  }

  buildInitialDeltaUrl(maxResults) {
    const url = new URL(`${MICROSOFT_GRAPH_BASE_URL}/me/mailFolders/inbox/messages/delta`);
    url.searchParams.set('$top', String(Number(maxResults) || 10));
    url.searchParams.set('$select', [
      'id',
      'subject',
      'from',
      'toRecipients',
      'body',
      'bodyPreview',
      'receivedDateTime',
      'internetMessageId',
      'conversationId',
      'internetMessageHeaders'
    ].join(','));
    return url.toString();
  }

  normalizeMessage(item) {
    const htmlOrText = item.body?.content || item.bodyPreview || '';
    const text = item.body?.contentType === 'html' ? stripHtml(htmlOrText) : htmlOrText;
    const toEmail = (item.toRecipients || [])
      .map((recipient) => recipient.emailAddress?.address)
      .filter(Boolean)
      .join(', ');

    return {
      providerMessageId: item.id,
      id: item.id,
      messageId: item.internetMessageId || item.id,
      internetMessageId: item.internetMessageId || item.id,
      threadId: item.conversationId || null,
      fromEmail: item.from?.emailAddress?.address || '',
      toEmail: toEmail || this.integration.mailboxEmail,
      subject: item.subject || '',
      text,
      html: item.body?.contentType === 'html' ? item.body.content : null,
      references: getHeader(item.internetMessageHeaders, 'References'),
      inReplyTo: getHeader(item.internetMessageHeaders, 'In-Reply-To'),
      receivedAt: item.receivedDateTime || new Date().toISOString()
    };
  }
}

module.exports = MicrosoftGraphEmailAdapter;
