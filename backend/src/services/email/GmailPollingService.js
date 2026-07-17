const prisma = require('../../config/prisma');
const { EmailAdapterFactory, PROVIDERS } = require('./EmailAdapterFactory');
const emailInboundProcessor = require('./EmailInboundProcessor');

class GmailPollingService {
  constructor() {
    this.adapterFactory = new EmailAdapterFactory();
  }

  async pollConnectedMailboxes({ hotelId = null, maxResults = 10, awaitAutomation = true } = {}) {
    if (!prisma.emailIntegration) {
      throw new Error('EmailIntegration model is not available. Run Prisma generate and migrate the database.');
    }

    const integrations = await prisma.emailIntegration.findMany({
      where: {
        provider: PROVIDERS.GOOGLE_WORKSPACE,
        status: 'Connected',
        ...(hotelId ? { hotelId: Number(hotelId) } : {})
      },
      orderBy: { updatedAt: 'asc' }
    });

    const results = [];
    for (const integration of integrations) {
      results.push(await this.pollIntegration(integration, { maxResults, awaitAutomation }));
    }

    return {
      success: true,
      provider: PROVIDERS.GOOGLE_WORKSPACE,
      checkedIntegrations: integrations.length,
      results
    };
  }

  async pollIntegration(integration, { maxResults, awaitAutomation }) {
    const result = {
      hotelId: integration.hotelId,
      mailboxEmail: integration.mailboxEmail,
      fetched: 0,
      processed: 0,
      duplicates: 0,
      failed: 0,
      errors: []
    };

    try {
      const adapter = await this.adapterFactory.getAdapter(integration.hotelId);
      const changes = await adapter.fetchInboundChanges({ maxResults });
      result.fetched = changes.messages.length;

      for (const message of changes.messages) {
        try {
          const processResult = await emailInboundProcessor.processInboundEmail({
            hotelId: integration.hotelId,
            rawMessage: message,
            provider: PROVIDERS.GOOGLE_WORKSPACE,
            awaitAutomation
          });

          if (processResult.duplicate) {
            result.duplicates += 1;
          } else {
            result.processed += 1;
          }
        } catch (error) {
          result.failed += 1;
          result.errors.push({
            providerMessageId: message.providerMessageId || message.id || null,
            message: error.message
          });
        }
      }

      if (changes.newHistoryId && result.failed === 0) {
        await prisma.emailIntegration.update({
          where: { hotelId: integration.hotelId },
          data: {
            lastHistoryId: changes.newHistoryId,
            lastSyncedAt: new Date()
          }
        });
        result.lastHistoryId = changes.newHistoryId;
      } else if (changes.newHistoryId && result.failed > 0) {
        result.pendingHistoryId = changes.newHistoryId;
        result.errors.push({
          message: 'Gmail history cursor was not advanced because one or more messages failed to process.'
        });
      } else {
        await prisma.emailIntegration.update({
          where: { hotelId: integration.hotelId },
          data: { lastSyncedAt: new Date() }
        });
      }
    } catch (error) {
      result.failed += 1;
      result.errors.push({ message: error.message });
    }

    return result;
  }
}

module.exports = new GmailPollingService();
