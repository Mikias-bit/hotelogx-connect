const prisma = require('../../config/prisma');
const config = require('../../config/env');
const { EmailAdapterFactory, PROVIDERS } = require('./EmailAdapterFactory');

class GmailWatchService {
  constructor() {
    this.adapterFactory = new EmailAdapterFactory();
  }

  getTopicName(topicName = null) {
    const resolvedTopic = topicName || config.googlePubSub.topic;
    if (!resolvedTopic) {
      throw new Error('GOOGLE_PUBSUB_TOPIC is required to register Gmail watch.');
    }
    return resolvedTopic;
  }

  async registerWatchForHotel(hotelId, { topicName = null } = {}) {
    const numericHotelId = Number(hotelId);
    if (!numericHotelId) {
      throw new Error('hotelId is required to register Gmail watch.');
    }

    const adapter = await this.adapterFactory.getAdapter(numericHotelId);
    return adapter.renewSubscription({ topicName: this.getTopicName(topicName) });
  }

  async stopWatchForHotel(hotelId) {
    const numericHotelId = Number(hotelId);
    if (!numericHotelId) {
      throw new Error('hotelId is required to stop Gmail watch.');
    }

    const adapter = await this.adapterFactory.getAdapter(numericHotelId);
    return adapter.stopSubscription();
  }

  async renewExpiringWatches({ renewWithinHours = 24, topicName = null } = {}) {
    if (!prisma.emailIntegration) {
      throw new Error('EmailIntegration model is not available. Run Prisma generate and migrate the database.');
    }

    const renewBefore = new Date(Date.now() + (Number(renewWithinHours) || 24) * 60 * 60 * 1000);
    const integrations = await prisma.emailIntegration.findMany({
      where: {
        provider: PROVIDERS.GOOGLE_WORKSPACE,
        status: 'Connected',
        OR: [
          { watchExpiresAt: null },
          { watchExpiresAt: { lte: renewBefore } }
        ]
      },
      orderBy: { updatedAt: 'asc' }
    });

    const results = [];
    for (const integration of integrations) {
      try {
        const result = await this.registerWatchForHotel(integration.hotelId, { topicName });
        results.push({ hotelId: integration.hotelId, success: true, result });
      } catch (error) {
        results.push({ hotelId: integration.hotelId, success: false, message: error.message });
      }
    }

    return {
      success: true,
      provider: PROVIDERS.GOOGLE_WORKSPACE,
      checkedIntegrations: integrations.length,
      results
    };
  }
}

module.exports = new GmailWatchService();
