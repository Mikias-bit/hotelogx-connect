const nodemailer = require('nodemailer');
const { decrypt } = require('../../../utils/cryptoUtils');

class ImapSmtpEmailAdapter {
  constructor(integration, hotel) {
    this.integration = integration;
    this.hotel = hotel;
  }

  async validateConnection() {
    const transporter = this.createTransporter();
    await transporter.verify();
    return { success: true };
  }

  async sendEmail({ to, subject, html, text = null, references = null, inReplyTo = null }) {
    const transporter = this.createTransporter();
    const fromEmail = this.getFromEmail();
    const mailOptions = {
      from: fromEmail,
      to,
      subject,
      html,
      text: text || undefined
    };

    if (references || inReplyTo) {
      mailOptions.headers = {
        References: references || inReplyTo,
        'In-Reply-To': inReplyTo || references
      };
    }

    const info = await transporter.sendMail(mailOptions);
    return {
      provider: 'IMAP_SMTP',
      providerMessageId: info.messageId || null,
      internetMessageId: info.messageId || null,
      messageId: info.messageId || null,
      fromEmail,
      accepted: info.accepted,
      rejected: info.rejected,
      response: info.response
    };
  }

  async fetchInboundChanges() {
    throw new Error('IMAP inbound polling is not implemented yet. Add an IMAP worker using Cloud Scheduler and Pub/Sub.');
  }

  createTransporter() {
    const smtpHost = this.integration.smtpHost || process.env.SMTP_HOST || 'smtp.ethereal.email';
    const smtpPort = Number(this.integration.smtpPort || process.env.SMTP_PORT || 587);
    const smtpUser = this.integration.smtpUser || process.env.SMTP_USER || 'demo_user';
    const smtpPass = this.getPassword(this.integration.smtpPass || process.env.SMTP_PASS || 'demo_pass');

    return nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: this.integration.smtpSecure === true || smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    });
  }

  getFromEmail() {
    const mailbox = this.integration.mailboxEmail || this.integration.smtpUser || process.env.HOTEL_EMAIL_FROM || 'guestservices@autopilot.ai';
    const displayName = this.hotel?.hotelName || 'Hotel Guest Services';

    if (String(mailbox).includes('<')) {
      return mailbox;
    }
    return `"${displayName}" <${mailbox}>`;
  }

  getPassword(value) {
    if (!value) return value;
    if (value === '[SECURELY_STORED_IN_SECRET_MANAGER]') {
      throw new Error('SMTP password is stored in Secret Manager, but Secret Manager retrieval is not implemented in this adapter yet.');
    }
    return decrypt(value);
  }
}

module.exports = ImapSmtpEmailAdapter;
