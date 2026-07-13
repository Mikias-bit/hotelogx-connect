const prisma = require('../../config/prisma');
const ImapSmtpEmailAdapter = require('./adapters/ImapSmtpEmailAdapter');
const GoogleWorkspaceEmailAdapter = require('./adapters/GoogleWorkspaceEmailAdapter');
const MicrosoftGraphEmailAdapter = require('./adapters/MicrosoftGraphEmailAdapter');

const PROVIDERS = {
  GOOGLE_WORKSPACE: 'GOOGLE_WORKSPACE',
  MICROSOFT_365: 'MICROSOFT_365',
  IMAP_SMTP: 'IMAP_SMTP'
};

function normalizeProvider(provider) {
  const value = String(provider || '').trim().toUpperCase();

  if (['GOOGLE', 'GOOGLE_WORKSPACE', 'GMAIL', 'GMAIL_API'].includes(value)) {
    return PROVIDERS.GOOGLE_WORKSPACE;
  }
  if (['MICROSOFT', 'MICROSOFT_365', 'OFFICE_365', 'OUTLOOK', 'GRAPH'].includes(value)) {
    return PROVIDERS.MICROSOFT_365;
  }
  return PROVIDERS.IMAP_SMTP;
}

class EmailAdapterFactory {
  async getAdapter(hotelId) {
    const { integration, hotel } = await this.getIntegrationContext(hotelId);
    const provider = normalizeProvider(integration.provider);

    if (provider === PROVIDERS.GOOGLE_WORKSPACE) {
      return new GoogleWorkspaceEmailAdapter(integration, hotel);
    }
    if (provider === PROVIDERS.MICROSOFT_365) {
      return new MicrosoftGraphEmailAdapter(integration, hotel);
    }
    return new ImapSmtpEmailAdapter(integration, hotel);
  }

  async getIntegrationContext(hotelId) {
    const numericHotelId = Number(hotelId);
    if (!numericHotelId) {
      throw new Error('hotelId is required to resolve email adapter');
    }

    const hotel = await prisma.hotel.findUnique({ where: { id: numericHotelId } });
    if (!hotel) {
      throw new Error(`Hotel ${hotelId} not found`);
    }

    if (prisma.emailIntegration) {
      const integration = await prisma.emailIntegration.findUnique({
        where: { hotelId: numericHotelId }
      });

      if (integration) {
        return { integration, hotel };
      }
    }

    return {
      hotel,
      integration: {
        hotelId: numericHotelId,
        provider: normalizeProvider(hotel.emailIntegrationType),
        mailboxEmail: hotel.hotelEmail || hotel.smtpUser,
        status: hotel.emailConnected ? 'Connected' : 'Disconnected',
        smtpHost: hotel.smtpHost,
        smtpPort: hotel.smtpPort,
        smtpSecure: Number(hotel.smtpPort) === 465,
        smtpUser: hotel.smtpUser,
        smtpPass: hotel.smtpPass
      }
    };
  }
}

module.exports = {
  EmailAdapterFactory,
  PROVIDERS,
  normalizeProvider
};
