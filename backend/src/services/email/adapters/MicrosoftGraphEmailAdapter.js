class MicrosoftGraphEmailAdapter {
  constructor(integration, hotel) {
    this.integration = integration;
    this.hotel = hotel;
  }

  async validateConnection() {
    throw new Error('Microsoft Graph email connection is not implemented yet.');
  }

  async sendEmail() {
    throw new Error('Microsoft Graph email sending is not implemented yet.');
  }

  async fetchInboundChanges() {
    throw new Error('Microsoft Graph email inbound sync is not implemented yet.');
  }

  async renewSubscription() {
    throw new Error('Microsoft Graph subscription renewal is not implemented yet.');
  }
}

module.exports = MicrosoftGraphEmailAdapter;
