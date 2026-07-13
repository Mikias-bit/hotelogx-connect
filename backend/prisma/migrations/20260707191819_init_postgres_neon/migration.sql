-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'operator',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "permissions" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "token" VARCHAR(700) NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "token" VARCHAR(700) NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "revoked" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_resets" (
    "id" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "token" VARCHAR(500) NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_resets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guests" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "loyalty_tier" TEXT,
    "room_number" TEXT,
    "pms_guest_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "spent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'Regular',
    "visits" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "guests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversations" (
    "id" SERIAL NOT NULL,
    "guest_id" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "ai_enabled" BOOLEAN NOT NULL DEFAULT true,
    "confidence_score" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "last_message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booking_states" (
    "conversation_id" INTEGER NOT NULL,
    "check_in_date" TIMESTAMP(3),
    "check_out_date" TIMESTAMP(3),
    "adults" INTEGER,
    "children" INTEGER,
    "room_type" TEXT,
    "selected_room_id" TEXT,
    "selected_rate_id" TEXT,

    CONSTRAINT "booking_states_pkey" PRIMARY KEY ("conversation_id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" SERIAL NOT NULL,
    "conversation_id" INTEGER NOT NULL,
    "sender_type" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "tool_calls" JSONB,
    "tool_call_id" TEXT,
    "channel" TEXT NOT NULL DEFAULT 'WhatsApp',
    "email_message_id" TEXT,
    "email_in_reply_to" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_logs" (
    "id" SERIAL NOT NULL,
    "conversation_id" INTEGER,
    "action_type" TEXT NOT NULL,
    "action_details" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "onboarding_requests" (
    "id" TEXT NOT NULL,
    "request_id" TEXT NOT NULL,
    "hotel_name" TEXT NOT NULL,
    "contact_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "whatsapp" TEXT,
    "pms_provider" TEXT NOT NULL,
    "room_count" TEXT NOT NULL,
    "plan" TEXT NOT NULL DEFAULT 'Pro',
    "status" TEXT NOT NULL DEFAULT 'Request Received',
    "specialist" TEXT NOT NULL DEFAULT 'Unassigned',
    "integration_health" TEXT NOT NULL DEFAULT 'Pending',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "onboarding_token" TEXT,
    "pms_api_key" TEXT,
    "pms_secret" TEXT,
    "smtp_host" TEXT,
    "smtp_pass" TEXT,
    "smtp_user" TEXT,
    "token_expires" TIMESTAMP(3),
    "webhook_url" TEXT,
    "whatsapp_api_key" TEXT,
    "website" TEXT,
    "hotel_type" TEXT,
    "unique_hotel_id" TEXT,
    "messages" TEXT,
    "checklist" TEXT,
    "timeline" TEXT,
    "customization_reqs" TEXT,
    "sop_documents" TEXT,

    CONSTRAINT "onboarding_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hotels" (
    "id" SERIAL NOT NULL,
    "chats_today" INTEGER NOT NULL DEFAULT 0,
    "ai_processed" INTEGER NOT NULL DEFAULT 0,
    "satisfaction" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "escalations" INTEGER NOT NULL DEFAULT 0,
    "monthly_usage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "pms_connected" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "ai_status" TEXT NOT NULL DEFAULT 'Active',
    "created_by" TEXT,
    "email_connected" BOOLEAN NOT NULL DEFAULT false,
    "email_integration_type" TEXT NOT NULL DEFAULT 'SMTP',
    "hotel_code" TEXT,
    "hotel_email" TEXT,
    "hotel_name" TEXT NOT NULL,
    "hotel_phone" TEXT,
    "is_paused" BOOLEAN NOT NULL DEFAULT false,
    "knowledge_base_status" TEXT NOT NULL DEFAULT 'Pending',
    "onboarding_status" TEXT NOT NULL DEFAULT 'Completed',
    "pms_provider" TEXT,
    "subscription_plan" TEXT NOT NULL DEFAULT 'Standard',
    "total_rooms" INTEGER NOT NULL DEFAULT 0,
    "whatsapp_connected" BOOLEAN NOT NULL DEFAULT false,
    "whatsapp_api_key" TEXT,
    "whatsapp_phone_id" TEXT,
    "whatsapp_app_secret" TEXT,
    "whatsapp_verify_token" TEXT,
    "whatsapp_health_status" TEXT NOT NULL DEFAULT 'ok',
    "whatsapp_health_note" TEXT,
    "smtp_host" TEXT,
    "smtp_port" INTEGER,
    "smtp_user" TEXT,
    "smtp_pass" TEXT,
    "pms_api_key" TEXT,
    "pms_secret" TEXT,
    "pms_base_url" TEXT,

    CONSTRAINT "hotels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_integrations" (
    "id" SERIAL NOT NULL,
    "hotel_id" INTEGER NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'IMAP_SMTP',
    "mailbox_email" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Disconnected',
    "oauth_tenant_id" TEXT,
    "oauth_user_id" TEXT,
    "secret_ref" TEXT,
    "imap_host" TEXT,
    "imap_port" INTEGER,
    "imap_secure" BOOLEAN NOT NULL DEFAULT true,
    "smtp_host" TEXT,
    "smtp_port" INTEGER,
    "smtp_secure" BOOLEAN NOT NULL DEFAULT true,
    "smtp_user" TEXT,
    "smtp_pass" TEXT,
    "last_history_id" TEXT,
    "last_delta_link" TEXT,
    "last_uid" INTEGER,
    "uid_validity" TEXT,
    "last_synced_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "email_integrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_message_logs" (
    "id" SERIAL NOT NULL,
    "hotel_id" INTEGER NOT NULL,
    "conversation_id" INTEGER,
    "direction" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_message_id" TEXT,
    "internet_message_id" TEXT,
    "thread_id" TEXT,
    "from_email" TEXT NOT NULL,
    "to_email" TEXT NOT NULL,
    "subject" TEXT,
    "status" TEXT NOT NULL,
    "error_message" TEXT,
    "raw_hash" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_message_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_settings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "global_automation" BOOLEAN NOT NULL DEFAULT true,
    "confidence_threshold" INTEGER NOT NULL DEFAULT 85,
    "human_takeover_enabled" BOOLEAN NOT NULL DEFAULT true,
    "escalation_threshold" INTEGER NOT NULL DEFAULT 65,
    "billing_waiver_limit" DOUBLE PRECISION NOT NULL DEFAULT 30,
    "occupancy_trigger" INTEGER NOT NULL DEFAULT 90,
    "system_alerts_enabled" BOOLEAN NOT NULL DEFAULT true,
    "push_alerts_enabled" BOOLEAN NOT NULL DEFAULT true,
    "communication_voice" TEXT NOT NULL DEFAULT 'Warm & Professional',
    "default_language" TEXT NOT NULL DEFAULT 'Auto-Detect Multilingual',
    "message_signature" TEXT NOT NULL DEFAULT 'Sincerely, the Guest Relations Team',
    "late_checkout_limit" TEXT NOT NULL DEFAULT '2:00 PM',
    "room_upgrade_limit" TEXT NOT NULL DEFAULT 'Standard Rooms Only',
    "vip_escalation_route" TEXT NOT NULL DEFAULT 'Front Desk Manager',
    "refund_escalation_route" TEXT NOT NULL DEFAULT 'Supervisor',
    "sentiment_escalation_route" TEXT NOT NULL DEFAULT 'Human Takeover',
    "confidence_escalation_route" TEXT NOT NULL DEFAULT 'Takeover Queue',
    "shift_paging_enabled" BOOLEAN NOT NULL DEFAULT false,
    "night_duty_enabled" BOOLEAN NOT NULL DEFAULT true,
    "emergency_channel" TEXT NOT NULL DEFAULT 'High Priority Page',
    "enforce_complex_rules" BOOLEAN NOT NULL DEFAULT true,
    "mfa_enabled" BOOLEAN NOT NULL DEFAULT false,
    "session_timeout" TEXT NOT NULL DEFAULT '8 Hours',
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plans" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "duration" TEXT NOT NULL DEFAULT 'Monthly',
    "features" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "billing_history" (
    "id" SERIAL NOT NULL,
    "reference" TEXT NOT NULL,
    "hotel_name" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Paid',
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "billing_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflows" (
    "id" SERIAL NOT NULL,
    "hotel_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "channel" TEXT NOT NULL DEFAULT 'WhatsApp',
    "policy_source" TEXT NOT NULL,
    "escalation_trigger" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "auto_approve_limit" TEXT,
    "occupancy_threshold" TEXT,
    "loyalty_required" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workflows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knowledge_documents" (
    "id" SERIAL NOT NULL,
    "hotel_id" INTEGER NOT NULL,
    "filename" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "doc_type" TEXT NOT NULL,
    "raw_text" TEXT,
    "is_vectorized" BOOLEAN NOT NULL DEFAULT false,
    "vector_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "knowledge_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hotel_settings" (
    "hotel_id" INTEGER NOT NULL,
    "currency_code" TEXT NOT NULL DEFAULT 'USD',
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "language" TEXT NOT NULL DEFAULT 'en',

    CONSTRAINT "hotel_settings_pkey" PRIMARY KEY ("hotel_id")
);

-- CreateTable
CREATE TABLE "hotel_services" (
    "id" SERIAL NOT NULL,
    "hotel_id" INTEGER NOT NULL,
    "mews_service_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "hotel_services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booking_locks" (
    "id" TEXT NOT NULL,
    "hotel_id" INTEGER NOT NULL,
    "service_id" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "booking_locks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tool_execution_logs" (
    "tool_call_id" TEXT NOT NULL,
    "conversation_id" INTEGER NOT NULL,
    "mews_request_id" TEXT,
    "hotel_id" INTEGER NOT NULL,
    "guest_id" INTEGER NOT NULL,
    "tool_name" TEXT NOT NULL,
    "request_payload" TEXT NOT NULL,
    "response_payload" TEXT,
    "status" TEXT NOT NULL,
    "mews_entity_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tool_execution_logs_pkey" PRIMARY KEY ("tool_call_id")
);

-- CreateTable
CREATE TABLE "reservation_caches" (
    "id" TEXT NOT NULL,
    "hotel_id" INTEGER NOT NULL,
    "guest_id" INTEGER NOT NULL,
    "pms_guest_id" TEXT NOT NULL,
    "payload" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reservation_caches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_transaction_logs" (
    "id" TEXT NOT NULL,
    "tool_call_id" TEXT NOT NULL,
    "hotel_id" INTEGER NOT NULL,
    "guest_id" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "mews_payment_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_transaction_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transaction_state_logs" (
    "id" TEXT NOT NULL,
    "tool_call_id" TEXT NOT NULL,
    "mews_request_id" TEXT,
    "payload_hash" VARCHAR(255) NOT NULL,
    "category" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "retry_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transaction_state_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_correction_logs" (
    "id" SERIAL NOT NULL,
    "tool_call_id" TEXT NOT NULL,
    "correction_reason" TEXT NOT NULL,
    "original_state" TEXT NOT NULL,
    "new_state" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_correction_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_token_key" ON "sessions"("token");

-- CreateIndex
CREATE INDEX "sessions_user_id_idx" ON "sessions"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- CreateIndex
CREATE INDEX "refresh_tokens_user_id_idx" ON "refresh_tokens"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "password_resets_token_key" ON "password_resets"("token");

-- CreateIndex
CREATE INDEX "password_resets_user_id_idx" ON "password_resets"("user_id");

-- CreateIndex
CREATE INDEX "conversations_guest_id_idx" ON "conversations"("guest_id");

-- CreateIndex
CREATE INDEX "messages_conversation_id_idx" ON "messages"("conversation_id");

-- CreateIndex
CREATE INDEX "activity_logs_conversation_id_idx" ON "activity_logs"("conversation_id");

-- CreateIndex
CREATE UNIQUE INDEX "onboarding_requests_request_id_key" ON "onboarding_requests"("request_id");

-- CreateIndex
CREATE UNIQUE INDEX "onboarding_requests_onboarding_token_key" ON "onboarding_requests"("onboarding_token");

-- CreateIndex
CREATE UNIQUE INDEX "email_integrations_hotel_id_key" ON "email_integrations"("hotel_id");

-- CreateIndex
CREATE INDEX "email_integrations_provider_idx" ON "email_integrations"("provider");

-- CreateIndex
CREATE INDEX "email_integrations_status_idx" ON "email_integrations"("status");

-- CreateIndex
CREATE INDEX "email_message_logs_hotel_id_direction_created_at_idx" ON "email_message_logs"("hotel_id", "direction", "created_at");

-- CreateIndex
CREATE INDEX "email_message_logs_provider_message_id_idx" ON "email_message_logs"("provider_message_id");

-- CreateIndex
CREATE INDEX "email_message_logs_internet_message_id_idx" ON "email_message_logs"("internet_message_id");

-- CreateIndex
CREATE INDEX "email_message_logs_raw_hash_idx" ON "email_message_logs"("raw_hash");

-- CreateIndex
CREATE UNIQUE INDEX "plans_name_key" ON "plans"("name");

-- CreateIndex
CREATE UNIQUE INDEX "billing_history_reference_key" ON "billing_history"("reference");

-- CreateIndex
CREATE INDEX "workflows_hotel_id_idx" ON "workflows"("hotel_id");

-- CreateIndex
CREATE INDEX "knowledge_documents_hotel_id_idx" ON "knowledge_documents"("hotel_id");

-- CreateIndex
CREATE INDEX "hotel_services_hotel_id_category_idx" ON "hotel_services"("hotel_id", "category");

-- CreateIndex
CREATE UNIQUE INDEX "hotel_services_hotel_id_mews_service_id_key" ON "hotel_services"("hotel_id", "mews_service_id");

-- CreateIndex
CREATE INDEX "booking_locks_expires_at_idx" ON "booking_locks"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "booking_locks_hotel_id_service_id_start_date_end_date_key" ON "booking_locks"("hotel_id", "service_id", "start_date", "end_date");

-- CreateIndex
CREATE UNIQUE INDEX "tool_execution_logs_mews_request_id_key" ON "tool_execution_logs"("mews_request_id");

-- CreateIndex
CREATE INDEX "tool_execution_logs_status_created_at_idx" ON "tool_execution_logs"("status", "created_at");

-- CreateIndex
CREATE INDEX "reservation_caches_hotel_id_guest_id_idx" ON "reservation_caches"("hotel_id", "guest_id");

-- CreateIndex
CREATE UNIQUE INDEX "payment_transaction_logs_tool_call_id_key" ON "payment_transaction_logs"("tool_call_id");

-- CreateIndex
CREATE UNIQUE INDEX "transaction_state_logs_tool_call_id_key" ON "transaction_state_logs"("tool_call_id");

-- CreateIndex
CREATE INDEX "transaction_state_logs_payload_hash_created_at_idx" ON "transaction_state_logs"("payload_hash", "created_at");

-- CreateIndex
CREATE INDEX "transaction_state_logs_state_idx" ON "transaction_state_logs"("state");

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_resets" ADD CONSTRAINT "password_resets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_guest_id_fkey" FOREIGN KEY ("guest_id") REFERENCES "guests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_states" ADD CONSTRAINT "booking_states_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_integrations" ADD CONSTRAINT "email_integrations_hotel_id_fkey" FOREIGN KEY ("hotel_id") REFERENCES "hotels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_message_logs" ADD CONSTRAINT "email_message_logs_hotel_id_fkey" FOREIGN KEY ("hotel_id") REFERENCES "hotels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_message_logs" ADD CONSTRAINT "email_message_logs_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflows" ADD CONSTRAINT "workflows_hotel_id_fkey" FOREIGN KEY ("hotel_id") REFERENCES "hotels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge_documents" ADD CONSTRAINT "knowledge_documents_hotel_id_fkey" FOREIGN KEY ("hotel_id") REFERENCES "hotels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hotel_settings" ADD CONSTRAINT "hotel_settings_hotel_id_fkey" FOREIGN KEY ("hotel_id") REFERENCES "hotels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hotel_services" ADD CONSTRAINT "hotel_services_hotel_id_fkey" FOREIGN KEY ("hotel_id") REFERENCES "hotels"("id") ON DELETE CASCADE ON UPDATE CASCADE;
