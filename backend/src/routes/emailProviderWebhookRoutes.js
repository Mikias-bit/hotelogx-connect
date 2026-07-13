const express = require('express');

const router = express.Router();

router.post('/google/pubsub', async (req, res) => {
  res.status(501).json({
    success: false,
    provider: 'GOOGLE_WORKSPACE',
    message: 'Gmail Pub/Sub webhook endpoint is reserved. Gmail watch and History API sync are not implemented yet.'
  });
});

router.get('/microsoft/notifications', async (req, res) => {
  if (req.query.validationToken) {
    return res.status(200).type('text/plain').send(req.query.validationToken);
  }

  res.status(400).json({
    success: false,
    provider: 'MICROSOFT_365',
    message: 'Missing Microsoft Graph validationToken.'
  });
});

router.post('/microsoft/notifications', async (req, res) => {
  if (req.query.validationToken) {
    return res.status(200).type('text/plain').send(req.query.validationToken);
  }

  res.status(501).json({
    success: false,
    provider: 'MICROSOFT_365',
    message: 'Microsoft Graph notification endpoint is reserved. Subscription validation is supported, but delta sync is not implemented yet.'
  });
});

module.exports = router;
