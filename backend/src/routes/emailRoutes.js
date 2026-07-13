const express = require('express');
const emailInboundProcessor = require('../services/email/EmailInboundProcessor');

const router = express.Router();

router.post('/:hotelId', async (req, res) => {
  try {
    const result = await emailInboundProcessor.processInboundEmail({
      hotelId: req.params.hotelId,
      rawMessage: {
        from: req.body.from || req.body.envelope?.from || req.body.headers?.from,
        to: req.body.to || req.body.envelope?.to || req.body.headers?.to,
        subject: req.body.subject || req.body.headers?.subject,
        messageId: req.body.messageId || req.body.headers?.message_id,
        inReplyTo: req.body.inReplyTo || req.body.headers?.in_reply_to,
        references: req.body.references || req.body.headers?.references,
        text: req.body.text || req.body.plain,
        html: req.body.html,
        receivedAt: req.body.timestamp
      },
      provider: req.body.provider,
      awaitAutomation: false
    });

    res.status(200).json({
      success: true,
      message: result.duplicate ? 'Duplicate email ignored.' : 'Email received and queued for processing.',
      result
    });
  } catch (error) {
    console.error('Error processing inbound email webhook:', error);
    const status = error.message.includes('required') ? 400 : 500;
    res.status(status).json({ success: false, message: error.message });
  }
});

module.exports = router;
