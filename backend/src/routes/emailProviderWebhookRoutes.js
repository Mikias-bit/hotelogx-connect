const express = require('express');
const config = require('../config/env');
const gmailPubSubService = require('../services/email/GmailPubSubService');
const googleOidcVerifier = require('../services/security/GoogleOidcVerifier');

const router = express.Router();

router.post('/google/pubsub', async (req, res) => {
  try {
    const oidcResult = await googleOidcVerifier.verifyAuthorizationHeader(req.get('authorization'), {
      audience: config.googlePubSub.expectedAudience,
      serviceAccountEmail: config.googlePubSub.pushServiceAccount
    });
    const result = await gmailPubSubService.processPushEnvelope(req.body);
    if (result.result?.failed > 0) {
      return res.status(500).json({
        success: false,
        provider: 'GOOGLE_WORKSPACE',
        oidc: oidcResult,
        result,
        message: 'Gmail Pub/Sub notification was received, but one or more messages failed to process.'
      });
    }

    res.status(200).json({
      success: true,
      provider: 'GOOGLE_WORKSPACE',
      oidc: oidcResult,
      result
    });
  } catch (error) {
    console.error('[Gmail Pub/Sub] Push processing failed:', error.message);
    res.status(400).json({
      success: false,
      provider: 'GOOGLE_WORKSPACE',
      message: error.message
    });
  }
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
