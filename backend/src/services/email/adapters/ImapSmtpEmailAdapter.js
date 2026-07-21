const nodemailer = require('nodemailer');
const { ImapFlow } = require('imapflow');
const { simpleParser } = require('mailparser');
const { decrypt } = require('../../../utils/cryptoUtils');

class ImapSmtpEmailAdapter {
  constructor(integration, hotel) {
    this.integration = integration;
    this.hotel = hotel;
  }

  async validateConnection() {
    const transporter = this.createTransporter();
    await transporter.verify();

    if (this.integration.imapHost || process.env.IMAP_HOST) {
      const client = this.createImapClient();
      await client.connect();
      await client.logout().catch(() => {});
    }

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

  async fetchInboundChanges({ maxResults = 10 } = {}) {
    const client = this.createImapClient();
    const messages = [];
    let newLastUid = this.integration.lastUid || null;
    let uidValidity = this.integration.uidValidity || null;

    await client.connect();

    const lock = await client.getMailboxLock('INBOX');
    try {
      uidValidity = client.mailbox?.uidValidity ? String(client.mailbox.uidValidity) : uidValidity;

      const previousUidValidity = this.integration.uidValidity ? String(this.integration.uidValidity) : null;
      const cursorStillValid = previousUidValidity && uidValidity && previousUidValidity === uidValidity;
      const lastUid = cursorStillValid ? Number(this.integration.lastUid || 0) : 0;
      const candidateUids = await this.listCandidateUids(client, lastUid, Number(maxResults) || 10);

      for (const uid of candidateUids) {
        const fetched = await this.fetchMessageByUid(client, uid);
        if (!fetched) continue;

        messages.push(fetched);
        newLastUid = Math.max(Number(newLastUid || 0), Number(uid));
      }
    } finally {
      lock.release();
      await client.logout().catch(() => {});
    }

    return {
      provider: 'IMAP_SMTP',
      mailboxEmail: this.integration.mailboxEmail,
      messages,
      newLastUid,
      uidValidity
    };
  }

  createImapClient() {
    const imapHost = this.integration.imapHost || process.env.IMAP_HOST;
    const imapPort = Number(this.integration.imapPort || process.env.IMAP_PORT || 993);
    const imapUser = this.integration.smtpUser || process.env.IMAP_USER || process.env.SMTP_USER;
    const imapPass = this.getPassword(this.integration.smtpPass || process.env.IMAP_PASS || process.env.SMTP_PASS);

    if (!imapHost || !imapUser || !imapPass) {
      throw new Error('IMAP host, user, and password are required for inbound polling.');
    }

    return new ImapFlow({
      host: imapHost,
      port: imapPort,
      secure: this.integration.imapSecure !== false,
      auth: {
        user: imapUser,
        pass: imapPass
      },
      logger: false
    });
  }

  async listCandidateUids(client, lastUid, maxResults) {
    let uids = [];

    if (lastUid > 0) {
      uids = await client.search({ uid: `${lastUid + 1}:*` }, { uid: true });
    } else {
      uids = await client.search({ seen: false }, { uid: true });
      if (!uids || !uids.length) {
        const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        uids = await client.search({ since }, { uid: true });
      }
    }

    return [...new Set((uids || []).map(Number).filter(Boolean))]
      .sort((a, b) => a - b)
      .slice(0, maxResults);
  }

  async fetchMessageByUid(client, uid) {
    let message = null;
    for await (const msg of client.fetch(String(uid), {
      uid: true,
      envelope: true,
      source: true,
      flags: true,
      internalDate: true
    }, { uid: true })) {
      message = msg;
      break;
    }

    if (!message || !message.source) return null;

    const flags = Array.from(message.flags || []).map(flag => String(flag).toLowerCase());
    if (flags.includes('\\deleted') || flags.includes('\\draft')) return null;

    const parsed = await simpleParser(message.source);
    const fromEmail = parsed.from?.text || parsed.from?.value?.[0]?.address || '';
    const toEmail = parsed.to?.text || parsed.to?.value?.map(item => item.address).join(', ') || this.integration.mailboxEmail;
    const messageId = parsed.messageId || `${uid}@${this.integration.mailboxEmail || this.integration.imapHost}`;

    return {
      providerMessageId: `imap:${this.integration.hotelId}:${uid}`,
      id: String(uid),
      uid,
      messageId,
      internetMessageId: messageId,
      threadId: parsed.references?.[0] || parsed.inReplyTo || messageId,
      fromEmail,
      toEmail,
      subject: parsed.subject || '',
      text: parsed.text || '',
      html: parsed.html || null,
      references: Array.isArray(parsed.references) ? parsed.references.join(' ') : parsed.references || null,
      inReplyTo: parsed.inReplyTo || null,
      receivedAt: (parsed.date || message.internalDate || new Date()).toISOString()
    };
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
