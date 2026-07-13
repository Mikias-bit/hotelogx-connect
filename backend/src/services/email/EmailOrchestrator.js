const crypto = require('crypto');
const prisma = require('../../config/prisma');
const { EmailAdapterFactory, normalizeProvider } = require('./EmailAdapterFactory');

class EmailOrchestrator {
  constructor() {
    this.adapterFactory = new EmailAdapterFactory();
  }

  async sendGuestReply({
    hotelId,
    conversationId = null,
    to,
    subject,
    html,
    text = null,
    references = null,
    inReplyTo = null
  }) {
    if (!hotelId) throw new Error('hotelId is required for email sending');
    if (!to) throw new Error('Recipient email is required');

    let provider = 'UNKNOWN';
    try {
      const { integration } = await this.adapterFactory.getIntegrationContext(hotelId);
      provider = normalizeProvider(integration.provider);
      const adapter = await this.adapterFactory.getAdapter(hotelId);
      const result = await adapter.sendEmail({
        to,
        subject,
        html,
        text,
        references,
        inReplyTo
      });

      await this.logMessage({
        hotelId,
        conversationId,
        direction: 'OUTBOUND',
        provider,
        providerMessageId: result.providerMessageId || result.messageId || null,
        internetMessageId: result.internetMessageId || result.messageId || null,
        threadId: result.threadId || null,
        fromEmail: result.fromEmail || '',
        toEmail: to,
        subject,
        status: 'SENT'
      });

      return result;
    } catch (error) {
      await this.logMessage({
        hotelId,
        conversationId,
        direction: 'OUTBOUND',
        provider,
        fromEmail: '',
        toEmail: to,
        subject,
        status: 'FAILED',
        errorMessage: error.message
      });
      throw error;
    }
  }

  normalizeInbound(rawMessage, provider) {
    const fromEmail = this.extractEmailAddress(rawMessage.fromEmail || rawMessage.from || '');
    const toEmail = this.extractEmailAddress(rawMessage.toEmail || rawMessage.to || '');
    const text = rawMessage.text || rawMessage.plain || '';
    const html = rawMessage.html || null;

    return {
      provider: normalizeProvider(provider),
      providerMessageId: rawMessage.providerMessageId || rawMessage.id || rawMessage.messageId || null,
      internetMessageId: rawMessage.internetMessageId || rawMessage.messageId || null,
      threadId: rawMessage.threadId || rawMessage.conversationId || null,
      fromEmail,
      toEmail,
      subject: rawMessage.subject || '',
      text,
      html,
      receivedAt: rawMessage.receivedAt || new Date().toISOString(),
      references: rawMessage.references || null,
      inReplyTo: rawMessage.inReplyTo || null,
      rawHash: this.hashRawMessage(rawMessage)
    };
  }

  async logInbound(hotelId, normalizedMessage, conversationId = null, status = 'RECEIVED', errorMessage = null) {
    return this.logMessage({
      hotelId,
      conversationId,
      direction: 'INBOUND',
      provider: normalizedMessage.provider,
      providerMessageId: normalizedMessage.providerMessageId,
      internetMessageId: normalizedMessage.internetMessageId,
      threadId: normalizedMessage.threadId,
      fromEmail: normalizedMessage.fromEmail || '',
      toEmail: normalizedMessage.toEmail || '',
      subject: normalizedMessage.subject,
      status,
      errorMessage,
      rawHash: normalizedMessage.rawHash
    });
  }

  async logMessage(data) {
    if (!prisma.emailMessageLog) {
      return null;
    }

    try {
      return await prisma.emailMessageLog.create({
        data: {
          hotelId: Number(data.hotelId),
          conversationId: data.conversationId ? Number(data.conversationId) : null,
          direction: data.direction,
          provider: data.provider,
          providerMessageId: data.providerMessageId || null,
          internetMessageId: data.internetMessageId || null,
          threadId: data.threadId || null,
          fromEmail: data.fromEmail || '',
          toEmail: data.toEmail || '',
          subject: data.subject || null,
          status: data.status,
          errorMessage: data.errorMessage || null,
          rawHash: data.rawHash || null
        }
      });
    } catch (error) {
      console.error('[EmailOrchestrator] Failed to write email message log:', error.message);
      return null;
    }
  }

  extractEmailAddress(value) {
    const input = String(value || '').trim();
    const match = input.match(/<([^>]+)>/);
    return (match ? match[1] : input).trim().toLowerCase();
  }

  hashRawMessage(rawMessage) {
    return crypto
      .createHash('sha256')
      .update(JSON.stringify(rawMessage || {}))
      .digest('hex');
  }
}

module.exports = new EmailOrchestrator();
