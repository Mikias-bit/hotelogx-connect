const express = require('express');
const config = require('../config/env');
const gmailPollingService = require('../services/email/GmailPollingService');
const gmailWatchService = require('../services/email/GmailWatchService');

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

router.post('/gmail-watch/register', async (req, res) => {
  try {
    const result = await gmailWatchService.registerWatchForHotel(req.body.hotelId || req.query.hotelId, {
      topicName: req.body.topicName || req.query.topicName || null
    });

    res.json({ success: true, provider: 'GOOGLE_WORKSPACE', result });
  } catch (error) {
    console.error('[Email Worker] Gmail watch registration failed:', error);
    res.status(500).json({ success: false, provider: 'GOOGLE_WORKSPACE', message: error.message });
  }
});

router.post('/gmail-watch/stop', async (req, res) => {
  try {
    const result = await gmailWatchService.stopWatchForHotel(req.body.hotelId || req.query.hotelId);
    res.json({ success: true, provider: 'GOOGLE_WORKSPACE', result });
  } catch (error) {
    console.error('[Email Worker] Gmail watch stop failed:', error);
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
  try {
    const result = await gmailWatchService.renewExpiringWatches({
      renewWithinHours: req.body.renewWithinHours || req.query.renewWithinHours || 24,
      topicName: req.body.topicName || req.query.topicName || null
    });

    res.json(result);
  } catch (error) {
    console.error('[Email Worker] Subscription renewal failed:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
