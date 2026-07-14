ALTER TABLE "email_integrations"
ADD COLUMN IF NOT EXISTS "watch_expires_at" TIMESTAMP(3);
