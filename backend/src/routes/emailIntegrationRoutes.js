const express = require('express');
const prisma = require('../config/prisma');
const { encrypt } = require('../utils/cryptoUtils');
const { EmailAdapterFactory, normalizeProvider, PROVIDERS } = require('../services/email/EmailAdapterFactory');
const { googleOAuthService } = require('../services/email/GoogleOAuthService');
const config = require('../config/env');

const router = express.Router();
const adapterFactory = new EmailAdapterFactory();

function requireEmailIntegrationModel(res) {
  if (!prisma.emailIntegration) {
    res.status(501).json({
      success: false,
      message: 'EmailIntegration Prisma model is not available yet. Run the Prisma migration and generate the client.'
    });
    return false;
  }
  return true;
}

function sanitizeIntegration(integration) {
  if (!integration) return null;
  const { smtpPass, secretRef, ...safe } = integration;
  return {
    ...safe,
    hasSmtpPassword: Boolean(smtpPass),
    hasSecretRef: Boolean(secretRef)
  };
}

function resolveFrontendReturnUrl(returnTo) {
  const fallback = `${config.frontendBaseUrl}/app/integrations`;
  try {
    const frontendOrigin = new URL(config.frontendBaseUrl).origin;
    const candidate = new URL(returnTo || fallback, config.frontendBaseUrl);
    if (candidate.origin !== frontendOrigin) {
      return fallback;
    }
    return candidate.toString();
  } catch (error) {
    return fallback;
  }
}

router.get('/google/connect/:hotelId', async (req, res) => {
  try {
    const hotelId = Number(req.params.hotelId);
    const returnTo = resolveFrontendReturnUrl(req.query.returnTo);

    if (!hotelId) {
      return res.status(400).json({ success: false, message: 'Valid hotelId is required.' });
    }

    const hotel = await prisma.hotel.findUnique({ where: { id: hotelId } });
    if (!hotel) {
      return res.status(404).json({ success: false, message: 'Hotel not found.' });
    }

    const mailboxEmail = req.query.mailboxEmail || hotel.hotelEmail;
    if (!mailboxEmail) {
      return res.status(400).json({
        success: false,
        message: 'mailboxEmail is required. Save the hotel email before starting Google OAuth.'
      });
    }

    const authorizationUrl = googleOAuthService.buildAuthorizationUrl({
      hotelId,
      mailboxEmail,
      returnTo
    });

    if (req.query.mode === 'json') {
      return res.json({ success: true, authorizationUrl });
    }

    return res.redirect(authorizationUrl);
  } catch (error) {
    console.error('[Google OAuth] Failed to start connection:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/google/callback', async (req, res) => {
  let callbackState = null;
  try {
    if (req.query.error) {
      throw new Error(`Google OAuth failed: ${req.query.error_description || req.query.error}`);
    }

    const code = req.query.code;
    if (!code) {
      return res.status(400).json({ success: false, message: 'Google OAuth callback is missing code.' });
    }

    const state = googleOAuthService.verifyState(req.query.state);
    callbackState = state;
    const tokenPayload = await googleOAuthService.exchangeCodeForTokens(code);
    const profile = await googleOAuthService.fetchGmailProfile(tokenPayload.access_token);
    const connectedEmail = String(profile.emailAddress || '').toLowerCase();
    const expectedEmail = String(state.mailboxEmail || '').toLowerCase();

    if (expectedEmail && connectedEmail && expectedEmail !== connectedEmail) {
      throw new Error(`Connected Gmail account ${connectedEmail} does not match expected mailbox ${expectedEmail}.`);
    }

    if (!prisma.emailIntegration) {
      throw new Error('EmailIntegration Prisma model is not available. Run Prisma migration and generate the client.');
    }

    const encryptedTokenPayload = googleOAuthService.encryptTokenPayload(tokenPayload);
    const integration = await prisma.emailIntegration.upsert({
      where: { hotelId: Number(state.hotelId) },
      create: {
        hotelId: Number(state.hotelId),
        provider: PROVIDERS.GOOGLE_WORKSPACE,
        mailboxEmail: connectedEmail || expectedEmail,
        status: 'Connected',
        oauthUserId: connectedEmail || null,
        secretRef: encryptedTokenPayload,
        lastHistoryId: profile.historyId || null,
        lastSyncedAt: new Date()
      },
      update: {
        provider: PROVIDERS.GOOGLE_WORKSPACE,
        mailboxEmail: connectedEmail || expectedEmail,
        status: 'Connected',
        oauthUserId: connectedEmail || null,
        secretRef: encryptedTokenPayload,
        lastHistoryId: profile.historyId || null,
        lastSyncedAt: new Date()
      }
    });

    await prisma.hotel.update({
      where: { id: Number(state.hotelId) },
      data: {
        emailConnected: true,
        emailIntegrationType: PROVIDERS.GOOGLE_WORKSPACE,
        hotelEmail: integration.mailboxEmail
      }
    });

    const returnTo = resolveFrontendReturnUrl(state.returnTo);
    const redirectUrl = new URL(returnTo);
    redirectUrl.searchParams.set('emailProvider', PROVIDERS.GOOGLE_WORKSPACE);
    redirectUrl.searchParams.set('emailStatus', 'connected');
    redirectUrl.searchParams.set('hotelId', String(state.hotelId));

    return res.redirect(redirectUrl.toString());
  } catch (error) {
    console.error('[Google OAuth] Callback failed:', error);
    if (callbackState?.hotelId && prisma.emailIntegration) {
      try {
        await prisma.emailIntegration.update({
          where: { hotelId: Number(callbackState.hotelId) },
          data: { status: 'Error' }
        });
      } catch (statusError) {
        console.error('[Google OAuth] Failed to persist callback error status:', statusError.message);
      }
    }

    const fallbackUrl = new URL(`${config.frontendBaseUrl}/app/integrations`);
    fallbackUrl.searchParams.set('emailProvider', PROVIDERS.GOOGLE_WORKSPACE);
    fallbackUrl.searchParams.set('emailStatus', 'error');
    fallbackUrl.searchParams.set('message', error.message);
    return res.redirect(fallbackUrl.toString());
  }
});

router.get('/:hotelId', async (req, res) => {
  try {
    const hotelId = Number(req.params.hotelId);
    if (!hotelId) {
      return res.status(400).json({ success: false, message: 'Valid hotelId is required.' });
    }

    if (prisma.emailIntegration) {
      const integration = await prisma.emailIntegration.findUnique({ where: { hotelId } });
      if (integration) {
        return res.json({ success: true, integration: sanitizeIntegration(integration) });
      }
    }

    const hotel = await prisma.hotel.findUnique({ where: { id: hotelId } });
    if (!hotel) {
      return res.status(404).json({ success: false, message: 'Hotel not found.' });
    }

    return res.json({
      success: true,
      integration: {
        hotelId,
        provider: normalizeProvider(hotel.emailIntegrationType),
        mailboxEmail: hotel.hotelEmail || hotel.smtpUser,
        status: hotel.emailConnected ? 'Connected' : 'Disconnected',
        smtpHost: hotel.smtpHost,
        smtpPort: hotel.smtpPort,
        smtpUser: hotel.smtpUser,
        hasSmtpPassword: Boolean(hotel.smtpPass),
        source: 'legacy_hotel_fields'
      }
    });
  } catch (error) {
    console.error('[EmailIntegration] Failed to read integration:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/:hotelId/imap-smtp', async (req, res) => {
  if (!requireEmailIntegrationModel(res)) return;

  try {
    const hotelId = Number(req.params.hotelId);
    const {
      mailboxEmail,
      imapHost,
      imapPort,
      imapSecure = true,
      smtpHost,
      smtpPort,
      smtpSecure,
      smtpUser,
      smtpPass
    } = req.body;

    if (!hotelId || !mailboxEmail || !imapHost || !smtpHost || !smtpUser) {
      return res.status(400).json({
        success: false,
        message: 'hotelId, mailboxEmail, imapHost, smtpHost, and smtpUser are required.'
      });
    }

    const encryptedSmtpPass = smtpPass ? encrypt(smtpPass) : undefined;
    const data = {
      provider: PROVIDERS.IMAP_SMTP,
      mailboxEmail,
      status: 'Configured',
      imapHost: imapHost || null,
      imapPort: imapPort ? Number(imapPort) : null,
      imapSecure: Boolean(imapSecure),
      smtpHost,
      smtpPort: smtpPort ? Number(smtpPort) : 587,
      smtpSecure: smtpSecure !== undefined ? Boolean(smtpSecure) : Number(smtpPort) === 465,
      smtpUser
    };

    if (encryptedSmtpPass !== undefined) {
      data.smtpPass = encryptedSmtpPass;
    }

    const integration = await prisma.emailIntegration.upsert({
      where: { hotelId },
      create: { hotelId, ...data, smtpPass: encryptedSmtpPass || null },
      update: data
    });

    await prisma.hotel.update({
      where: { id: hotelId },
      data: {
        emailConnected: true,
        emailIntegrationType: PROVIDERS.IMAP_SMTP,
        hotelEmail: mailboxEmail,
        smtpHost,
        smtpPort: data.smtpPort,
        smtpUser,
        ...(encryptedSmtpPass !== undefined ? { smtpPass: encryptedSmtpPass } : {})
      }
    });

    res.json({ success: true, integration: sanitizeIntegration(integration) });
  } catch (error) {
    console.error('[EmailIntegration] Failed to save IMAP/SMTP integration:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/:hotelId/provider', async (req, res) => {
  if (!requireEmailIntegrationModel(res)) return;

  try {
    const hotelId = Number(req.params.hotelId);
    const provider = normalizeProvider(req.body.provider);
    const mailboxEmail = req.body.mailboxEmail;

    if (!hotelId || !mailboxEmail) {
      return res.status(400).json({ success: false, message: 'hotelId and mailboxEmail are required.' });
    }

    if (![PROVIDERS.GOOGLE_WORKSPACE, PROVIDERS.MICROSOFT_365].includes(provider)) {
      return res.status(400).json({ success: false, message: 'Provider must be GOOGLE_WORKSPACE or MICROSOFT_365.' });
    }

    const integration = await prisma.emailIntegration.upsert({
      where: { hotelId },
      create: {
        hotelId,
        provider,
        mailboxEmail,
        status: 'PendingOAuth',
        oauthTenantId: req.body.oauthTenantId || null,
        oauthUserId: req.body.oauthUserId || null,
        secretRef: req.body.secretRef || null
      },
      update: {
        provider,
        mailboxEmail,
        status: 'PendingOAuth',
        oauthTenantId: req.body.oauthTenantId || null,
        oauthUserId: req.body.oauthUserId || null,
        secretRef: req.body.secretRef || null
      }
    });

    await prisma.hotel.update({
      where: { id: hotelId },
      data: {
        emailConnected: false,
        emailIntegrationType: provider,
        hotelEmail: mailboxEmail
      }
    });

    res.status(202).json({
      success: true,
      integration: sanitizeIntegration(integration),
      message: 'Provider selected. OAuth connection flow still needs to be implemented.'
    });
  } catch (error) {
    console.error('[EmailIntegration] Failed to save provider:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/:hotelId/test', async (req, res) => {
  try {
    const adapter = await adapterFactory.getAdapter(req.params.hotelId);
    const result = await adapter.validateConnection();
    res.json({ success: true, result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;
