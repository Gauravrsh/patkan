CREATE TABLE public.whatsapp_otp_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_e164 text NOT NULL,
  code_hash text NOT NULL,
  expires_at timestamptz NOT NULL,
  attempts integer NOT NULL DEFAULT 0,
  consumed_at timestamptz,
  request_ip_hash text,
  wa_message_id text,
  delivery_status text NOT NULL DEFAULT 'pending',
  delivery_error jsonb,
  status_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX whatsapp_otp_phone_idx ON public.whatsapp_otp_challenges (phone_e164, created_at DESC);
CREATE INDEX whatsapp_otp_ip_idx ON public.whatsapp_otp_challenges (request_ip_hash, created_at DESC);
CREATE UNIQUE INDEX whatsapp_otp_msg_idx ON public.whatsapp_otp_challenges (wa_message_id) WHERE wa_message_id IS NOT NULL;
GRANT ALL ON public.whatsapp_otp_challenges TO service_role;
ALTER TABLE public.whatsapp_otp_challenges ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.whatsapp_identities (
  phone_e164 text PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE,
  verified_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.whatsapp_identities TO authenticated;
GRANT ALL ON public.whatsapp_identities TO service_role;
ALTER TABLE public.whatsapp_identities ENABLE ROW LEVEL SECURITY;
CREATE POLICY wa_identity_select_own ON public.whatsapp_identities FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.whatsapp_webhook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  delivery_id text NOT NULL UNIQUE,
  event text NOT NULL,
  payload jsonb NOT NULL,
  received_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz,
  processing_error text
);
GRANT ALL ON public.whatsapp_webhook_events TO service_role;
ALTER TABLE public.whatsapp_webhook_events ENABLE ROW LEVEL SECURITY;