const express = require('express');
const config = require('../config/env');
const gmailPollingService = require('../services/email/GmailPollingService');

const router = express.Router();

function requireWorkerSecret(req, res, next) {
  if (!config.emailWorkerSecret) return next();

  const providedSecret = req.get('x-worker-secret') || req.query.workerSecret;
  if (providedSecret !== config.emailWorkerSecret) {
    return res.status(401).json({ success: false, message: 'Invalid worker secret.' });
  }

  return next();
}

router.use(requireWorkerSecret);

router.post('/gmail-poll', async (req, res) => {
  try {
    const result = await gmailPollingService.pollConnectedMailboxes({
      hotelId: req.body.hotelId || req.query.hotelId || null,
      maxResults: req.body.maxResults || req.query.maxResults || 10,
      awaitAutomation: req.body.awaitAutomation !== false
    });

    res.json(result);
  } catch (error) {
    console.error('[Email Worker] Gmail poll failed:', error);
    res.status(500).json({ success: false, provider: 'GOOGLE_WORKSPACE', message: error.message });
  }
});

router.post('/imap-poll', async (req, res) => {
  res.status(501).json({
    success: false,
    provider: 'IMAP_SMTP',
    message: 'IMAP polling worker endpoint is reserved. Add an IMAP client worker triggered by Cloud Scheduler and Pub/Sub.'
  });
});

router.post('/subscription-renewal', async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Email subscription renewal worker is reserved for Gmail watch and Microsoft Graph subscription renewal.'
  });
});

module.exports = router;
