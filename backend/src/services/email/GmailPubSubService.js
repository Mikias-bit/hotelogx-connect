const prisma = require('../../config/prisma');
const gmailPollingService = require('./GmailPollingService');
const { PROVIDERS } = require('./EmailAdapterFactory');

function decodeBase64Json(value) {
  const decoded = Buffer.from(value || '', 'base64').toString('utf8');
  return JSON.parse(decoded);
}

class GmailPubSubService {
  decodePushEnvelope(body) {
    if (!body || !body.message) {
      throw new Error('Invalid Pub/Sub push payload: missing message.');
    }

    if (!body.message.data) {
      throw new Error('Invalid Pub/Sub push payload: missing message.data.');
    }

    const notification = decodeBase64Json(body.message.data);
    if (!notification.emailAddress || !notification.historyId) {
      throw new Error('Invalid Gmail Pub/Sub notification: missing emailAddress or historyId.');
    }

    return {
      messageId: body.message.messageId || body.message.message_id || null,
      publishTime: body.message.publishTime || body.message.publish_time || null,
      subscription: body.subscription || null,
      emailAddress: String(notification.emailAddress).toLowerCase(),
      historyId: String(notification.historyId)
    };
  }

  async processPushEnvelope(body) {
    const notification = this.decodePushEnvelope(body);
    const integration = await prisma.emailIntegration.findFirst({
      where: {
        provider: PROVIDERS.GOOGLE_WORKSPACE,
        status: 'Connected',
        mailboxEmail: { equals: notification.emailAddress, mode: 'insensitive' }
      }
    });

    if (!integration) {
      return {
        success: true,
        ignored: true,
        reason: 'No connected Google Workspace integration found for mailbox.',
        emailAddress: notification.emailAddress,
        historyId: notification.historyId
      };
    }

    const result = await gmailPollingService.pollIntegration(integration, {
      maxResults: 25,
      awaitAutomation: true
    });

    return {
      success: true,
      ignored: false,
      notification,
      result
    };
  }
}

module.exports = new GmailPubSubService();
