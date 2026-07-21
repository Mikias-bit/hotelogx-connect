const prisma = require('../../config/prisma');
const { EmailAdapterFactory, PROVIDERS } = require('./EmailAdapterFactory');
const emailInboundProcessor = require('./EmailInboundProcessor');

class ImapPollingService {
  constructor() {
    this.adapterFactory = new EmailAdapterFactory();
  }

  async pollConnectedMailboxes({ hotelId = null, maxResults = 10, awaitAutomation = true } = {}) {
    if (!prisma.emailIntegration) {
      throw new Error('EmailIntegration model is not available. Run Prisma generate and migrate the database.');
    }

    const integrations = await prisma.emailIntegration.findMany({
      where: {
        provider: PROVIDERS.IMAP_SMTP,
        status: { in: ['Connected', 'Configured'] },
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
      provider: PROVIDERS.IMAP_SMTP,
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
            provider: PROVIDERS.IMAP_SMTP,
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

      if (result.failed === 0) {
        await prisma.emailIntegration.update({
          where: { hotelId: integration.hotelId },
          data: {
            lastUid: changes.newLastUid ? Number(changes.newLastUid) : integration.lastUid,
            uidValidity: changes.uidValidity || integration.uidValidity,
            lastSyncedAt: new Date(),
            status: 'Connected'
          }
        });

        result.lastUid = changes.newLastUid || integration.lastUid || null;
        result.uidValidity = changes.uidValidity || integration.uidValidity || null;
      } else {
        result.pendingLastUid = changes.newLastUid || null;
        result.errors.push({
          message: 'IMAP UID cursor was not advanced because one or more messages failed to process.'
        });
      }
    } catch (error) {
      result.failed += 1;
      result.errors.push({ message: error.message });
    }

    return result;
  }
}

module.exports = new ImapPollingService();
