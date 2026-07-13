# Email Adapter Architecture

## Current State

The backend currently supports:

- Inbound email through a generic `POST /api/webhooks/email/:hotelId` webhook.
- Outbound guest email through `src/services/emailService.js` using SMTP/Nodemailer.
- Hotel-level fields for `emailConnected`, `emailIntegrationType`, `hotelEmail`, `smtpHost`, `smtpPort`, `smtpUser`, and `smtpPass`.

The backend does not yet have provider-specific adapters for Gmail API, Microsoft Graph, IMAP polling, provider OAuth, Pub/Sub subscribers, or durable email sync state.

## Required Provider Categories

### Category 1: Google Workspace

Use Gmail API directly for both receiving and sending.

Implemented backend connection endpoints:

- `GET /api/email-integrations/google/connect/:hotelId`
- `GET /api/email-integrations/google/connect/:hotelId?mode=json`
- `GET /api/email-integrations/google/callback`

Required backend environment variables:

```env
GOOGLE_OAUTH_CLIENT_ID="..."
GOOGLE_OAUTH_CLIENT_SECRET="..."
GOOGLE_OAUTH_REDIRECT_URI="http://localhost:5000/api/email-integrations/google/callback"
BACKEND_BASE_URL="http://localhost:5000"
FRONTEND_BASE_URL="http://localhost:5173"
```

The Google Cloud OAuth client must register the exact redirect URI above for local development, and the deployed Cloud Run callback URL for production.

The frontend should start the connection by sending the operator to:

```text
GET /api/email-integrations/google/connect/:hotelId
```

or request JSON first:

```text
GET /api/email-integrations/google/connect/:hotelId?mode=json&mailboxEmail=reservations@example.com&returnTo=http://localhost:5173/integrations
```

Then redirect the browser to `authorizationUrl`.

Receive flow:

1. Hotel connects Google Workspace mailbox through OAuth, or through domain-wide delegation for enterprise-managed tenants.
2. Store encrypted refresh token or service-account delegation configuration.
3. Register Gmail `users.watch` against a Google Pub/Sub topic.
4. Gmail publishes mailbox changes to Pub/Sub.
5. Pub/Sub pushes to the backend endpoint, for example:
   `POST /api/webhooks/email/google/pubsub`
6. Backend validates the Pub/Sub message, loads the hotel integration, calls Gmail History API, fetches new messages, normalizes them, deduplicates them, and passes them to `AutomationEngine.handleIncomingMessage(...)`.

Send flow:

1. AutomationEngine calls a provider-neutral email service.
2. Email adapter factory resolves `GOOGLE_WORKSPACE`.
3. Gmail adapter sends through `users.messages.send`.
4. Store outgoing `Message-ID`, thread id, status, and delivery error if any.

Important details:

- Gmail watch expires and must be renewed periodically.
- Store `historyId` per connected mailbox to process only new messages.
- Use Gmail thread ids plus RFC `Message-ID` for conversation threading.
- Do not use SMTP for Google Workspace unless the hotel explicitly chooses fallback mode.

### Category 2: Microsoft 365

Use Microsoft Graph API directly for both receiving and sending.

Receive flow:

1. Hotel connects Microsoft 365 mailbox through OAuth/admin consent.
2. Store encrypted refresh token or application permission configuration.
3. Create Microsoft Graph change notification subscription for the mailbox.
4. Microsoft posts notifications to:
   `POST /api/webhooks/email/microsoft/notifications`
5. Backend validates `clientState`, handles validation token requests, then uses Graph delta queries to fetch message changes.
6. Normalize messages and pass them to AutomationEngine.

Send flow:

1. AutomationEngine calls the provider-neutral email service.
2. Email adapter factory resolves `MICROSOFT_365`.
3. Microsoft adapter sends through Graph `sendMail` or draft/reply endpoints.
4. Store Graph message id, internet message id, thread/conversation id, status, and errors.

Important details:

- Graph subscriptions expire and must be renewed.
- Use delta links for reliable catch-up after missed notifications.
- Validate subscription `clientState`; do not accept unauthenticated notification payloads.
- For replies, prefer Graph reply/createReply flow when possible to preserve threading.

### Category 3: IMAP + SMTP For Other Hosting

Use IMAP for receiving and SMTP for sending. Examples: Hostinger, cPanel mailboxes, private hosting, generic mail providers.

Receive flow:

1. Hotel enters IMAP host, port, username, and password/app-password.
2. Backend stores secrets encrypted or in Google Secret Manager.
3. Cloud Scheduler publishes a message to a Pub/Sub topic, for example `email-imap-poll`.
4. Pub/Sub triggers a Cloud Run worker endpoint or Cloud Run Job.
5. Worker polls configured IMAP accounts, fetches unseen or UID-greater-than-last-seen messages, normalizes them, deduplicates them, and passes them to AutomationEngine.

Send flow:

1. AutomationEngine calls the provider-neutral email service.
2. Email adapter factory resolves `IMAP_SMTP`.
3. SMTP adapter sends through Nodemailer using the hotel's SMTP configuration.
4. Store SMTP response, generated message id, status, and errors.

Important details:

- IMAP should not run as an always-on loop inside the web service on Cloud Run.
- Polling state must be durable: store last UID, UIDVALIDITY, folder, and last successful poll time.
- Use Cloud Scheduler + Pub/Sub for periodic polling, for example every 1-5 minutes.
- Use IMAP IDLE only if running on a worker platform designed for long-lived connections; standard Cloud Run request handling is better with scheduled polling.

## Adapter Boundary

Create a provider-neutral adapter contract:

```js
class EmailProviderAdapter {
  async validateConnection(hotelId) {}
  async sendEmail(hotelId, message) {}
  async fetchInboundChanges(hotelId, cursor) {}
  async normalizeInbound(rawMessage) {}
  async renewSubscription(hotelId) {}
}
```

Recommended folder structure:

```text
src/services/email/
  EmailAdapterFactory.js
  EmailOrchestrator.js
  adapters/
    GoogleWorkspaceEmailAdapter.js
    MicrosoftGraphEmailAdapter.js
    ImapSmtpEmailAdapter.js
  normalizeEmailMessage.js
  emailDeduplicationService.js
  emailThreadingService.js
  emailSyncStateService.js
```

`AutomationEngine` should not know whether the hotel uses Gmail, Graph, or IMAP/SMTP. It should call one provider-neutral service, for example:

```js
emailOrchestrator.sendGuestReply({
  hotelId,
  to,
  subject,
  html,
  references,
  inReplyTo,
  conversationId
});
```

Inbound adapters should normalize everything into one shape:

```js
{
  provider: 'GOOGLE_WORKSPACE' | 'MICROSOFT_365' | 'IMAP_SMTP',
  providerMessageId: '...',
  internetMessageId: '<...>',
  threadId: '...',
  fromEmail: 'guest@example.com',
  toEmail: 'reservations@hotel.com',
  subject: '...',
  text: '...',
  html: '...',
  receivedAt: '2026-06-26T10:00:00.000Z',
  references: '...',
  inReplyTo: '<...>'
}
```

## Database Changes

The current `Hotel` table has SMTP fields, but production email needs separate provider credentials and sync state.

Add an `EmailIntegration` model:

```prisma
model EmailIntegration {
  id             Int      @id @default(autoincrement())
  hotelId        Int      @unique
  provider       String
  mailboxEmail   String
  status         String   @default("Disconnected")
  oauthTenantId  String?
  oauthUserId    String?
  secretRef      String?
  imapHost       String?
  imapPort       Int?
  imapSecure     Boolean  @default(true)
  smtpHost       String?
  smtpPort       Int?
  smtpSecure     Boolean  @default(true)
  lastHistoryId  String?
  lastDeltaLink  String?  @db.Text
  lastUid        Int?
  uidValidity    String?
  lastSyncedAt   DateTime?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  hotel Hotel @relation(fields: [hotelId], references: [id])
}
```

Add an `EmailDelivery` or `EmailMessageLog` model:

```prisma
model EmailMessageLog {
  id                Int      @id @default(autoincrement())
  hotelId           Int
  conversationId    Int?
  direction         String
  provider          String
  providerMessageId String?
  internetMessageId String?
  threadId          String?
  fromEmail         String
  toEmail           String
  subject           String?
  status            String
  errorMessage      String?  @db.Text
  rawHash           String?
  createdAt         DateTime @default(now())
}
```

This replaces the current in-memory duplicate tracking with durable database idempotency.

## Backend Changes

Required changes:

1. Replace direct `emailService.sendGuestEmail(...)` calls in `AutomationEngine.js` with `emailOrchestrator.sendGuestReply(...)`.
2. Keep the current generic email webhook only as a legacy/manual provider endpoint, or route it through the same orchestrator.
3. Add provider-specific webhook routes:
   - `POST /api/webhooks/email/google/pubsub`
   - `POST /api/webhooks/email/microsoft/notifications`
   - `POST /api/workers/email/imap-poll`
4. Add OAuth/connect routes:
   - `GET /api/email-integrations/google/connect`
   - `GET /api/email-integrations/google/callback`
   - `GET /api/email-integrations/microsoft/connect`
   - `GET /api/email-integrations/microsoft/callback`
   - `POST /api/email-integrations/imap-smtp`
   - `POST /api/email-integrations/:id/test`
5. Add subscription renewal worker:
   - Gmail watch renewal.
   - Microsoft Graph subscription renewal.
6. Store all provider secrets in Google Secret Manager, not plaintext Prisma columns.
7. Make outbound delivery failures visible in the dashboard instead of logging success after failure.

## Frontend Changes

The current integration UI is SMTP-centered. Replace it with a provider selector:

- Google Workspace: show "Connect Google Workspace" OAuth button.
- Microsoft 365: show "Connect Microsoft 365" OAuth/admin-consent button.
- Other Email Hosting: show IMAP and SMTP settings.

For generic IMAP/SMTP, collect:

- Mailbox email.
- IMAP host, port, secure true/false.
- IMAP username.
- IMAP password/app-password.
- SMTP host, port, secure true/false.
- SMTP username.
- SMTP password/app-password.

Show connection status:

- Connected / Disconnected / Needs Reauth / Polling Failed / Sending Failed.
- Last inbound sync time.
- Last outbound send status.
- Provider type.

## Google Cloud Run Deployment Shape

Use separate services/jobs:

```text
Cloud Run API service
  - Express API
  - OAuth callbacks
  - Gmail Pub/Sub push endpoint
  - Microsoft webhook endpoint
  - Legacy inbound webhook endpoint

Cloud Run worker service or job
  - IMAP polling handler
  - Gmail watch renewal
  - Microsoft subscription renewal

Pub/Sub topics
  - email-gmail-notifications
  - email-imap-poll
  - email-subscription-renewal

Cloud Scheduler
  - Publish to email-imap-poll every 1-5 minutes
  - Publish to email-subscription-renewal hourly/daily

Secret Manager
  - OAuth client secrets
  - Per-hotel refresh tokens or token references
  - IMAP/SMTP credentials
```

Do not process inbound email only in memory. Cloud Run instances can scale down, restart, or run concurrently, so deduplication and sync cursors must be stored in the database.

## Python Orchestration Option

If orchestration is done with Python, keep the Node backend as the API and conversation engine, and run Python only as a worker/orchestrator.

Recommended Python responsibilities:

- IMAP polling.
- Pub/Sub message consumption.
- Gmail History API fetching if preferred.
- Microsoft Graph delta fetching if preferred.
- Subscription renewal jobs.

The Python worker should call a backend internal endpoint with normalized email payloads, for example:

```http
POST /api/internal/email/inbound
Authorization: Bearer <internal-service-token>
```

Node should remain the owner of:

- Tenant lookup.
- Guest/conversation matching.
- AutomationEngine execution.
- PMS actions.
- Dashboard API.

This avoids duplicating business logic between Python and Node.

## Implementation Priority

1. Add database models for email integrations, sync state, and delivery logs.
2. Create `EmailAdapterFactory` and `EmailOrchestrator`.
3. Move SMTP sending behind `ImapSmtpEmailAdapter`.
4. Update `AutomationEngine` to call the orchestrator instead of SMTP directly.
5. Add IMAP polling worker first because it covers non-Google/non-Microsoft providers and can be tested without OAuth.
6. Add Google Workspace OAuth, Gmail send, Gmail watch, and History API sync.
7. Add Microsoft OAuth/admin consent, Graph sendMail, notifications, and delta sync.
8. Update frontend integration setup.
9. Add integration tests for inbound normalization, deduplication, threading, and outbound failure logging.
