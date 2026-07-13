const crypto = require('crypto');
const prisma = require('../../config/prisma');
const automationEngine = require('../AutomationEngine');
const conversationService = require('../conversationService');
const emailOrchestrator = require('./EmailOrchestrator');

function stripQuotedReply(text) {
  if (!text) return '';
  const lines = text.split(/\r?\n/);
  const cleanedLines = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (
      line.match(/^[>\s]*On\s+.*\s+wrote:/i) ||
      line.match(/^[>\s]*From:\s+.*/i) ||
      line.match(/^[>\s]*-----Original Message-----/i) ||
      line.match(/^[>\s]*--- Original Message ---/i) ||
      line.match(/^[>\s]*________________________________/) ||
      trimmed.startsWith('>')
    ) {
      break;
    }
    cleanedLines.push(line);
  }

  return cleanedLines.join('\n').trim();
}

function stripSignatures(text) {
  if (!text) return '';
  const lines = text.split(/\r?\n/);
  const cleanedLines = [];

  for (const line of lines) {
    const trimmed = line.trim().toLowerCase();
    if (
      trimmed === '--' ||
      trimmed === '---' ||
      trimmed === 'thanks,' ||
      trimmed === 'thanks and regards,' ||
      trimmed === 'best regards,' ||
      trimmed === 'kind regards,' ||
      trimmed === 'sent from my iphone' ||
      trimmed === 'sent from my mail'
    ) {
      break;
    }
    cleanedLines.push(line);
  }

  return cleanedLines.join('\n').trim();
}

function parseForwardedEmail(text) {
  if (!text) return { content: '', isForward: false, lowConfidence: false };

  const hasForwardMarker = text.match(/Forwarded message/i) || text.match(/Begin forwarded message/i);
  if (!hasForwardMarker) {
    return { content: text, isForward: false, lowConfidence: false };
  }

  const lines = text.split(/\r?\n/);
  const topLines = [];

  for (const line of lines) {
    if (line.match(/Forwarded message/i) || line.match(/Begin forwarded message/i)) {
      break;
    }
    topLines.push(line);
  }

  const topContent = topLines.join('\n').trim();
  if (topContent.length > 10) {
    return { content: topContent, isForward: true, lowConfidence: false };
  }

  return { content: text, isForward: true, lowConfidence: true };
}

function extractEmailAddress(value) {
  return emailOrchestrator.extractEmailAddress(value);
}

function htmlToText(html) {
  return String(html || '')
    .replace(/<style([\s\S]*?)<\/style>/gi, '')
    .replace(/<script([\s\S]*?)<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function buildDedupeKey(message) {
  if (message.providerMessageId) return message.providerMessageId;
  if (message.messageId) return message.messageId;

  const hashPayload = [
    message.fromEmail || message.from || '',
    message.subject || '',
    message.receivedAt || message.timestamp || Date.now().toString()
  ].join('_');
  return crypto.createHash('sha256').update(hashPayload).digest('hex');
}

class EmailInboundProcessor {
  async processInboundEmail({ hotelId, rawMessage, provider = 'IMAP_SMTP', awaitAutomation = true }) {
    const numericHotelId = Number(hotelId);
    if (!numericHotelId) {
      throw new Error('hotelId is required for inbound email processing.');
    }

    const hotel = await prisma.hotel.findUnique({ where: { id: numericHotelId } });
    if (!hotel) {
      throw new Error(`Hotel ${hotelId} not found.`);
    }

    const fromEmail = extractEmailAddress(rawMessage.fromEmail || rawMessage.from || rawMessage.sender || '');
    const toEmail = extractEmailAddress(rawMessage.toEmail || rawMessage.to || hotel.hotelEmail || hotel.smtpUser || '');
    const subject = rawMessage.subject || '';
    const messageId = rawMessage.messageId || rawMessage.internetMessageId || null;
    const providerMessageId = buildDedupeKey(rawMessage);
    const targetRef = rawMessage.inReplyTo || rawMessage.references || null;
    const rawHtml = rawMessage.html || null;
    const emailContent = rawMessage.text || rawMessage.plain || htmlToText(rawHtml);

    if (!fromEmail || !emailContent) {
      throw new Error('From and email content (text or html) are required.');
    }

    const duplicate = await prisma.emailMessageLog.findFirst({
      where: {
        hotelId: numericHotelId,
        direction: 'INBOUND',
        OR: [
          { providerMessageId },
          ...(messageId ? [{ internetMessageId: messageId }] : [])
        ]
      },
      select: { id: true, status: true }
    });

    if (duplicate) {
      return {
        success: true,
        duplicate: true,
        message: 'Duplicate email ignored.',
        logId: duplicate.id,
        status: duplicate.status
      };
    }

    const matchedConversation = await this.findConversationForEmail(fromEmail, targetRef);
    const baseCleaned = stripQuotedReply(emailContent);
    const fullyCleaned = stripSignatures(baseCleaned);
    const forwardInfo = parseForwardedEmail(fullyCleaned);
    const normalizedInbound = emailOrchestrator.normalizeInbound({
      providerMessageId,
      messageId,
      fromEmail,
      toEmail,
      subject,
      text: forwardInfo.content,
      html: rawHtml,
      references: rawMessage.references || null,
      inReplyTo: targetRef,
      receivedAt: rawMessage.receivedAt
    }, provider || hotel.emailIntegrationType || 'IMAP_SMTP');

    if (forwardInfo.lowConfidence) {
      let guest = await prisma.guest.findFirst({ where: { email: fromEmail } });
      if (!guest) {
        guest = await prisma.guest.create({
          data: { name: 'Unknown Guest', phone: 'No Phone', email: fromEmail, status: 'Unidentified' }
        });
      }

      const conversation = await conversationService.findOrCreateConversation(guest.id);
      await conversationService.addMessage(conversation.id, 'guest', emailContent, 'Email', null, null, messageId, targetRef);
      await conversationService.updateStatus(conversation.id, 'escalated', 0.1);
      await conversationService.logActivity(conversation.id, 'Escalation', 'Low confidence forwarded email parsed.');
      await emailOrchestrator.logInbound(hotel.id, normalizedInbound, conversation.id, 'ESCALATED');

      return { success: true, duplicate: false, status: 'ESCALATED', conversationId: conversation.id };
    }

    const log = await emailOrchestrator.logInbound(hotel.id, normalizedInbound, matchedConversation?.id || null, 'RECEIVED');
    const automationPromise = automationEngine.handleIncomingMessage(
      hotel.id,
      fromEmail,
      forwardInfo.content,
      'Email',
      messageId,
      targetRef
    );

    if (awaitAutomation) {
      await automationPromise;
    } else {
      automationPromise.catch((error) => {
        console.error('[EmailInboundProcessor] Automation failed:', error.message);
      });
    }

    return {
      success: true,
      duplicate: false,
      status: 'RECEIVED',
      logId: log?.id || null,
      conversationId: matchedConversation?.id || null
    };
  }

  async findConversationForEmail(fromEmail, targetRef) {
    if (targetRef) {
      const matchMsg = await prisma.message.findFirst({
        where: {
          OR: [
            { emailMessageId: targetRef },
            { emailInReplyTo: targetRef }
          ]
        },
        select: { conversationId: true }
      });

      if (matchMsg) {
        return prisma.conversation.findUnique({ where: { id: matchMsg.conversationId } });
      }
    }

    const guest = await prisma.guest.findFirst({ where: { email: fromEmail } });
    if (!guest) return null;

    return prisma.conversation.findFirst({
      where: {
        guestId: guest.id,
        status: { in: ['active', 'escalated'] }
      },
      orderBy: { createdAt: 'desc' }
    });
  }
}

module.exports = new EmailInboundProcessor();
